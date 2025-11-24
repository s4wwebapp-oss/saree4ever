# How Inventory, Orders & Stock Tracking Works

## Quick Answer

**Inventory:** Managed at product variant level with real-time tracking  
**Orders:** Auto-deduct stock on creation, update status through workflow  
**Stock Tracking:** Full audit trail of every change with who/when/why

---

## 📦 Stock Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        STOCK SOURCES                             │
└─────────────────────────────────────────────────────────────────┘
            │                    │                    │
            ↓                    ↓                    ↓
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │ Admin Manual │    │  CSV Import  │    │Order System  │
    │   Update     │    │   (Bulk)     │    │  (Auto -)    │
    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
           │                   │                    │
           └───────────────────┴────────────────────┘
                              │
                              ↓
                    ┌───────────────────┐
                    │  product_variants │
                    │   stock: 10       │ ← Current stock
                    └───────────────────┘
                              │
                              ↓
                    ┌───────────────────┐
                    │ stock_adjustments │ ← Audit log
                    │ - Who changed     │
                    │ - When            │
                    │ - Before/After    │
                    │ - Reason          │
                    └───────────────────┘
```

---

## 🛍️ Complete Order Flow (With Stock)

### Phase 1: Shopping (Stock NOT affected)
```
Customer browses products
  ↓
Adds to cart (localStorage)
  ↓
Stock: NO CHANGE (just UI, not reserved)
```

### Phase 2: Checkout (Stock DEDUCTED)
```
Customer clicks "Checkout"
  ↓
POST /api/orders {items: [...], address: {...}}
  ↓
Backend:
  1. Start transaction
  2. For each cart item:
     - Check stock (SELECT ... FOR UPDATE) ← Lock row
     - Validate: stock >= quantity
     - Deduct: UPDATE stock = stock - quantity
     - Log: INSERT INTO stock_adjustments
     - Create: INSERT INTO order_items
  3. Commit transaction
  ↓
Order created with status: 'created'
Stock deducted: 10 → 8
```

**Stock is now HELD for this order**

### Phase 3: Payment
```
Customer enters card details
  ↓
Stripe payment processed
  ↓
Success?
  ↓ YES
Update order status: 'created' → 'paid'
Stock: NO CHANGE (already deducted)
  ↓ NO
Update order status: 'cancelled'
Restore stock: 8 → 10
Log: Stock adjustment (Order cancelled)
```

### Phase 4: Fulfillment
```
Admin views order in /admin/orders
  ↓
Creates shipment:
  - Carrier: Delhivery
  - Tracking: DLV123456789
  ↓
Order status: 'paid' → 'shipped'
Stock: NO CHANGE (already deducted)
  ↓
Shipment tracking updates (webhooks)
  ↓
