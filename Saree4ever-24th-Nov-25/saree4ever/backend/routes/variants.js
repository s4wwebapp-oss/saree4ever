const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view variants
router.get('/product/:productId', variantController.getVariantsByProduct);
router.get('/:id', variantController.getVariantById);

// Admin routes - Only admins can manage variants
router.post('/', authenticate, isAdmin, variantController.createVariant);
router.put('/:id', authenticate, isAdmin, variantController.updateVariant);
router.delete('/:id', authenticate, isAdmin, variantController.deleteVariant);
router.patch('/:id/stock', authenticate, isAdmin, variantController.updateStock);

module.exports = router;

