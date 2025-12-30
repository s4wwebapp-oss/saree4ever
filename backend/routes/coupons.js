const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public validation endpoint
router.post('/validate', couponController.validateCoupon);

// Admin-only routes
router.use(authenticate, isAdmin);
router.get('/', couponController.listCoupons);
router.post('/', couponController.createCoupon);
router.patch('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
