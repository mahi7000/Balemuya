const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireSeller, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      items,
      shippingAddressId,
      deliveryOption = 'SELLER_DELIVERY',
      paymentMethod = 'CHAPA',
      notes
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddressId) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Verify shipping address belongs to user
    const shippingAddress = await prisma.address.findFirst({
      where: {
        id: shippingAddressId,
        userId: req.user.id
      }
    });

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address'
      });
    }

    // Get products and validate
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isPublished: true
      },
      include: {
        seller: {
          select: { id: true, storeName: true }
        }
      }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found'
      });
    }

    // Check if all items are from the same seller
    const sellerIds = [...new Set(products.map(p => p.seller.id))];
    if (sellerIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'All items must be from the same seller'
      });
    }

    const sellerId = sellerIds[0];

    // Validate quantities and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${product.title}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Calculate shipping (simplified - you might want to implement more complex logic)
    const shipping = deliveryOption === 'PLATFORM_DELIVERY' ? 50 : 0;
    const tax = 0; // No tax for now
    const total = subtotal + shipping + tax;

    // Generate order number
    const orderNumber = `BALMUYA-${Date.now()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: req.user.id,
        sellerId,
        shippingAddressId,
        subtotal,
        shipping,
        tax,
        total,
        deliveryOption,
        notes,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        seller: {
          select: {
            storeName: true
          }
        }
      }
    });

    // Initialize payment
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: req.user.id,
        amount: total,
        paymentMethod,
        status: 'PENDING'
      }
    });

    // Generate payment URL (this would integrate with actual payment gateway)
    const paymentUrl = `https://checkout.chapa.co/checkout/payment/transaction_${payment.id}`;

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          items: order.items.map(item => ({
            productId: item.productId,
            productName: item.product.title,
            quantity: item.quantity,
            price: item.price
          })),
          paymentStatus: order.paymentStatus
        },
        payment: {
          paymentUrl,
          transactionId: payment.id
        }
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { buyerId: req.user.id };
    if (status) {
      where.status = status.toUpperCase();
    }

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          itemCount: true,
          createdAt: true,
          seller: {
            select: {
              storeName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { buyerId: req.user.id },
          { sellerId: req.user.id }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        seller: {
          select: {
            storeName: true,
            phone: true
          }
        },
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            paymentMethod: true,
            transactionId: true,
            paidAt: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Seller/Admin)
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    // Check if user can update this order
    const order = await prisma.order.findFirst({
      where: {
        id,
        OR: [
          { sellerId: req.user.id },
          { buyerId: req.user.id, role: 'ADMIN' }
        ]
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    // Validate status transition
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [],
      'CANCELLED': [],
      'REFUNDED': []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: updatedOrder.id,
        previousStatus: order.status,
        newStatus: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/orders/seller/my-orders
 * @desc    Get seller's orders
 * @access  Private (Seller)
 */
router.get('/seller/my-orders', authenticateToken, requireSeller, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { sellerId: req.user.id };
    if (status) {
      where.status = status.toUpperCase();
    }

    const [orders, totalOrders, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          buyer: {
            select: {
              firstName: true,
              lastName: true,
              city: true
            }
          },
          items: {
            select: {
              product: {
                select: {
                  title: true
                }
              },
              quantity: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        where: { sellerId: req.user.id },
        _count: { id: true }
      })
    ]);

    // Format status counts
    const stats = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0
    };

    statusCounts.forEach(count => {
      const status = count.status.toLowerCase();
      if (stats.hasOwnProperty(status)) {
        stats[status] = count._count.id;
      }
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / parseInt(limit))
        },
        stats
      }
    });

  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if order can be cancelled
    const order = await prisma.order.findFirst({
      where: {
        id,
        buyerId: req.user.id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: req.user.id,
        cancellationReason: reason
      }
    });

    // Process refund if payment was completed
    let refundAmount = 0;
    if (order.paymentStatus === 'COMPLETED') {
      refundAmount = order.total;
      
      // Update payment status
      await prisma.payment.updateMany({
        where: { orderId: id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundAmount
        }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        refundAmount
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
