const realtimeService = require('../services/realtimeService');
const { v4: uuidv4 } = require('uuid');

/**
 * Stream real-time events (SSE)
 * For stock updates, public order status, etc.
 */
exports.streamEvents = (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Generate unique client ID
  const clientId = uuidv4();

  // Register client
  realtimeService.registerClient(clientId, res);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    if (!res.destroyed) {
      try {
        res.write(': heartbeat\n\n');
      } catch (error) {
        clearInterval(heartbeat);
        realtimeService.clients.delete(clientId);
      }
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    realtimeService.clients.delete(clientId);
    res.end();
  });
};

/**
 * Stream user-specific events (SSE)
 * For order status updates, shipment tracking, etc.
 */
exports.streamUserEvents = (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const clientId = uuidv4();
  const userId = req.user.id;

  // Register client with user context
  realtimeService.registerClient(`${userId}-${clientId}`, res);

  // Send initial message
  realtimeService.sendToClient(`${userId}-${clientId}`, {
    type: 'connected',
    message: 'User-specific real-time updates connected',
    user_id: userId,
    timestamp: new Date().toISOString(),
  });

  // Send heartbeat
  const heartbeat = setInterval(() => {
    if (!res.destroyed) {
      try {
        res.write(': heartbeat\n\n');
      } catch (error) {
        clearInterval(heartbeat);
        realtimeService.clients.delete(`${userId}-${clientId}`);
      }
    } else {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    realtimeService.clients.delete(`${userId}-${clientId}`);
    res.end();
  });
};

