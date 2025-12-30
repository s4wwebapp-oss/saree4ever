// Main routes index file
// Import all route modules here

const authRoutes = require('./auth');
const productRoutes = require('./products');
const collectionRoutes = require('./collections');
const categoryRoutes = require('./categories');
const typeRoutes = require('./types');

module.exports = {
  authRoutes,
  productRoutes,
  collectionRoutes,
  categoryRoutes,
  typeRoutes,
};

