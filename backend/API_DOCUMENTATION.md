# API Documentation

Complete API documentation for Saree4ever backend.

## Base URL

```
http://localhost:5001/api
```

## Authentication

Most admin routes require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Products API

### Get All Products
```
GET /api/products
```

**Query Parameters:**
- `collection` - Filter by collection ID
- `category` - Filter by category ID
- `type` - Filter by type ID
- `featured` - Filter featured products (true/false)
- `active` - Filter active products (default: true)
- `search` - Search in name and description
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "products": [...],
  "count": 10
}
```

### Get Product by Slug
```
GET /api/products/:slug
```

### Get Product by ID
```
GET /api/products/id/:id
```

### Create Product (Admin)
```
POST /api/products
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Kanjivaram Pure Silk",
  "description": "Beautiful saree",
  "collection_id": "uuid",
  "category_id": "uuid",
  "type_id": "uuid",
  "base_price": 9999.00,
  "compare_at_price": 12999.00,
  "sku": "P1",
  "tags": ["silk", "bridal"]
}
```

### Update Product (Admin)
```
PUT /api/products/:id
Authorization: Bearer <token>
```

### Delete Product (Admin)
```
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Update Product Status (Admin)
```
PATCH /api/products/:id/status
Authorization: Bearer <token>
```

**Body:**
```json
{
  "is_active": true,
  "is_featured": false
}
```

---

## 2. Variants API

### Get Variants by Product
```
GET /api/variants/product/:productId
```

### Get Variant by ID
```
GET /api/variants/:id
```

### Create Variant (Admin)
```
POST /api/variants
Authorization: Bearer <token>
```

**Body:**
```json
{
  "product_id": "uuid",
  "name": "Maroon with Blouse",
  "sku": "V1",
  "price": 9999.00,
  "color": "Maroon",
  "has_blouse": true,
  "blouse_included": true,
  "stock_quantity": 5
}
```

### Update Variant (Admin)
```
PUT /api/variants/:id
Authorization: Bearer <token>
```

### Delete Variant (Admin)
```
DELETE /api/variants/:id
Authorization: Bearer <token>
```

### Update Stock (Admin)
```
PATCH /api/variants/:id/stock
Authorization: Bearer <token>
```

**Body:**
```json
{
  "stock_quantity": 10
}
```

---

## 3. Inventory API

All routes require authentication.

### Get Inventory by Variant
```
GET /api/inventory/variant/:variantId
Authorization: Bearer <token>
```

### Get Inventory by Order
```
GET /api/inventory/order/:orderId
Authorization: Bearer <token>
```

### Get Inventory History
```
GET /api/inventory/history/:variantId
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

### Adjust Inventory (Admin)
```
POST /api/inventory/adjust
Authorization: Bearer <token>
```

**Body:**
```json
{
  "variant_id": "uuid",
  "quantity_change": 10,
  "type": "adjustment",
  "notes": "Stock adjustment",
  "reference_number": "REF-123"
}
```

### Reserve Stock
```
POST /api/inventory/reserve
Authorization: Bearer <token>
```

**Body:**
```json
{
  "variant_id": "uuid",
  "quantity": 2,
  "order_id": "uuid"
}
```

### Release Stock
```
POST /api/inventory/release
Authorization: Bearer <token>
```

**Body:**
```json
{
  "variant_id": "uuid",
  "quantity": 2,
  "order_id": "uuid"
}
```

---

## 4. Orders API

### Create Order
```
POST /api/orders
```

**Body:**
```json
{
  "email": "customer@example.com",
  "phone": "9876543210",
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
  ],
  "subtotal": 9999.00,
  "tax_amount": 0,
  "shipping_amount": 0,
  "discount_amount": 0
}
```

### Get Order by Order Number
```
GET /api/orders/:orderNumber
```

### Get Order by ID (Authenticated)
```
GET /api/orders/id/:id
Authorization: Bearer <token>
```

### Get User Orders
```
GET /api/orders
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)
- `status` - Filter by status