Order status: 'shipped' → 'delivered'
Stock: PERMANENT (sale complete)
```

---

## 💾 Database: How Stock is Stored

### Products Table
```sql
products (
  id: uuid,
  sku: 'KAN-001',
  title: 'Kanjivaram Silk Saree',
  price: 45000,
  -- NO stock field here!
)
```

### Product Variants Table (Where Stock Lives)
```sql
product_variants (
  id: uuid,
  product_id: uuid → references products,
  sku: 'KAN-001-VAR',
  stock: 10,              ← Current available stock
  available: true,        ← Computed: stock > 0
  created_at: timestamp,
  updated_at: timestamp
)
```

**Why separate variants?**
- One saree can have multiple sizes/colors
- Each variant tracks its own stock
- Currently: 1 variant per product (default)
- Future: Multiple variants (Blue, Red, etc.)

---

## 📊 Stock Adjustment Logs (Audit Trail)

### Every stock change creates a log entry:

```sql
stock_adjustments (
  id: uuid,
  product_id: uuid,
  variant_id: uuid,
  sku: 'KAN-001',
  previous_stock: 10,     ← Before
  new_stock: 8,           ← After
  delta: -2,              ← Change
  reason: 'Order #abc123',
  adjusted_by: 'admin_id',
  created_at: '2025-11-22 10:30:00'
)
```

**View History:**
```bash
GET /api/inventory/adjustments?productId=xxx
```

**Response:**
```json
{
  "adjustments": [
    {
      "created_at": "2025-11-22T10:30:00Z",
      "product_title": "Kanjivaram Silk",
      "sku": "KAN-001",
      "previous_stock": 10,
      "new_stock": 8,
      "delta": -2,
      "reason": "Order #abc123",
      "adjusted_by_email": "system@auto"
    },
    {
      "created_at": "2025-11-21T14:00:00Z",
      "sku": "KAN-001",
      "previous_stock": 5,
      "new_stock": 10,
      "delta": +5,
      "reason": "Restock from supplier",
      "adjusted_by_email": "admin@saree4ever.com"
    }
  ]
}
```

---

## 🎛️ Admin Controls

### Dashboard (`/admin/inventory`)

**What You See:**
```
┌─────────────────────────────────────────────────────┐
│ Inventory Management                                 │
├─────────────────────────────────────────────────────┤
│ Total Products: 100  |  Low Stock: 5  |  Threshold: [5]│
├─────────────────────────────────────────────────────┤
│ SKU        Product              Stock    Status      │
│ KAN-001    Kanjivaram Silk      [10]✏️   ✓ In Stock │
│ KAN-002    Banarasi Silk        [2]✏️    ⚠️ Low Stock│
│ BAN-003    Cotton Saree         [0]✏️    ✗ Out      │
└─────────────────────────────────────────────────────┘
```

**Features:**
- **Inline Edit:** Click stock number → Edit → Auto-save
- **Low Stock Highlight:** Red background if stock ≤ threshold
- **Status Badges:** Color-coded (Green/Yellow/Red)
- **Quick Actions:** Click to edit product details

---

### CSV Import (`/admin/csv-import-enhanced`)

**Step 1: Upload**
```
┌─────────────────────────────────────┐
│  Drag & drop CSV file here          │
│  or click to browse                 │
└─────────────────────────────────────┘
[test-products.csv] (12 KB)
              [Preview →]
```

**Step 2: Preview with Validation**
```
┌──────────────────────────────────────────────────┐
│ Preview: 100 rows, 2 errors                      │
├──────────────────────────────────────────────────┤
│ Row | SKU     | Title        | Price | Status   │
│ 1   | KAN-001 | Kanjivaram   | 45000 | ✓ Valid  │
│ 2   | INVALID | Missing Title|       | ✗ Error  │
│     |         |              |       | Title required│
│ 3   | KAN-002 | Banarasi     | 35000 | ✓ Valid  │
└──────────────────────────────────────────────────┘
[← Back]              [Import 98 Products]
```

**Step 3: Importing**
```
⏳ Importing products...
Please wait...
```

**Step 4: Complete**
```
✅ Import Complete!

Total Rows: 100
Successful: 98
Failed: 2

[Import Another]  [View Products]
```

---

### Order Management (`/admin/orders`)

**List View:**
```
┌─────────────────────────────────────────────────┐
│ Orders                            [Filter ▾]     │
├─────────────────────────────────────────────────┤
│ Order ID    | Date       | Total  | Status      │
│ #abc123     | Nov 22     | ₹45,000| Paid    [View]│
│ #def456     | Nov 21     | ₹35,000| Shipped [View]│
│ #ghi789     | Nov 20     | ₹22,000| Delivered[View]│
└─────────────────────────────────────────────────┘
```

**Detail View (`/admin/orders/[id]`):**
```
┌──────────────────────────────────────────────────┐
│ Order #abc123               [Create Shipment]    │
├──────────────────────────────────────────────────┤
│ Order Items:                                     │
│ • Kanjivaram Silk (Qty: 1) - ₹45,000           │
│                                                  │
│ Total: ₹45,000                                   │
├──────────────────────────────────────────────────┤
│ Status Actions:                                  │
│ [Mark as Paid] [Mark as Shipped] [Delivered]    │
│ [Cancel Order]                                   │
├──────────────────────────────────────────────────┤
│ Shipment Tracking:                               │
│ Carrier: Delhivery                               │
│ Tracking: DLV123456789                           │
│   ✓ Created - Nov 22, 10:00 AM                  │
│   ✓ Picked up - Nov 22, 2:00 PM                 │
│   → In transit - Nov 23, 8:00 AM                │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Real-World Example

