# Saree4Ever - System Overview

## How Everything Works Together

### 🔄 Data Flow

```
                    ┌─────────────┐
                    │   CUSTOMER  │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │  Browse     │      │   Search    │
         │  Products   │      │   Filter    │
         └──────┬──────┘      └──────┬──────┘
                │                    │
                └──────────┬─────────┘
                           ↓
                    ┌─────────────┐
                    │  Add to     │
                    │   Cart      │ (localStorage only)
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │  Checkout   │
                    │             │
                    │ POST        │
                    │ /api/orders │ ← Stock DEDUCTED here
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐
                    │   Database:     │
                    │   Stock: 10→8   │
                    │   Order: created│
                    └──────┬──────────┘
                           ↓
                    ┌─────────────┐
                    │   Payment   │
                    │   (Stripe)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐
                    │ Payment Success │
                    │ Status: 'paid'  │
                    └──────┬──────────┘
                           │
                    ┌──────▼──────┐
                    │    ADMIN    │
                    │  Dashboard  │
                    └──────┬──────┘
                           ↓
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌──────▼──────┐
         │   Create    │      │   Update    │
         │  Shipment   │      │   Status    │
         └──────┬──────┘      └──────┬──────┘
                │                    │
                └──────────┬─────────┘
                           ↓
                    ┌─────────────┐
                    │  Shipment   │
                    │   Tracking  │
                    │   Timeline  │
                    └──────┬──────┘
                           ↓
                    ┌─────────────┐
                    │  Delivered  │
                    │  Complete!  │
                    └─────────────┘
```

---

## 🗄️ Database Tables Involved

### Products & Stock
```
products (id, sku, title, price)
    ↓
product_variants (id, product_id, sku, STOCK ← HERE)
    ↓
stock_adjustments (logs every change)
```

### Orders & Shipments
```
users (customer info)
    ↓
orders (id, user_id, status, total)
    ↓
order_items (product, quantity, price)
    ↓
shipments (carrier, tracking, events)
```

### Audit & Logs
```
audit_logs (all admin actions)
stock_adjustments (all stock changes)
import_logs (CSV imports)
```

---

## 🎛️ Admin Controls Summary

| Feature | Page | API | What It Does |
|---------|------|-----|--------------|
| **Dashboard** | `/admin` | - | Overview, stats, recent orders |
| **Products** | `/admin/products` | `GET /api/products` | List, search, edit products |
| **Inventory** | `/admin/inventory` | `GET /api/inventory/stock-levels` | Stock levels, inline edit |
| **Orders** | `/admin/orders` | `GET /api/admin/orders` | View all orders |
| **Order Detail** | `/admin/orders/[id]` | `GET /api/orders/:id` | Manage order, create shipment |
| **CSV Import** | `/admin/csv-import-enhanced` | `POST /api/csv/import` | Bulk import products |
| **Collections** | `/admin/collections` | `GET /api/collections` | Manage collections |
| **Offers** | `/admin/offers` | `GET /api/offers` | Manage promotions |

---

## 🔍 Quick Reference

### Check Product Stock
```bash
curl http://localhost:3000/api/products/PRODUCT_ID
```
Look for: `"variants": [{"stock": 10}]`

### Update Stock (Admin)
```bash
curl -X PUT http://localhost:3000/api/inventory/stock/PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"stock": 50}'
```

### View Stock History
```bash
curl http://localhost:3000/api/inventory/adjustments \
  -H "Authorization: Bearer $TOKEN"
```

### Create Order (Customer)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "items": [{
      "productId": "xxx",
      "variantId": "yyy",
      "quantity": 2
    }],
    "total": 90000
  }'
```

Stock will auto-deduct by 2 units.

---

**Your system is fully functional with complete inventory, order, and stock management!** 🎉
