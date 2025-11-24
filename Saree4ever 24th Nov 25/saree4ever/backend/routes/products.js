const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view products
router.get('/', productController.getAllProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/id/:id', productController.getProductById);

// Admin routes - Only admins can manage products
router.post('/', authenticate, isAdmin, productController.createProduct);
router.put('/:id', authenticate, isAdmin, productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);
router.patch('/:id/status', authenticate, isAdmin, productController.updateProductStatus);

module.exports = router;