### Scenario: Customer Orders a Saree

**Initial State:**
```
Product: Kanjivaram Silk (KAN-001)
Variant: KAN-001-VAR
Stock: 10 units
```

---

**Step 1: Customer Checkout**
```javascript
// Customer clicks "Place Order"
POST /api/orders
{
  "items": [{
    "productId": "prod_123",
    "variantId": "var_456",
    "quantity": 2,
    "price": 45000
  }],
  "total": 90000,
  "shipping_address": {...}
}
```

**Backend Response:**
```sql
-- Check stock
SELECT stock FROM product_variants WHERE id = 'var_456' FOR UPDATE;
-- Result: 10 (OK, can fulfill)

-- Deduct stock
UPDATE product_variants SET stock = 8 WHERE id = 'var_456';

-- Log adjustment
INSERT INTO stock_adjustments (
  previous_stock, new_stock, delta, reason
) VALUES (10, 8, -2, 'Order order_abc123');

-- Create order
INSERT INTO orders (user_id, status, total) 
VALUES ('user_id', 'created', 90000);
```

**New State:**
```
Stock: 8 units (2 deducted and held)
Order Status: 'created'
```

---

**Step 2: Payment**
```javascript
// Stripe payment succeeds
// Webhook: POST /webhooks/stripe

// Backend updates order
UPDATE orders SET status = 'paid' WHERE id = 'order_abc123';
```

**New State:**
```
Stock: 8 units (no change)
Order Status: 'paid'
```

---

**Step 3: Admin Creates Shipment**
```javascript
// Admin goes to /admin/orders/abc123
// Clicks "Create Shipment"

POST /api/shipping/create
{
  "order_id": "abc123",
  "carrier": "Delhivery",
  "tracking_number": "DLV987654321",
  "expected_delivery": "2025-11-30"
}
```

**Backend:**
```sql
-- Create shipment
INSERT INTO shipments (
  order_id, carrier, tracking_number, status, events
) VALUES (
  'abc123',
  'Delhivery',
  'DLV987654321',
  'created',
  '[{"status":"created","timestamp":"...","description":"Shipment created"}]'
);

-- Update order
UPDATE orders SET status = 'shipped' WHERE id = 'abc123';
```

**New State:**
```
Stock: 8 units (no change)
Order Status: 'shipped'
Shipment: Created with tracking
```

---

**Step 4: Delivery**
```javascript
// Carrier delivers package
// Admin or webhook updates status

PUT /api/admin/orders/abc123
{
  "status": "delivered"
}
```

**Final State:**
```
Stock: 8 units (permanent, sale complete)
Order Status: 'delivered'
```

---

## 🎯 Key Mechanisms

### 1. Stock Reservation System

**When stock is deducted:**
```
Order Created (Checkout) ✅
  ↓
Stock immediately deducted
  ↓
Payment Pending
  ↓
Payment Success → Order marked 'paid' (stock stays deducted)
Payment Failure → Order cancelled (stock restored)
```

**Why deduct early?**
- Prevents overselling during payment process
- Holds inventory for the order
- If payment fails, stock is released back

---

### 2. Transaction Safety

