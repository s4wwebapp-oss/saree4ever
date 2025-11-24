# Real-Time Updates Guide

## Overview

The backend uses **Server-Sent Events (SSE)** to send live updates to the frontend for:
- ✅ Stock updates
- ✅ Order status changes
- ✅ Shipment updates

This provides a responsive, real-time shopping experience without page refreshes.

## How It Works

### Server-Sent Events (SSE)

SSE is a web standard that allows the server to push updates to the browser over a single HTTP connection. It's simpler than WebSockets and perfect for one-way updates.

**Benefits:**
- ✅ Built into browsers (no library needed)
- ✅ Automatic reconnection
- ✅ Simple to implement
- ✅ Works through firewalls/proxies

## API Endpoints

### Public Events Stream
```http
GET /api/realtime/events
```

**Use for:**
- Stock updates (available to all users)
- Public order status (if needed)

**Response:** SSE stream

### User-Specific Events Stream
```http
GET /api/realtime/events/user
Authorization: Bearer <token>
```

**Use for:**
- Order status updates (user's own orders)
- Shipment tracking updates
- Payment status changes

**Response:** SSE stream

## Frontend Implementation

### Basic SSE Connection

```javascript
// Connect to real-time events
const eventSource = new EventSource('http://localhost:5001/api/realtime/events');

// Listen for events
eventSource.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  // Handle different event types
  switch (data.type) {
    case 'stock_updated':
      updateStockDisplay(data.data);
      break;
    case 'stock_reserved':
      updateAvailableStock(data.data);
      break;
    case 'order_created':
      showOrderNotification(data.data);
      break;
  }
});

// Handle connection open
eventSource.onopen = () => {
  console.log('Real-time connection opened');
};

// Handle errors
eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  // Browser will automatically reconnect
};

// Close connection when done
// eventSource.close();
```

### User-Specific Events (Authenticated)

```javascript
// Connect with authentication
const token = localStorage.getItem('token');
const eventSource = new EventSource(
  'http://localhost:5001/api/realtime/events/user',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Note: Standard EventSource doesn't support custom headers
// Use fetch with ReadableStream or a library like eventsource

// Alternative: Use fetch with ReadableStream
async function connectRealtime() {
  const response = await fetch('http://localhost:5001/api/realtime/events/user', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        handleRealtimeEvent(data);
      }
    }
  }
}
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';

function useRealtimeUpdates(userId) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource(
      userId 
        ? `http://localhost:5001/api/realtime/events/user`
        : 'http://localhost:5001/api/realtime/events'
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents(prev => [...prev, data]);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);

  return events;
}

