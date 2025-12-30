const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/active', offerController.getActiveOffers);
router.get('/:id', offerController.getOfferById);

// Admin routes
router.use(authenticate);
router.use(isAdmin);

router.get('/', offerController.getAllOffers);
router.post('/', offerController.createOffer);
router.put('/:id', offerController.updateOffer);
router.delete('/:id', offerController.deleteOffer);
router.patch('/:id/status', offerController.updateOfferStatus);

module.exports = router;