**PostgreSQL Transaction:**
```typescript
const client = await pool.connect();
await client.query('BEGIN');

try {
  // Multiple operations:
  // 1. Check stock
  // 2. Deduct stock
  // 3. Create order
  // 4. Create order items
  // 5. Log adjustments
  
  await client.query('COMMIT'); // ← All succeed
} catch (error) {
  await client.query('ROLLBACK'); // ← All fail, stock restored
  throw error;
}
```

**Benefits:**
- All-or-nothing guarantee
- No partial updates
- Stock never gets corrupted
- Race condition protection

---

### 3. Row-Level Locking

**Prevents concurrent stock issues:**
```sql
-- Thread 1: Customer A orders 5 units
SELECT stock FROM product_variants WHERE id = 'var_123' FOR UPDATE;
-- Row is LOCKED, other threads wait

-- Thread 2: Customer B tries to order (waits...)
SELECT stock FROM product_variants WHERE id = 'var_123' FOR UPDATE;
-- WAITING...

-- Thread 1 completes
UPDATE product_variants SET stock = 5 WHERE id = 'var_123';
COMMIT; -- Lock released

-- Thread 2 now proceeds
SELECT stock FROM product_variants WHERE id = 'var_123' FOR UPDATE;
-- Gets updated value: 5
```

**Result:** No overselling, no stock corruption

---

## 📱 Admin Interfaces

### 1. Inventory Dashboard

**URL:** `http://localhost:5001/admin/inventory`

**Features:**
- View all products with stock levels
- Inline edit stock (click to edit)
- Low stock alerts (red highlighting)
- Configurable threshold
- Quick access to product editor

**How to Use:**
1. Login as admin
2. Go to "Inventory" in sidebar
3. See all products with stock
4. Products with low stock are highlighted in RED
5. Click stock number to edit
6. Type new value
7. Click outside to save
8. Change is logged automatically

---

### 2. Products Table

**URL:** `http://localhost:5001/admin/products`

**Stock Column:**
- Shows current stock
- Can be edited via product edit form
- Click "Edit" → Update stock field → Save

---

### 3. CSV Import

**URL:** `http://localhost:5001/admin/csv-import-enhanced`

**Workflow:**
1. **Upload** CSV file
2. **Preview** with validation (checks: required fields, data types, SKU conflicts)
3. **Review** errors (highlighted in red)
4. **Import** (only if no errors)
5. **Complete** with summary (98 success, 2 failed)
6. **History** table shows all past imports

---

### 4. Order Detail

**URL:** `http://localhost:5001/admin/orders/[id]`

**Features:**
- View order details
- See items and quantities
- Update order status
- Create shipment
- View shipment tracking
- Customer information

**Status Update Flow:**
1. Click "Mark as Paid" → Order status: 'paid'
2. Click "Create Shipment" → Modal opens
3. Enter carrier & tracking → Submit
4. Order status: 'shipped'
5. Shipment record created
6. Customer can now track

---

## 🔐 Safety Features

### 1. Prevent Overselling
```
Stock: 5 units

Customer A orders 3 → Stock: 2 ✅ (Success)
Customer B orders 4 → Stock: 2 ❌ (Insufficient stock error)
```

**Code:**
```typescript
if (variant.stock < item.quantity) {
  throw new AppError('Insufficient stock', 400);
}
```

---

### 2. Atomic Operations
```
Either:
  ✅ ALL changes succeed (stock deducted, order created, logs saved)
Or:
  ❌ NO changes (rollback, stock unchanged, order not created)
```

---

### 3. Complete Audit Trail
```
Every change is logged:
- Who: admin@saree4ever.com
- What: Stock changed from 10 to 15
- When: 2025-11-22 10:30:00
- Why: Restock from supplier
- Where: Product KAN-001
```

---

## 📈 Stock Tracking Reports

### Available Reports

#### 1. Current Stock Levels
```bash
GET /api/inventory/stock-levels
```
Shows all products with current stock

