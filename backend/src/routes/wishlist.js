const express = require('express');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [wishlistItems, totalItems] = await Promise.all([
      prisma.wishlistItem.findMany({
        where: { userId: req.user.id },
        select: {
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              comparePrice: true,
              images: true,
              averageRating: true,
              reviewCount: true,
              isPublished: true,
              seller: {
                select: {
                  id: true,
                  storeName: true,
                  averageRating: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.wishlistItem.count({
        where: { userId: req.user.id }
      })
    ]);

    // Filter out unpublished products
    const validItems = wishlistItems.filter(item => item.product.isPublished);

    res.json({
      success: true,
      data: validItems.map(item => ({
        id: item.id,
        product: item.product,
        addedAt: item.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: validItems.length,
        totalPages: Math.ceil(validItems.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is published
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isPublished: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId
      },
      select: {
        id: true,
        productId: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        id: wishlistItem.id,
        productId: wishlistItem.productId,
        addedAt: wishlistItem.createdAt
      }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if item exists in wishlist
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id }
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/wishlist/check/:productId
 * @desc    Check if product is in wishlist
 * @access  Private
 */
router.get('/check/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user.id,
        productId
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        inWishlist: !!wishlistItem,
        addedAt: wishlistItem?.createdAt
      }
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/wishlist/clear
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.post('/clear', authenticateToken, async (req, res) => {
  try {
    // Delete all wishlist items for user
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/wishlist/count
 * @desc    Get wishlist item count
 * @access  Private
 */
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.wishlistItem.count({
      where: { userId: req.user.id }
    });

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/wishlist/move-to-cart/:productId
 * @desc    Move product from wishlist to cart (placeholder for future cart functionality)
 * @access  Private
 */
router.post('/move-to-cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product is in wishlist
    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove from wishlist
    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id }
    });

    // In a real implementation, you would add to cart here
    // For now, just return success
    res.json({
      success: true,
      message: 'Product moved to cart (cart functionality not implemented yet)'
    });

  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
