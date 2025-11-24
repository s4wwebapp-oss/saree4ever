const express = require('express');
const router = express.Router();
const realtimeController = require('../controllers/realtimeController');
const { authenticate } = require('../middleware/auth');

// Public real-time updates (for stock, public order status)
router.get('/events', realtimeController.streamEvents);

// Authenticated real-time updates (for user-specific order updates)
router.get('/events/user', authenticate, realtimeController.streamUserEvents);

module.exports = router;