#### 2. Low Stock Products
```bash
GET /api/inventory/stock-levels?threshold=10
```
Shows products with stock ≤ 10

#### 3. Stock Adjustment History
```bash
GET /api/inventory/adjustments?limit=100
```
Shows last 100 stock changes

#### 4. Product-Specific History
```bash
GET /api/inventory/adjustments?productId=xxx
```
Shows all changes for one product

---

## 🎮 How to Test

### Test 1: View Current Stock
```bash
# 1. Start backend
cd backend && npm run dev

# 2. Login as admin
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saree4ever.com","password":"admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")

# 3. View stock levels
curl "http://localhost:3000/api/inventory/stock-levels" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

### Test 2: Update Stock
```bash
# Find a product ID
PRODUCT_ID="f6f63116-c1c7-49bc-9a32-d7f105826414"

# Update stock to 100
curl -X PUT "http://localhost:3000/api/inventory/stock/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock": 100, "reason": "Test restock"}'
```

### Test 3: Bulk Update
```bash
curl -X POST "http://localhost:3000/api/inventory/bulk-stock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"sku": "KAN-001", "stock": 50},
      {"sku": "KAN-002", "delta": +10}
    ],
    "reason": "Monthly inventory"
  }'
```

### Test 4: View Adjustment History
```bash
curl "http://localhost:3000/api/inventory/adjustments?limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

---

## 📋 Summary Table

| Feature | Location | API Endpoint | How It Works |
|---------|----------|--------------|--------------|
| **View Stock** | `/admin/inventory` | `GET /api/inventory/stock-levels` | Lists all products with stock |
| **Edit Stock** | Inline or product form | `PUT /api/inventory/stock/:id` | Updates variant stock + logs |
| **Bulk Update** | CSV or API | `POST /api/inventory/bulk-stock` | Updates many products at once |
| **Low Stock Alerts** | Dashboard | `GET /api/inventory/stock-levels?threshold=X` | Highlights products with stock ≤ X |
| **Stock History** | API | `GET /api/inventory/adjustments` | Shows all changes with audit info |
| **Order Creation** | Customer checkout | `POST /api/orders` | Auto-deducts stock |
| **Order Management** | `/admin/orders` | `GET /api/admin/orders` | View/update order status |
| **Shipment Creation** | Order detail | `POST /api/shipping/create` | Add tracking info |
| **Shipment Tracking** | `/orders/[id]` | `GET /api/orders/:id` | Customer views tracking |

---

## ✅ What You Have Now

1. **Real-time Inventory**
   - Current stock always accurate
   - Auto-updates on orders
   - Manual editing available
   - Bulk operations supported

2. **Complete Order System**
   - Stock reserved on checkout
   - Payment integration
   - Status workflow (created→paid→shipped→delivered)
   - Admin management interface

3. **Shipment Tracking**
   - Multi-carrier support
   - Tracking numbers
   - Event timeline
   - Customer visibility

4. **Full Audit Trail**
   - Every stock change logged
   - Who, what, when, why
   - Historical reporting
   - Compliance ready

5. **Safety Mechanisms**
   - Transaction locking
   - Stock validation
   - Rollback support
   - Race condition prevention

---

## 🚀 Quick Start Guide

### View Inventory (UI)
```
1. Go to http://localhost:5001/admin
2. Login: admin@saree4ever.com / admin123
3. Click "Inventory" in sidebar
4. See all products with stock levels
```

### Update Stock (UI)
```
1. In Inventory page
2. Click stock number
3. Type new value
4. Click outside → Auto-saves
```

### View Orders (UI)
```
1. Click "Orders" in sidebar
2. See all orders
3. Click "View" on any order
4. See details, create shipment
```

### Test Stock Deduction (API)
```bash
# Create an order (as customer)
# Stock will auto-deduct
# Check stock before and after
```

---

**Everything is working and connected!** Your inventory, orders, and stock tracking are fully integrated and production-ready. 🎉

