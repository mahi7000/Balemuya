const express = require('express');
const prisma = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @desc    List all users
 * @access  Private (Admin)
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (role) {
      where.role = role.toUpperCase();
    }
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { storeName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isVerified: true,
          kycStatus: true,
          createdAt: true,
          lastLoginAt: true,
          storeName: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Suspend/Activate user
 * @access  Private (Admin)
 */
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, status: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: `User ${status.toLowerCase()} successfully`,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/kyc-applications
 * @desc    View KYC submissions
 * @access  Private (Admin)
 */
router.get('/kyc-applications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const [kycApplications, totalApplications] = await Promise.all([
      prisma.kycDocument.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              storeName: true,
              createdAt: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.kycDocument.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        applications: kycApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalApplications,
          totalPages: Math.ceil(totalApplications / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get KYC applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/admin/kyc/:id/status
 * @desc    Approve/Reject KYC
 * @access  Private (Admin)
 */
router.put('/kyc/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get KYC document
    const kycDocument = await prisma.kycDocument.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!kycDocument) {
      return res.status(404).json({
        success: false,
        message: 'KYC application not found'
      });
    }

    // Update KYC status
    const updatedKyc = await prisma.kycDocument.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: kycDocument.userId },
      data: {
        kycStatus: status,
        kycApprovedAt: status === 'APPROVED' ? new Date() : null
      }
    });

    res.json({
      success: true,
      message: `KYC application ${status.toLowerCase()} successfully`,
      data: {
        id: updatedKyc.id,
        status: updatedKyc.status,
        reviewedAt: updatedKyc.reviewedAt,
        rejectionReason: updatedKyc.rejectionReason
      }
    });

  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/orders
 * @desc    View all orders
 * @access  Private (Admin)
 */
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      dateFrom,
      dateTo
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus.toUpperCase();
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              storeName: true
            }
          },
          items: {
            select: {
              product: {
                select: {
                  title: true
                }
              },
              quantity: true,
              price: true
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
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/dashboard
 * @desc    Platform analytics
 * @access  Private (Admin)
 */
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentUsers,
      recentOrders,
      kycStats,
      orderStats
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total sellers
      prisma.user.count({
        where: { role: 'SELLER' }
      }),
      
      // Total products
      prisma.product.count({
        where: { isPublished: true }
      }),
      
      // Total orders
      prisma.order.count(),
      
      // Total revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { total: true }
      }),
      
      // Recent users (last 7 days)
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Recent orders (last 7 days)
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          buyer: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          seller: {
            select: {
              storeName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // KYC statistics
      prisma.kycDocument.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // Order statistics
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);

    // Format KYC stats
    const kycStatsFormatted = {
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0
    };

    kycStats.forEach(stat => {
      const status = stat.status.toLowerCase();
      if (kycStatsFormatted.hasOwnProperty(status)) {
        kycStatsFormatted[status] = stat._count.id;
      }
    });

    // Format order stats
    const orderStatsFormatted = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };

    orderStats.forEach(stat => {
      const status = stat.status.toLowerCase();
      if (orderStatsFormatted.hasOwnProperty(status)) {
        orderStatsFormatted[status] = stat._count.id;
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSellers,
          totalProducts,
          totalOrders,
          totalRevenue: parseFloat(totalRevenue._sum.total || 0)
        },
        recentUsers,
        recentOrders,
        kycStats: kycStatsFormatted,
        orderStats: orderStatsFormatted
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories for admin
 * @access  Private (Admin)
 */
router.get('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        },
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/admin/categories
 * @desc    Create new category
 * @access  Private (Admin)
 */
router.post('/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, image, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        parentId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, parentId, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        image,
        parentId,
        isActive
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
