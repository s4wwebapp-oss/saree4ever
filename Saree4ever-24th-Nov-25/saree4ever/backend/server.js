require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const variantRoutes = require('./routes/variants');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const shipmentRoutes = require('./routes/shipments');
const offerRoutes = require('./routes/offers');
const csvImportRoutes = require('./routes/csv-import');
const realtimeRoutes = require('./routes/realtime');
const collectionRoutes = require('./routes/collections');
const categoryRoutes = require('./routes/categories');
const typeRoutes = require('./routes/types');
const auditRoutes = require('./routes/audit');
const blogRoutes = require('./routes/blog');
const announcementRoutes = require('./routes/announcement');
const heroSlideRoutes = require('./routes/hero-slides');
const testimonialRoutes = require('./routes/testimonials');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
// Normalize URL - remove trailing slash for consistent matching
const normalizedFrontendUrl = frontendUrl.replace(/\/$/, '');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origin - remove trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Check if origin matches (with or without trailing slash)
    if (normalizedOrigin === normalizedFrontendUrl || origin === frontendUrl) {
      callback(null, true);
    } else {
      // Also allow localhost for development
      if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (temporary - use Supabase Storage in production)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Saree4ever API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      variants: '/api/variants',
      inventory: '/api/inventory',
      orders: '/api/orders',
      shipments: '/api/shipments',
      offers: '/api/offers',
      csvImport: '/api/csv-import',
      realtime: '/api/realtime/events',
      collections: '/api/collections',
      categories: '/api/categories',
      types: '/api/types',
      blog: '/api/blog',
      announcement: '/api/announcement',
      heroSlides: '/api/hero-slides',
      testimonials: '/api/testimonials',
      auth: '/api/auth',
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/csv-import', csvImportRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/announcement', announcementRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/testimonials', testimonialRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 API: http://localhost:${PORT}/api`);
  console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
});

module.exports = app;

