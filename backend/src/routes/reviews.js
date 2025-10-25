const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Submit a review
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      productId,
      orderId,
      rating,
      comment,
      images = []
    } = req.body;

    // Validation
    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, Order ID, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: req.user.id,
        status: 'DELIVERED'
      },
      include: {
        items: {
          where: { productId },
          include: {
            product: {
              select: {
                sellerId: true
              }
            }
          }
        }
      }
    });

    if (!order || order.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order not found or not delivered'
      });
    }

    const sellerId = order.items[0].product.sellerId;

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: req.user.id
      }
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'Review already exists for this product'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        orderId,
        userId: req.user.id,
        sellerId,
        rating,
        comment,
        images,
        isVerified: true
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true
      }
    });

    // Update product and seller ratings
    await updateProductRating(productId);
    await updateSellerRating(sellerId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get product reviews
 * @access  Public
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get product reviews
    const [reviews, totalReviews, ratingDistribution] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        select: {
          id: true,
          rating: true,
          comment: true,
          images: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({
        where: { productId }
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { id: true }
      })
    ]);

    // Get average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true }
    });

    // Format rating distribution
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    ratingDistribution.forEach(item => {
      distribution[item.rating] = item._count.id;
    });

    res.json({
      success: true,
      data: {
        averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
        totalReviews,
        reviews: reviews.map(review => ({
          ...review,
          author: {
            firstName: review.user.firstName,
            lastName: review.user.lastName,
            avatar: review.user.avatar
          }
        })),
        ratingDistribution: distribution
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/reviews/seller/:sellerId
 * @desc    Get seller reviews
 * @access  Public
 */
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get seller reviews
    const [reviews, totalReviews] = await Promise.all([
      prisma.review.findMany({
        where: { sellerId },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              images: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({
        where: { sellerId }
      })
    ]);

    // Get average rating
    const avgRating = await prisma.review.aggregate({
      where: { sellerId },
      _avg: { rating: true }
    });

    res.json({
      success: true,
      data: {
        averageRating: Math.round((avgRating._avg.rating || 0) * 10) / 10,
        totalReviews,
        reviews: reviews.map(review => ({
          ...review,
          author: {
            firstName: review.user.firstName,
            lastName: review.user.lastName,
            avatar: review.user.avatar
          }
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          totalPages: Math.ceil(totalReviews / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get seller reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;

    // Check if review exists and belongs to user
    const review = await prisma.review.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating || review.rating,
        comment: comment || review.comment,
        images: images || review.images
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        updatedAt: true
      }
    });

    // Update product and seller ratings
    await updateProductRating(review.productId);
    await updateSellerRating(review.sellerId);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if review exists and belongs to user
    const review = await prisma.review.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or access denied'
      });
    }

    // Delete review
    await prisma.review.delete({
      where: { id }
    });

    // Update product and seller ratings
    await updateProductRating(review.productId);
    await updateSellerRating(review.sellerId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get user's reviews
 * @access  Private
 */
router.get('/my-reviews', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalReviews] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              images: true
            }
          },
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
      prisma.review.count({
        where: { userId: req.user.id }
      })
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          totalPages: Math.ceil(totalReviews / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper functions

/**
 * Update product rating
 */
async function updateProductRating(productId) {
  const stats = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true }
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: stats._avg.rating,
      reviewCount: stats._count.id
    }
  });
}

/**
 * Update seller rating
 */
async function updateSellerRating(sellerId) {
  const stats = await prisma.review.aggregate({
    where: { sellerId },
    _avg: { rating: true },
    _count: { id: true }
  });

  await prisma.user.update({
    where: { id: sellerId },
    data: {
      averageRating: stats._avg.rating,
      reviewCount: stats._count.id
    }
  });
}

module.exports = router;
