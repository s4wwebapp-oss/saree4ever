const express = require('express');
const router = express.Router();
const landingPageSectionController = require('../controllers/landingPageSectionController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public route - Anyone can check section visibility
router.get('/visibility', optionalAuth, landingPageSectionController.getVisibleSections);

// Admin routes - Only admins can manage sections
router.use(authenticate);
router.use(isAdmin);

router.get('/', landingPageSectionController.getAllSections);
router.put('/visibility', landingPageSectionController.updateSectionVisibility);
router.put('/visibility/bulk', landingPageSectionController.bulkUpdateVisibility);

module.exports = router;





