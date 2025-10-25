const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireSeller, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        storeName: true,
        bio: true,
        kycStatus: true,
        isPremiumSeller: true,
        premiumExpiresAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar, storeName, bio } = req.body;

    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    
    // Seller-specific fields
    if (req.user.role === 'SELLER' || req.user.role === 'ADMIN') {
      if (storeName) updateData.storeName = storeName;
      if (bio) updateData.bio = bio;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        storeName: true,
        bio: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/seller-stats
 * @desc    Get seller statistics
 * @access  Private (Seller)
 */
router.get('/seller-stats', authenticateToken, requireSeller, async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get basic stats
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      reviews
    ] = await Promise.all([
      prisma.product.count({
        where: { sellerId }
      }),
      prisma.order.count({
        where: { sellerId }
      }),
      prisma.order.aggregate({
        where: { 
          sellerId,
          paymentStatus: 'COMPLETED'
        },
        _sum: { total: true }
      }),
      prisma.order.count({
        where: { 
          sellerId,
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      }),
      prisma.review.findMany({
        where: { sellerId },
        select: { rating: true }
      })
    ]);

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Get monthly sales for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        sellerId,
        paymentStatus: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { total: true },
      orderBy: { createdAt: 'asc' }
    });

    // Format monthly sales data
    const monthlySalesData = monthlySales.map(sale => ({
      month: sale.createdAt.toLocaleDateString('en-US', { month: 'short' }),
      sales: parseFloat(sale._sum.total || 0)
    }));

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue._sum.total || 0),
        pendingOrders,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        monthlySales: monthlySalesData
      }
    });

  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users/kyc-verification
 * @desc    Submit KYC documents
 * @access  Private (Seller)
 */
router.post('/kyc-verification', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { documents, personalInfo } = req.body;

    if (!documents || !personalInfo) {
      return res.status(400).json({
        success: false,
        message: 'Documents and personal information are required'
      });
    }

    const { idCard, selfieWithId, proofOfAddress } = documents;
    const { dateOfBirth, address } = personalInfo;

    if (!idCard || !selfieWithId || !proofOfAddress) {
      return res.status(400).json({
        success: false,
        message: 'All required documents must be provided'
      });
    }

    if (!dateOfBirth || !address) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth and address are required'
      });
    }

    // Check if KYC is already submitted
    const existingKYC = await prisma.kycDocument.findFirst({
      where: { userId: req.user.id }
    });

    if (existingKYC && existingKYC.status !== 'REJECTED') {
      return res.status(409).json({
        success: false,
        message: 'KYC verification already submitted'
      });
    }

    // Create or update KYC document
    const kycDocument = await prisma.kycDocument.upsert({
      where: { userId: req.user.id },
      update: {
        idCard,
        selfieWithId,
        proofOfAddress,
        personalInfo: {
          dateOfBirth,
          address
        },
        status: 'UNDER_REVIEW',
        submittedAt: new Date()
      },
      create: {
        userId: req.user.id,
        idCard,
        selfieWithId,
        proofOfAddress,
        personalInfo: {
          dateOfBirth,
          address
        },
        status: 'UNDER_REVIEW'
      }
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: req.user.id },
      data: { kycStatus: 'UNDER_REVIEW' }
    });

    res.status(201).json({
      success: true,
      message: 'KYC verification submitted successfully',
      data: {
        kycStatus: 'UNDER_REVIEW',
        submittedAt: kycDocument.submittedAt
      }
    });

  } catch (error) {
    console.error('KYC verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/:id/storefront
 * @desc    Get seller storefront
 * @access  Public
 */
router.get('/:id/storefront', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get seller info
    const seller = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        storeName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        averageRating: true,
        reviewCount: true
      }
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Get seller's products
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          sellerId: id,
          isPublished: true
        },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          averageRating: true,
          reviewCount: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({
        where: {
          sellerId: id,
          isPublished: true
        }
      })
    ]);

    // Get seller reviews
    const reviews = await prisma.review.findMany({
      where: { sellerId: id },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        seller: {
          ...seller,
          joinedDate: seller.createdAt,
          averageRating: parseFloat(seller.averageRating || 0),
          totalReviews: seller.reviewCount
        },
        products,
        reviews: reviews.map(review => ({
          ...review,
          authorName: `${review.user.firstName} ${review.user.lastName}`
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get storefront error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/addresses
 * @desc    Get user addresses
 * @access  Private
 */
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: addresses
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault = false
    } = req.body;

    if (!firstName || !lastName || !phone || !street || !city || !state || !country) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        firstName,
        lastName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault
      }
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/addresses/:id
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault = false
    } = req.body;

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault
      }
    });

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/users/addresses/:id
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await prisma.address.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
