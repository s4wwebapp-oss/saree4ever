# Inventory Process - Safe Stock Management

## Overview

The inventory system uses a **3-step reservation process** to prevent overselling when multiple customers try to buy the same item simultaneously.

## The Problem

Without reservation:
- Customer A and Customer B both see "1 item in stock"
- Both add to cart
- Both checkout
- Both pay
- **Result**: Overselling! We sold 2 items but only had 1.

## The Solution: 3-Step Process

### Step 1: Reserve (Checkout Starts)

**When:** Customer starts checkout process

**What happens:**
- Stock is **reserved** (held temporarily)
- Stock is NOT deducted from available quantity yet
- Reservation expires after 15 minutes if payment not completed
- Other customers see reduced available stock

**API:**
```http
POST /api/inventory/reserve
```

**Request:**
```json
{
  "variant_id": "uuid",
  "quantity": 2,
  "order_id": "uuid",
  "expires_at": "2024-12-01T10:15:00Z"
}
```

**Response:**
```json
{
  "reserved": true,
  "available_stock": 3,
  "message": "Reserved 2 units"
}
```

### Step 2: Commit (Payment Succeeds)

**When:** Payment is confirmed successful

**What happens:**
- Reserved stock is **committed** (actually sold)
- Stock quantity is **deducted** from variant
- Reservation is cancelled
- Stock is permanently removed

**API:**
```http
POST /api/inventory/commit
```

**Request:**
```json
{
  "variant_id": "uuid",
  "quantity": 2,
  "order_id": "uuid"
}
```

**Response:**
```json
{
  "committed": true,
  "variant": {
    "id": "uuid",
    "stock_quantity": 8
  },
  "message": "Committed 2 units"
}
```

### Step 3: Release (Payment Fails or Order Cancelled)

**When:** 
- Payment fails
- Customer cancels order
- Reservation expires

**What happens:**
- Reserved stock is **released** back to available
- Stock quantity stays the same (was never deducted)
- Reservation is cancelled
- Stock becomes available for other customers

**API:**
```http
POST /api/inventory/release
```

**Request:**
```json
{
  "variant_id": "uuid",
  "quantity": 2,
  "order_id": "uuid"
}
```

**Response:**
```json
{
  "released": true,
  "available_stock": 5,
  "message": "Released 2 units"
}
```

## Flow Diagram

```
Customer starts checkout
         ↓
    [RESERVE] ← Stock held temporarily
         ↓
    Payment attempt
         ↓
    ┌────┴────┐
    ↓         ↓
Success    Failure
    ↓         ↓
[COMMIT]  [RELEASE]
    ↓         ↓
Stock      Stock
deducted   returned
```

## How It Prevents Overselling

**Scenario:** Last item in stock

1. **Customer A** starts checkout → Stock **reserved** (available: 0)
2. **Customer B** tries to checkout → Sees "Out of stock" (available: 0)
3. **Customer A** pays → Stock **committed** (sold)
4. **Customer B** cannot buy (already out of stock)

**OR**

1. **Customer A** starts checkout → Stock **reserved** (available: 0)
2. **Customer B** tries to checkout → Sees "Out of stock" (available: 0)
3. **Customer A** payment fails → Stock **released** (available: 1)
4. **Customer B** can now buy

## Integration with Orders

### Creating Order (Step 1: Reserve)

```javascript
// In orderService.createOrder()
for (const item of items) {
  // Reserve stock when order is created
  await inventoryService.reserveStock({
    variant_id: item.variant_id,
    quantity: item.quantity,
    order_id: order.id,
  });
}
```

### Payment Success (Step 2: Commit)

```javascript
// In orderService.updatePaymentStatus()
if (payment_status === 'paid') {
  for (const item of order.order_items) {
    // Commit reserved stock
    await inventoryService.commitStock({
      variant_id: item.variant_id,
      quantity: item.quantity,
      order_id: order.id,
    });
  }
}
```

### Payment Failure / Cancellation (Step 3: Release)

```javascript
// In orderService.updatePaymentStatus() or cancelOrder()
if (payment_status === 'failed') {
  for (const item of order.order_items) {
    // Release reserved stock
    await inventoryService.releaseStock({
      variant_id: item.variant_id,
      quantity: item.quantity,
      order_id: order.id,
    });
  }
}
```

## Available Stock Calculation

```javascript
available_stock = total_stock - reserved_stock

Where:
- total_stock = variant.stock_quantity
- reserved_stock = sum of all 'reserve' type inventory records for pending orders
```

## Inventory Record Types

- `reserve` - Stock reserved (not yet sold)
- `sale` - Stock committed/sold
- `return` - Stock returned (releasing reservation or actual return)
- `adjustment` - Manual stock adjustment
- `purchase` - Stock added (new inventory)
- `damage` - Stock removed due to damage
- `transfer` - Stock moved between locations

## Best Practices

1. **Always reserve before creating order** - Prevents overselling
2. **Commit immediately on payment success** - Don't delay
3. **Release on any failure** - Payment fails, order cancelled, timeout
4. **Set reservation expiry** - Auto-release after 15-30 minutes
5. **Check available stock before reserve** - Fail fast if out of stock

## Testing

Test the flow:

```bash
# 1. Reserve stock
curl -X POST http://localhost:5001/api/inventory/reserve \
  -H "Content-Type: application/json" \
  -d '{"variant_id":"uuid","quantity":1,"order_id":"order-123"}'

# 2. Check available stock (should be reduced)
curl http://localhost:5001/api/inventory/available/uuid

# 3. Commit (payment success)
curl -X POST http://localhost:5001/api/inventory/commit \
  -H "Content-Type: application/json" \
  -d '{"variant_id":"uuid","quantity":1,"order_id":"order-123"}'

# OR Release (payment failed)
curl -X POST http://localhost:5001/api/inventory/release \
  -H "Content-Type: application/json" \
  -d '{"variant_id":"uuid","quantity":1,"order_id":"order-123"}'
```

---

**Status**: ✅ Implemented and integrated with order flow

