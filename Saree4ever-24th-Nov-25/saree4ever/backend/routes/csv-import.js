const express = require('express');
const router = express.Router();
const csvImportController = require('../controllers/csvImportController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// All CSV import routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// CSV Import routes - Only admins can upload CSV files
router.post('/products', uploadSingle, csvImportController.importProducts);
router.post('/variants', uploadSingle, csvImportController.importVariants);
router.post('/stock', uploadSingle, csvImportController.importStock);
router.post('/offers', uploadSingle, csvImportController.importOffers);

// Get import history
router.get('/history', csvImportController.getImportHistory);

module.exports = router;

