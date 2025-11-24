const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth routes working' });
});

// Authentication routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', authenticate, authController.signout);
router.get('/me', authenticate, authController.getCurrentUser);

// Admin routes (server-only)
router.post('/admin/signin', authController.adminSignin);

module.exports = router;

