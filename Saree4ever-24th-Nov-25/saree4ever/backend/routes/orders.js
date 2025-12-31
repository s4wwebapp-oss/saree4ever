const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can create orders and view by order number
router.post('/', orderController.createOrder);
router.get('/:orderNumber', orderController.getOrderByNumber);

// Payment webhook (public - verified by signature)
router.post('/webhook/payment', orderController.processPaymentWebhook);

// Authenticated routes - Logged-in users can view their orders
router.use(authenticate);

router.get('/', orderController.getUserOrders);
router.get('/id/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

// Admin routes - Only admins can manage orders
router.patch('/:id/status', isAdmin, orderController.updateOrderStatus);
router.patch('/:id/payment', isAdmin, orderController.updatePaymentStatus);
router.post('/:id/ship', isAdmin, orderController.shipOrder);
router.patch('/:id/tracking', isAdmin, orderController.updateTracking);
router.post('/:id/deliver', isAdmin, orderController.deliverOrder);
router.get('/admin/all', isAdmin, orderController.getAllOrders);
router.get('/admin/stats', isAdmin, orderController.getOrderStats);

module.exports = router;

