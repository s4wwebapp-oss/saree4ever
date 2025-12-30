const EventEmitter = require('events');

/**
 * Real-time event emitter
 * Broadcasts events to connected clients
 */
class RealtimeService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map(); // Store connected SSE clients
  }

  /**
   * Register a new client connection
   */
  registerClient(clientId, res) {
    this.clients.set(clientId, res);
    
    // Send initial connection message
    this.sendToClient(clientId, {
      type: 'connected',
      message: 'Real-time updates connected',
      timestamp: new Date().toISOString(),
    });

    // Clean up on disconnect
    res.on('close', () => {
      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    });
  }

  /**
   * Send event to specific client
   */
  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (client && !client.destroyed) {
      try {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(eventType, data) {
    const message = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    const messageStr = `data: ${JSON.stringify(message)}\n\n`;
    
    this.clients.forEach((client, clientId) => {
      if (!client.destroyed) {
        try {
          client.write(messageStr);
        } catch (error) {
          console.error(`Error broadcasting to client ${clientId}:`, error);
          this.clients.delete(clientId);
        }
      }
    });

    console.log(`Broadcasted ${eventType} to ${this.clients.size} clients`);
  }

  /**
   * Broadcast to specific user (for order updates)
   */
  broadcastToUser(userId, eventType, data) {
    const message = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
    };

    const messageStr = `data: ${JSON.stringify(message)}\n\n`;
    
    // In production, you'd filter by userId
    // For now, broadcast to all (frontend can filter)
    this.broadcast(eventType, { ...data, user_id: userId });
  }

  /**
   * Get connected clients count
   */
  getClientCount() {
    return this.clients.size;
  }
}

// Singleton instance
const realtimeService = new RealtimeService();

module.exports = realtimeService;

