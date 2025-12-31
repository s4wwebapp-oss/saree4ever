# Order Process Flow - Complete Guide

## Overview

Complete order lifecycle from placement to delivery with status tracking and timeline (Amazon-style).

## Order Flow Steps

### Step 1: Reserve Stock
**When:** User places order (checkout starts)

**What happens:**
- Stock is reserved (held temporarily)
- Prevents other customers from buying the same item
- Reservation expires after 15 minutes if payment not completed

**API:**
```http
POST /api/orders
```

**Request:**
```json
{
  "email": "customer@example.com",
  "shipping_name": "John Doe",
  "shipping_address_line1": "123 Main St",
  "shipping_city": "Mumbai",
  "shipping_state": "Maharashtra",
  "shipping_postal_code": "400001",
  "items": [
    {
      "variant_id": "uuid",
      "product_id": "uuid",
      "quantity": 1,
      "unit_price": 9999.00
    }
  ]
}
```

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "order_number": "ORD-ABC123",
    "status": "pending",
    "payment_status": "pending",
    "total_amount": 9999.00
  },
  "message": "Order created successfully. Please proceed to payment."
}
```

**Timeline Event:**
- ✅ Order placed (status: pending)

---

### Step 2: Create Order with Status: Pending
**When:** Order creation completes

**Status:** `pending`
**Payment Status:** `pending`

**What happens:**
- Order is created in database
- Stock is reserved
- Order is ready for payment

---

### Step 3: Payment Provider Collects Money
**When:** Customer proceeds to payment

**Payment Providers:**
- Razorpay (Indian payments)
- Stripe (International payments)

**What happens:**
- Customer redirected to payment gateway
- Payment provider processes payment
- Customer completes payment

---

### Step 4: Payment Provider Tells Backend "Payment Success"
**When:** Payment is successful

**API:**
```http
POST /api/orders/webhook/payment
```

**Request (from payment provider):**
```json
{
  "order_id": "uuid",
  "payment_status": "paid",
  "payment_method": "razorpay",
  "payment_transaction_id": "txn_123456",
  "signature": "webhook_signature"
}
```

**What happens:**
- Webhook is received
- Signature is verified (security)
- Payment status is processed

---

### Step 5: Backend Commits Stock and Updates Order to Paid
**When:** Payment webhook confirms success

**What happens:**
- ✅ Reserved stock is **committed** (actually sold)
- ✅ Stock quantity is **deducted** from variant
- ✅ Order status updated to `confirmed`
- ✅ Payment status updated to `paid`

**Timeline Event:**
- ✅ Payment received (status: confirmed)

**API Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "status": "confirmed",
    "payment_status": "paid",
    "payment_transaction_id": "txn_123456"
  }
}
```

---

### Step 6: Admin Prepares Shipment
**When:** Admin processes the order

**What happens:**
- Admin packs the order
- Admin prepares shipping label
- Admin gets tracking number from courier

---

### Step 7: Backend Updates Order to Shipped
**When:** Admin marks order as shipped

**API:**
```http
POST /api/orders/:id/ship
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "tracking_number": "TRACK123456",
  "courier_name": "FedEx",
  "tracking_url": "https://fedex.com/track/TRACK123456"
}
```

**What happens:**
- ✅ Order status updated to `shipped`
- ✅ Tracking number saved
- ✅ `shipped_at` timestamp recorded

**Timeline Event:**
- ✅ Order shipped (status: shipped, tracking: TRACK123456)

---

### Step 8: Courier Updates Tracking
**When:** Courier scans package or updates status

**API:**
```http
PATCH /api/orders/:id/tracking
Authorization: Bearer <admin_token>
```

**Request:**
```json
{
  "tracking_number": "TRACK123456",
  "courier_name": "FedEx",
  "tracking_url": "https://fedex.com/track/TRACK123456"
}
```

**What happens:**
- Tracking information updated
- Customer can track order

**Timeline Event:**
- ✅ Tracking information updated

---

