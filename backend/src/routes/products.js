const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireSeller, requireKYC, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      sellerId
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      isPublished: true,
      status: 'PUBLISHED'
    };

    if (category) {
      where.categoryId = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Build orderBy clause
    let orderBy = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
    }

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          comparePrice: true,
          images: true,
          category: {
            select: { id: true, name: true }
          },
          seller: {
            select: {
              id: true,
              storeName: true,
              averageRating: true
            }
          },
          averageRating: true,
          reviewCount: true,
          isPublished: true,
          createdAt: true
        },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalProducts,
          totalPages: Math.ceil(totalProducts / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        comparePrice: true,
        quantity: true,
        sku: true,
        weight: true,
        dimensions: true,
        images: true,
        video: true,
        tags: true,
        specifications: true,
        status: true,
        isPublished: true,
        isFeatured: true,
        averageRating: true,
        reviewCount: true,
        salesCount: true,
        createdAt: true,
        category: {
          select: { id: true, name: true }
        },
        seller: {
          select: {
            id: true,
            storeName: true,
            averageRating: true,
            reviewCount: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Seller)
 */
router.post('/', authenticateToken, requireSeller, requireKYC, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      comparePrice,
      quantity,
      categoryId,
      tags = [],
      images = [],
      video,
      weight,
      dimensions,
      specifications,
      isPublished = false
    } = req.body;

    // Validation
    if (!title || !description || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, price, and category are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        quantity: parseInt(quantity) || 0,
        categoryId,
        tags,
        images,
        video,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        specifications,
        isPublished,
        sellerId: req.user.id
      },
      select: {
        id: true,
        title: true,
        price: true,
        quantity: true,
        isPublished: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (Seller)
 */
router.put('/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists and belongs to seller
    const product = await prisma.product.findFirst({
      where: {
        id,
        sellerId: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    // Validate price if provided
    if (updateData.price && updateData.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        price: updateData.price ? parseFloat(updateData.price) : undefined,
        comparePrice: updateData.comparePrice ? parseFloat(updateData.comparePrice) : undefined,
        quantity: updateData.quantity ? parseInt(updateData.quantity) : undefined
      },
      select: {
        id: true,
        title: true,
        price: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Seller)
 */
router.delete('/:id', authenticateToken, requireSeller, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to seller
    const product = await prisma.product.findFirst({
      where: {
        id,
        sellerId: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied'
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/products/seller/my-products
 * @desc    Get seller's products
 * @access  Private (Seller)
 */
router.get('/seller/my-products', authenticateToken, requireSeller, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = { sellerId: req.user.id };
    
    if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'draft') {
      where.isPublished = false;
    }

    const [products, totalProducts, stats] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          title: true,
          price: true,
          quantity: true,
          images: true,
          isPublished: true,
          salesCount: true,
          averageRating: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where }),
      prisma.product.groupBy({
        by: ['isPublished'],
        where: { sellerId: req.user.id },
        _count: { id: true }
      })
    ]);

    // Calculate stats
    const totalProductsCount = await prisma.product.count({
      where: { sellerId: req.user.id }
    });

    const publishedProducts = await prisma.product.count({
      where: { sellerId: req.user.id, isPublished: true }
    });

    const draftProducts = totalProductsCount - publishedProducts;

    const outOfStock = await prisma.product.count({
      where: { sellerId: req.user.id, quantity: 0 }
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / parseInt(limit))
        },
        stats: {
          totalProducts: totalProductsCount,
          publishedProducts,
          draftProducts,
          outOfStock
        }
      }
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        parentId: true,
        children: {
          select: {
            id: true,
            name: true,
            productCount: true
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Add product count to categories
    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category._count.products
    }));

    res.json({
      success: true,
      data: categoriesWithCount
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/categories/:id/products
 * @desc    Get products by category
 * @access  Public
 */
router.get('/categories/:id/products', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get category info
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get products in category
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          categoryId: id,
          isPublished: true,
          status: 'PUBLISHED'
        },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          averageRating: true,
          seller: {
            select: {
              storeName: true,
              averageRating: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({
        where: {
          categoryId: id,
          isPublished: true,
          status: 'PUBLISHED'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
