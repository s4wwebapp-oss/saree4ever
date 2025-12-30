const express = require('express');
const router = express.Router();
const csvImportController = require('../controllers/csvImportController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadCSV } = require('../middleware/upload');

// All CSV import routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// CSV Import routes - Only admins can upload CSV files
router.post('/products', uploadCSV, csvImportController.importProducts);
router.post('/variants', uploadCSV, csvImportController.importVariants);
router.post('/stock', uploadCSV, csvImportController.importStock);
router.post('/offers', uploadCSV, csvImportController.importOffers);

// Get import history
router.get('/history', csvImportController.getImportHistory);

module.exports = router;

