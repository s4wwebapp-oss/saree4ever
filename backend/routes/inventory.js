const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public routes - Anyone can check available stock
router.get('/available/:variantId', optionalAuth, inventoryController.getAvailableStock);

// Authenticated routes - Logged-in users can reserve/commit/release stock (for orders)
router.post('/reserve', authenticate, inventoryController.reserveStock); // STEP 1: Reserve (checkout starts)
router.post('/commit', authenticate, inventoryController.commitStock);   // STEP 2: Commit (payment succeeds)
router.post('/release', authenticate, inventoryController.releaseStock); // STEP 3: Release (payment fails/cancelled)

// Authenticated routes - Users can view their own order inventory
router.use(authenticate);
router.get('/order/:orderId', inventoryController.getInventoryByOrder);

// Admin routes - Only admins can view all inventory and adjust stock
router.get('/variant/:variantId', isAdmin, inventoryController.getInventoryByVariant);
router.get('/history/:variantId', isAdmin, inventoryController.getInventoryHistory);
router.get('/stock-levels', isAdmin, inventoryController.getStockLevels);
router.get('/adjustments', isAdmin, inventoryController.getStockAdjustments);
router.post('/adjust', isAdmin, inventoryController.adjustInventory);

module.exports = router;