// Usage
function OrderStatus({ orderId }) {
  const events = useRealtimeUpdates(userId);

  const orderEvents = events.filter(
    e => e.data?.order_id === orderId
  );

  return (
    <div>
      {orderEvents.map(event => (
        <div key={event.timestamp}>
          {event.type}: {event.data.message}
        </div>
      ))}
    </div>
  );
}
```

## Event Types

### Stock Events

**`stock_updated`**
```json
{
  "type": "stock_updated",
  "data": {
    "variant_id": "uuid",
    "stock_quantity": 10,
    "quantity_change": 5,
    "type": "adjustment"
  },
  "timestamp": "2024-11-24T10:00:00Z"
}
```

**`stock_reserved`**
```json
{
  "type": "stock_reserved",
  "data": {
    "variant_id": "uuid",
    "quantity": 2,
    "order_id": "uuid",
    "available_stock": 8
  },
  "timestamp": "2024-11-24T10:00:00Z"
}
```

**`stock_committed`**
```json
{
  "type": "stock_committed",
  "data": {
    "variant_id": "uuid",
    "quantity": 2,
    "order_id": "uuid",
    "stock_quantity": 8
  },
  "timestamp": "2024-11-24T10:00:00Z"
}
```

**`stock_released`**
```json
{
  "type": "stock_released",
  "data": {
    "variant_id": "uuid",
    "quantity": 2,
    "order_id": "uuid",
    "available_stock": 10
  },
  "timestamp": "2024-11-24T10:00:00Z"
}
```

### Order Events

**`order_created`**
```json
{
  "type": "order_created",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-ABC123",
    "status": "pending"
  },
  "timestamp": "2024-11-24T10:00:00Z"
}
```

**`payment_success`**
```json
{
  "type": "payment_success",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-ABC123",
    "payment_status": "paid",
    "status": "confirmed"
  },
  "timestamp": "2024-11-24T10:05:00Z"
}
```

**`payment_failed`**
```json
{
  "type": "payment_failed",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-ABC123",
    "payment_status": "failed",
    "reason": "Payment processing failed"
  },
  "timestamp": "2024-11-24T10:05:00Z"
}
```

**`order_shipped`**
```json
{
  "type": "order_shipped",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-ABC123",
    "status": "shipped",
    "tracking_number": "TRACK123",
    "courier_name": "FedEx"
  },
  "timestamp": "2024-11-25T09:00:00Z"
}
```

**`tracking_updated`**
```json
{
  "type": "tracking_updated",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-ABC123",
    "tracking_number": "TRACK456",
    "courier_name": "DHL",
    "tracking_url": "https://..."
  },
  "timestamp": "2024-11-25T10:00:00Z"
}
```

**`order_delivered`**
```json
{
  "type": "order_delivered",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-ABC123",
    "status": "delivered",
    "delivered_at": "2024-11-27T14:30:00Z"
  },
  "timestamp": "2024-11-27T14:30:00Z"
}
```

## Use Cases

### 1. Live Stock Updates

```javascript
// Show "Only 2 left!" that updates in real-time
function ProductStock({ variantId }) {
  const [stock, setStock] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/events');
    
    eventSource.addEventListener('stock_updated', (event) => {
      const data = JSON.parse(event.data);
      if (data.data.variant_id === variantId) {
        setStock(data.data.stock_quantity);
      }
    });

    return () => eventSource.close();
  }, [variantId]);

  if (stock < 5) {
    return <div className="low-stock">Only {stock} left!</div>;
  }
}
```

### 2. Order Status Updates

```javascript
// Update order status without page refresh
function OrderTracker({ orderId }) {
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/events/user');
    
    eventSource.addEventListener('payment_success', (event) => {
      const data = JSON.parse(event.data);
      if (data.data.order_id === orderId) {
        setStatus('confirmed');
        showNotification('Payment successful!');
      }
    });

    eventSource.addEventListener('order_shipped', (event) => {
      const data = JSON.parse(event.data);
      if (data.data.order_id === orderId) {
        setStatus('shipped');
        showNotification('Your order has shipped!');
      }
    });

    return () => eventSource.close();
  }, [orderId]);

  return <div>Order Status: {status}</div>;
}
```

### 3. Shopping Cart Stock Validation

```javascript
// Warn user if item goes out of stock while in cart
function CartItem({ variantId }) {
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/events');
    
    eventSource.addEventListener('stock_updated', (event) => {
      const data = JSON.parse(event.data);
      if (data.data.variant_id === variantId) {
        setAvailable(data.data.stock_quantity > 0);
      }
    });

    return () => eventSource.close();
  }, [variantId]);

  if (!available) {
    return <div className="error">This item is now out of stock</div>;
  }
}
```

## Alternative: Short Polling

If SSE is not available, use short polling:

```javascript
// Poll every 5 seconds
function pollOrderStatus(orderId) {
  setInterval(async () => {
    const response = await fetch(`/api/orders/id/${orderId}`);
    const { order } = await response.json();
    updateOrderStatus(order.status);
  }, 5000);
}
```

## Alternative: Pusher/Ably

For more advanced features (presence, channels), use Pusher or Ably:

```javascript
// Pusher example
import Pusher from 'pusher-js';

const pusher = new Pusher('your-key', {
  cluster: 'your-cluster'
});

const channel = pusher.subscribe('orders');
channel.bind('status-updated', (data) => {
  updateOrderStatus(data);
});
```

## Testing

### Test SSE Connection

```bash
# Using curl
curl -N http://localhost:5001/api/realtime/events

# You should see:
# data: {"type":"connected","message":"Real-time updates connected",...}
# 
# : heartbeat
# 
# (heartbeat every 30 seconds)
```

### Trigger Test Event

```javascript
// In your backend code or test script
const realtimeService = require('./services/realtimeService');

realtimeService.broadcast('test_event', {
  message: 'This is a test',
  data: { test: true }
});
```

## Best Practices

1. **Reconnect automatically** - SSE handles this automatically
2. **Handle connection errors** - Show user-friendly messages
3. **Filter events on frontend** - Only process relevant events
4. **Close connections** - Clean up when component unmounts
5. **Use user-specific stream** - For private order updates
6. **Monitor connection** - Show connection status to user

## Performance

- **SSE**: Low overhead, one connection per user
- **Short Polling**: Higher server load, but simpler
- **Pusher/Ably**: Best for scale, but requires external service

---

**Status**: ✅ Real-time updates implemented with SSE

