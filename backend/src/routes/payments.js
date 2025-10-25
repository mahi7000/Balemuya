const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

/**
 * @route   POST /api/payments/initialize
 * @desc    Initialize payment
 * @access  Private
 */
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentMethod = 'CHAPA' } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: req.user.id
      },
      include: {
        payments: {
          where: { status: { in: ['PENDING', 'PROCESSING'] } }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.payments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment already initialized for this order'
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: req.user.id,
        amount: order.total,
        paymentMethod,
        status: 'PENDING'
      }
    });

    // Generate payment URL based on payment method
    let paymentUrl = '';
    let transactionId = payment.id;

    switch (paymentMethod) {
      case 'CHAPA':
        paymentUrl = await initializeChapaPayment(payment);
        break;
      case 'CBE_BIRR':
        paymentUrl = await initializeCbeBirrPayment(payment);
        break;
      case 'STRIPE':
        paymentUrl = await initializeStripePayment(payment);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    // Update payment with transaction details
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId,
        paymentUrl
      }
    });

    res.json({
      success: true,
      data: {
        paymentUrl,
        transactionId,
        amount: order.total,
        currency: 'ETB'
      }
    });

  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/payments/verify/:transactionId
 * @desc    Verify payment transaction
 * @access  Private
 */
router.post('/verify/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Get payment
    const payment = await prisma.payment.findFirst({
      where: {
        id: transactionId,
        userId: req.user.id
      },
      include: {
        order: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify payment with payment gateway
    let verificationResult;
    switch (payment.paymentMethod) {
      case 'CHAPA':
        verificationResult = await verifyChapaPayment(transactionId);
        break;
      case 'CBE_BIRR':
        verificationResult = await verifyCbeBirrPayment(transactionId);
        break;
      case 'STRIPE':
        verificationResult = await verifyStripePayment(transactionId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }

    if (verificationResult.success) {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date()
        }
      });

      // Update order payment status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });

      // Send order confirmation email
      try {
        const { sendOrderConfirmation } = require('../utils/email');
        await sendOrderConfirmation(
          req.user.email,
          req.user.firstName,
          payment.order
        );
      } catch (emailError) {
        console.error('Order confirmation email failed:', emailError);
      }
    }

    res.json({
      success: true,
      data: {
        transactionId,
        status: verificationResult.success ? 'SUCCESS' : 'FAILED',
        orderId: payment.orderId,
        amount: payment.amount,
        paidAt: verificationResult.success ? new Date() : null
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/payments/order/:orderId
 * @desc    Get payment for order
 * @access  Private
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        userId: req.user.id
      },
      select: {
        id: true,
        status: true,
        amount: true,
        paymentMethod: true,
        transactionId: true,
        paidAt: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/payments/webhook/chapa
 * @desc    Chapa webhook handler
 * @access  Public
 */
router.post('/webhook/chapa', async (req, res) => {
  try {
    const { transaction_id, status, amount } = req.body;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: { transactionId: transaction_id },
      include: { order: true }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    const paymentStatus = status === 'success' ? 'COMPLETED' : 'FAILED';
    
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        paidAt: paymentStatus === 'COMPLETED' ? new Date() : null
      }
    });

    // Update order status if payment successful
    if (paymentStatus === 'COMPLETED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Chapa webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * @route   POST /api/payments/webhook/cbe-birr
 * @desc    CBE Birr webhook handler
 * @access  Public
 */
router.post('/webhook/cbe-birr', async (req, res) => {
  try {
    const { transactionId, status, amount } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
      include: { order: true }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    const paymentStatus = status === 'success' ? 'COMPLETED' : 'FAILED';
    
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        paidAt: paymentStatus === 'COMPLETED' ? new Date() : null
      }
    });

    // Update order status if payment successful
    if (paymentStatus === 'COMPLETED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('CBE Birr webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Payment gateway integration functions

/**
 * Initialize Chapa payment
 */
async function initializeChapaPayment(payment) {
  // This would integrate with Chapa API
  // For now, return a mock URL
  return `https://checkout.chapa.co/checkout/payment/${payment.id}`;
}

/**
 * Initialize CBE Birr payment
 */
async function initializeCbeBirrPayment(payment) {
  // This would integrate with CBE Birr API
  // For now, return a mock URL
  return `https://cbe-birr.com/payment/${payment.id}`;
}

/**
 * Initialize Stripe payment
 */
async function initializeStripePayment(payment) {
  // This would integrate with Stripe API
  // For now, return a mock URL
  return `https://checkout.stripe.com/pay/${payment.id}`;
}

/**
 * Verify Chapa payment
 */
async function verifyChapaPayment(transactionId) {
  // This would integrate with Chapa API to verify payment
  // For now, return mock success
  return { success: true };
}

/**
 * Verify CBE Birr payment
 */
async function verifyCbeBirrPayment(transactionId) {
  // This would integrate with CBE Birr API to verify payment
  // For now, return mock success
  return { success: true };
}

/**
 * Verify Stripe payment
 */
async function verifyStripePayment(transactionId) {
  // This would integrate with Stripe API to verify payment
  // For now, return mock success
  return { success: true };
}

module.exports = router;
