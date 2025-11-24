const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Authenticated routes - Users can view their own shipments
router.use(authenticate);

router.get('/order/:orderId', shipmentController.getShipmentsByOrder);
router.get('/:id', shipmentController.getShipmentById);

// Admin routes - Only admins can manage shipments
router.post('/', isAdmin, shipmentController.createShipment);
router.put('/:id', isAdmin, shipmentController.updateShipment);
router.patch('/:id/tracking', isAdmin, shipmentController.updateTracking);
router.patch('/:id/status', isAdmin, shipmentController.updateShipmentStatus);

module.exports = router;

