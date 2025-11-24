const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public route - Anyone can get active announcement
router.get('/active', optionalAuth, announcementController.getActiveAnnouncement);

// Admin routes - Only admins can manage announcements
router.use(authenticate);
router.use(isAdmin);

router.get('/', announcementController.getAllAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.post('/', announcementController.createAnnouncement);
router.put('/:id', announcementController.updateAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;


