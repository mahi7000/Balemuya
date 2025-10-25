const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Fallback config if config file is missing
const config = require('./config') || {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: ['http://localhost:5173', 'https://balemuya-pi.vercel.app'],
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // limit each IP to 100 requests per windowMs
  }
};

// Import error handler (create if doesn't exist)
let errorHandler, notFound;
try {
  const errorModule = require('./middleware/errorHandler');
  errorHandler = errorModule.errorHandler;
  notFound = errorModule.notFound;
} catch (error) {
  // Fallback error handlers
  errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  };
  
  notFound = (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  };
}

// Import routes with fallbacks
const importRoute = (routePath, fallbackRouter) => {
  try {
    return require(routePath);
  } catch (error) {
    console.warn(`Route ${routePath} not found, using fallback`);
    return fallbackRouter || express.Router();
  }
};

const authRoutes = importRoute('./routes/auth');
const userRoutes = importRoute('./routes/users');
const productRoutes = importRoute('./routes/products');
const orderRoutes = importRoute('./routes/orders');
const paymentRoutes = importRoute('./routes/payments');
const reviewRoutes = importRoute('./routes/reviews');
const wishlistRoutes = importRoute('./routes/wishlist');
const chatRoutes = importRoute('./routes/chats');
const adminRoutes = importRoute('./routes/admin');
const uploadRoutes = importRoute('./routes/upload');

const app = express();

// Create logs directory if it doesn't exist (safe for Render)
try {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  console.warn('Could not create logs directory:', error.message);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: config.cors?.origin || process.env.FRONTEND_URL || 'https://balemuya-pi.vercel.app/',
  credentials: config.cors?.credentials || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000,
  max: config.rateLimit?.maxRequests || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint (critical for Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Balmuya Backend API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv || process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Balmuya Backend API',
    version: '1.0.0',
    documentation: '/api',
    health: '/health'
  });
});

// API routes (with safe mounting)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Balmuya Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      reviews: '/api/reviews',
      wishlist: '/api/wishlist',
      chats: '/api/chats',
      admin: '/api/admin',
      upload: '/api/upload'
    },
    health: '/health'
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server - CRITICAL FOR RENDER: use 0.0.0.0
const PORT = config.port || process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
🚀 Balmuya Backend Server is running!
📍 Host: ${HOST}
📍 Port: ${PORT}
🌍 Environment: ${config.nodeEnv || process.env.NODE_ENV || 'development'}
📚 API: http://${HOST}:${PORT}/api
❤️  Health: http://${HOST}:${PORT}/health
💡 Empowering women entrepreneurs through technology
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;