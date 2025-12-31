const express = require('express');
const router = express.Router();
const heroSlideController = require('../controllers/heroSlideController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public route - Anyone can get active hero slides
router.get('/active', optionalAuth, heroSlideController.getActiveSlides);

// Admin routes - Only admins can manage hero slides
router.use(authenticate);
router.use(isAdmin);

router.get('/', heroSlideController.getAllSlides);
router.get('/:id', heroSlideController.getSlideById);
router.post('/', heroSlideController.createSlide);
router.put('/:id', heroSlideController.updateSlide);
router.delete('/:id', heroSlideController.deleteSlide);
router.post('/reorder', heroSlideController.reorderSlides);

module.exports = router;


