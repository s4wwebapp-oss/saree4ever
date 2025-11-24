const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view types
router.get('/', typeController.getAllTypes);

// Admin routes - Only admins can manage types
// TODO: Add admin routes when needed

module.exports = router;

