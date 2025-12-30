const express = require('express');
const router = express.Router();
const filterOptionsController = require('../controllers/filterOptionsController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view active filter options
router.get('/active', filterOptionsController.getActiveFilterOptions);
router.get('/types', filterOptionsController.getFilterTypes);
router.get('/type/:type', filterOptionsController.getFilterOptionsByType);

// Admin routes - Get all options (including inactive)
router.get('/', authenticate, isAdmin, filterOptionsController.getAllFilterOptions);
router.get('/:id', authenticate, isAdmin, filterOptionsController.getFilterOptionById);

// Admin routes - Manage filter options
router.post('/', authenticate, isAdmin, filterOptionsController.createFilterOption);
router.put('/order', authenticate, isAdmin, filterOptionsController.updateDisplayOrder);
router.put('/:id', authenticate, isAdmin, filterOptionsController.updateFilterOption);
router.delete('/:id', authenticate, isAdmin, filterOptionsController.deleteFilterOption);

module.exports = router;
