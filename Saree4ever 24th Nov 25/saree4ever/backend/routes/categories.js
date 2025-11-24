const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view categories
router.get('/', categoryController.getAllCategories);

// Admin routes - Only admins can manage categories
// TODO: Add admin routes when needed

module.exports = router;

