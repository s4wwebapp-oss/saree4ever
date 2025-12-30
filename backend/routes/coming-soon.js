const express = require('express');
const router = express.Router();
const comingSoonController = require('../controllers/comingSoonController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/settings', optionalAuth, comingSoonController.getSettings);
router.get('/media', optionalAuth, comingSoonController.getActiveMedia);

// Admin routes
router.use(authenticate);
router.use(isAdmin);

router.put('/settings', comingSoonController.updateSettings);
router.get('/media/all', comingSoonController.getAllMedia);
router.post('/media', comingSoonController.createMedia);
router.put('/media/:id', comingSoonController.updateMedia);
router.delete('/media/:id', comingSoonController.deleteMedia);
router.put('/media/reorder', comingSoonController.reorderMedia);

module.exports = router;
