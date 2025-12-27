const express = require('express');
const router = express.Router();
const socialMediaSettingsController = require('../controllers/socialMediaSettingsController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public route - get visible social media links
router.get('/links', socialMediaSettingsController.getVisibleLinks);

// Admin routes - require authentication
router.get('/', authenticate, isAdmin, socialMediaSettingsController.getAllSettings);
router.put('/:platform', authenticate, isAdmin, socialMediaSettingsController.updateSetting);
router.put('/bulk/update', authenticate, isAdmin, socialMediaSettingsController.bulkUpdate);

module.exports = router;