### Step 9: Backend Updates Order to Delivered
**When:** Package is delivered

**API:**
```http
POST /api/orders/:id/deliver
Authorization: Bearer <admin_token>
```

**What happens:**
- ✅ Order status updated to `delivered`
- ✅ `delivered_at` timestamp recorded

**Timeline Event:**
- ✅ Order delivered (status: delivered)

---

## Order Timeline (Amazon-Style)

### Get Order with Timeline

**API:**
```http
GET /api/orders/:orderNumber
```

**Response:**
```json
{
  "order": {
    "id": "uuid",
    "order_number": "ORD-ABC123",
    "status": "delivered",
    "payment_status": "paid",
    "total_amount": 9999.00,
    "order_items": [...]
  },
  "timeline": [
    {
      "event": "order_created",
      "message": "Order placed",
      "timestamp": "2024-11-24T10:00:00Z",
      "status": "pending",
      "icon": "📦"
    },
    {
      "event": "payment_success",
      "message": "Payment received",
      "timestamp": "2024-11-24T10:05:00Z",
      "status": "confirmed",
      "icon": "✅"
    },
    {
      "event": "order_shipped",
      "message": "Shipped via TRACK123456",
      "timestamp": "2024-11-25T09:00:00Z",
      "status": "shipped",
      "tracking_number": "TRACK123456",
      "icon": "🚚"
    },
    {
      "event": "order_delivered",
      "message": "Order delivered",
      "timestamp": "2024-11-27T14:30:00Z",
      "status": "delivered",
      "icon": "🎉"
    }
  ]
}
```

### Get User Orders with Timeline

**API:**
```http
GET /api/orders
Authorization: Bearer <user_token>
```

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-ABC123",
      "status": "delivered",
      "total_amount": 9999.00,
      "timeline": [...]
    }
  ],
  "count": 1
}
```

## Order Status Flow

```
pending → confirmed → shipped → delivered
   ↓
cancelled (if payment fails or user cancels)
```

## Payment Status Flow

```
pending → paid (success)
   ↓
failed (if payment fails)
```

## Error Handling

### Payment Failure

**What happens:**
- Reserved stock is **released** back to available
- Order payment status set to `failed`
- Order status remains `pending`
- Customer can retry payment

**Timeline Event:**
- ❌ Payment failed

### Order Cancellation

**What happens:**
- Reserved stock is **released**
- Order status set to `cancelled`
- Stock becomes available for other customers

**Timeline Event:**
- 🚫 Order cancelled

## Integration Points

### Payment Gateway Webhooks

**Razorpay Webhook:**
```javascript
// Verify signature
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== req.headers['x-razorpay-signature']) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

**Stripe Webhook:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

## Complete Flow Example

```javascript
// 1. Customer places order
const order = await orderService.createOrder({
  email: "customer@example.com",
  items: [{ variant_id: "v1", quantity: 1, unit_price: 9999 }],
  // ... shipping details
});
// Stock reserved, order status: pending

// 2. Payment webhook received
await orderService.processPaymentSuccess(order.id, {
  payment_method: "razorpay",
  payment_transaction_id: "txn_123"
});
// Stock committed, order status: confirmed, payment_status: paid

// 3. Admin ships order
await orderService.shipOrder(order.id, {
  tracking_number: "TRACK123",
  courier_name: "FedEx"
});
// Order status: shipped

// 4. Order delivered
await orderService.deliverOrder(order.id);
// Order status: delivered
```

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | POST | Create order (Step 1-2) |
| `/api/orders/webhook/payment` | POST | Payment webhook (Step 4-5) |
| `/api/orders/:id/ship` | POST | Ship order (Step 7) |
| `/api/orders/:id/tracking` | PATCH | Update tracking (Step 8) |
| `/api/orders/:id/deliver` | POST | Mark delivered (Step 9) |
| `/api/orders/:orderNumber` | GET | Get order with timeline |
| `/api/orders` | GET | Get user orders with timeline |

---

**Status**: ✅ Complete order process implemented with timeline tracking

