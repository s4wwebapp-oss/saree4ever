const express = require('express');
const router = express.Router();
const landingPageVideoController = require('../controllers/landingPageVideoController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public route - Anyone can get active videos
router.get('/active', optionalAuth, landingPageVideoController.getActiveVideos);

// Admin routes - Only admins can manage videos
router.use(authenticate);
router.use(isAdmin);

router.get('/', landingPageVideoController.getAllVideos);
router.get('/:id', landingPageVideoController.getVideoById);
router.post('/', landingPageVideoController.createVideo);
router.put('/:id', landingPageVideoController.updateVideo);
router.delete('/:id', landingPageVideoController.deleteVideo);
router.post('/reorder', landingPageVideoController.reorderVideos);

module.exports = router;