### Update Order Status
```
PATCH /api/orders/:id/status
Authorization: Bearer <token>
```

**Body:**
```json
{
  "status": "shipped",
  "tracking_number": "TRACK123",
  "admin_notes": "Shipped via courier"
}
```

### Update Payment Status
```
PATCH /api/orders/:id/payment
Authorization: Bearer <token>
```

**Body:**
```json
{
  "payment_status": "paid",
  "payment_method": "razorpay",
  "payment_transaction_id": "txn_123"
}
```

### Cancel Order
```
POST /api/orders/:id/cancel
Authorization: Bearer <token>
```

### Get All Orders (Admin)
```
GET /api/orders/admin/all
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`, `offset`, `status`, `payment_status`

### Get Order Statistics (Admin)
```
GET /api/orders/admin/stats
Authorization: Bearer <token>
```

---

## 5. Shipments API

All routes require authentication.

### Get Shipments by Order
```
GET /api/shipments/order/:orderId
Authorization: Bearer <token>
```

### Get Shipment by ID
```
GET /api/shipments/:id
Authorization: Bearer <token>
```

### Create Shipment (Admin)
```
POST /api/shipments
Authorization: Bearer <token>
```

**Body:**
```json
{
  "order_id": "uuid",
  "tracking_number": "TRACK123",
  "courier_name": "FedEx",
  "tracking_url": "https://...",
  "estimated_delivery_date": "2024-12-01"
}
```

### Update Shipment (Admin)
```
PUT /api/shipments/:id
Authorization: Bearer <token>
```

### Update Tracking (Admin)
```
PATCH /api/shipments/:id/tracking
Authorization: Bearer <token>
```

**Body:**
```json
{
  "tracking_number": "TRACK456",
  "courier_name": "DHL",
  "tracking_url": "https://..."
}
```

### Update Shipment Status (Admin)
```
PATCH /api/shipments/:id/status
Authorization: Bearer <token>
```

**Body:**
```json
{
  "status": "delivered",
  "estimated_delivery_date": "2024-12-01",
  "delivered_at": "2024-12-01T10:00:00Z"
}
```

---

## 6. Offers API

### Get Active Offers
```
GET /api/offers/active
```

### Get All Offers (Admin)
```
GET /api/offers
Authorization: Bearer <token>
```

### Get Offer by ID
```
GET /api/offers/:id
```

### Create Offer (Admin)
```
POST /api/offers
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Festive Sale",
  "discount_type": "percent",
  "discount_value": 20,
  "collection_id": "uuid",
  "start_date": "2024-12-01",
  "end_date": "2024-12-31"
}
```

### Update Offer (Admin)
```
PUT /api/offers/:id
Authorization: Bearer <token>
```

### Delete Offer (Admin)
```
DELETE /api/offers/:id
Authorization: Bearer <token>
```

### Update Offer Status (Admin)
```
PATCH /api/offers/:id/status
Authorization: Bearer <token>
```

**Body:**
```json
{
  "is_active": true
}
```

---

## 7. CSV Import API

All routes require admin authentication.

### Import Products
```
POST /api/csv-import/products
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** CSV file with columns: name, description, collection_id, category_id, type_id, base_price, sku, tags

### Import Variants
```
POST /api/csv-import/variants
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** CSV file with columns: product_id, name, sku, price, color, has_blouse, stock_quantity

### Import Stock
```
POST /api/csv-import/stock
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:** CSV file with columns: variant_id (or sku), stock_quantity, current_stock

### Import Offers
```
POST /api/csv-import/offers
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Response (for all CSV imports):**
```json
{
  "message": "Imported successfully",
  "imported": 10,
  "failed": 2,
  "errors": [
    {
      "row": 5,
      "error": "Invalid data"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Collections, Categories, Types APIs

These are already implemented and available at:
- `GET /api/collections`
- `GET /api/categories`
- `GET /api/types`

---

**Last Updated:** 2024-11-24

