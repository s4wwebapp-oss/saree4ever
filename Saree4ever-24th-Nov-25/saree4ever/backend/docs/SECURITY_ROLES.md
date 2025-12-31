# Security and Roles Guide

## Overview

The backend implements role-based access control (RBAC) with three user roles:

1. **Public** - Unauthenticated users
2. **User** - Authenticated customers
3. **Admin** - Administrators

## Access Control Matrix

| Resource | Public | User | Admin |
|----------|--------|------|-------|
| **View Products** | ✅ | ✅ | ✅ |
| **View Collections** | ✅ | ✅ | ✅ |
| **View Categories** | ✅ | ✅ | ✅ |
| **View Types** | ✅ | ✅ | ✅ |
| **View Variants** | ✅ | ✅ | ✅ |
| **Check Stock** | ✅ | ✅ | ✅ |
| **Place Orders** | ✅ | ✅ | ✅ |
| **View Own Orders** | ❌ | ✅ | ✅ |
| **Cancel Own Orders** | ❌ | ✅ | ✅ |
| **Create Products** | ❌ | ❌ | ✅ |
| **Update Products** | ❌ | ❌ | ✅ |
| **Delete Products** | ❌ | ❌ | ✅ |
| **Manage Variants** | ❌ | ❌ | ✅ |
| **Manage Inventory** | ❌ | ❌ | ✅ |
| **Manage Orders** | ❌ | ❌ | ✅ |
| **Manage Shipments** | ❌ | ❌ | ✅ |
| **Manage Offers** | ❌ | ❌ | ✅ |
| **CSV Import** | ❌ | ❌ | ✅ |

## Authentication Methods

### 1. JWT Tokens

**For:** API authentication

**How it works:**
- User signs in → Backend generates JWT token
- Token includes: `id`, `email`, `role`
- Token sent in `Authorization: Bearer <token>` header
- Token expires in 7 days (users) or 24 hours (admins)

**Usage:**
```javascript
// Sign in
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "email": "...", "role": "user" }
}

// Use token
GET /api/orders
Authorization: Bearer <token>
```

### 2. Supabase RLS (Row Level Security)

**For:** Database-level security

**How it works:**
- Supabase enforces RLS policies at database level
- Policies check `auth.uid()` and `auth.role()`
- Prevents unauthorized data access even if API is bypassed

**Current RLS Policies:**
- **Products**: Public can read active products, service role can manage
- **Orders**: Users can view their own orders, service role can manage all
- **Inventory**: Authenticated users can view, service role can manage

### 3. Combined (JWT + RLS)

**Best Practice:** Use both together
- JWT for API authentication
- RLS for database security
- Double layer of protection

## Route Protection

### Public Routes (No Authentication)

```javascript
// Anyone can access
router.get('/', controller.getAllProducts);
```

**Examples:**
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/collections`
- `GET /api/categories`
- `GET /api/types`
- `GET /api/offers/active`
- `POST /api/orders` (create order)
- `GET /api/orders/:orderNumber` (view by order number)

### User Routes (Authentication Required)

```javascript
// Requires authentication
router.use(authenticate);
router.get('/', controller.getUserOrders);
```

**Examples:**
- `GET /api/orders` (user's own orders)
- `GET /api/orders/id/:id` (own order)
- `POST /api/orders/:id/cancel` (cancel own order)
- `POST /api/inventory/reserve` (reserve stock for order)
- `GET /api/realtime/events/user` (user-specific updates)

### Admin Routes (Admin Role Required)

```javascript
// Requires admin role
router.use(authenticate);
router.use(isAdmin);
router.post('/', controller.createProduct);
```

**Examples:**
- `POST /api/products` (create product)
- `PUT /api/products/:id` (update product)
- `DELETE /api/products/:id` (delete product)
- `POST /api/variants` (create variant)
- `POST /api/inventory/adjust` (adjust stock)
- `PATCH /api/orders/:id/status` (update order status)
- `POST /api/orders/:id/ship` (ship order)
- `POST /api/csv-import/products` (upload CSV)
- `GET /api/orders/admin/all` (view all orders)

## Admin Authentication

### Setting Up Admin Users

**Option 1: Environment Variable (Simple)**
```env
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**Option 2: Database Roles Table (Recommended)**
Create a `user_roles` table:
```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Option 3: Supabase RLS**
Use Supabase's built-in role system.

### Admin Sign In

```http
POST /api/auth/admin/signin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "token": "admin_jwt_token",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## Security Best Practices

### 1. Token Security
- ✅ Store JWT_SECRET securely (never commit to git)
- ✅ Use different secrets for dev/production
- ✅ Rotate secrets regularly
- ✅ Set appropriate token expiration

### 2. Role Verification
- ✅ Always verify role on server-side
- ✅ Never trust client-side role claims
- ✅ Use middleware to check roles
- ✅ Combine JWT + RLS for double protection

### 3. API Security
- ✅ Use HTTPS in production
- ✅ Validate all inputs
- ✅ Rate limit API endpoints
- ✅ Log security events

### 4. Database Security
- ✅ Enable RLS on all tables
- ✅ Use service role key only in backend
- ✅ Never expose service role key to frontend
- ✅ Use anon key for frontend

## Route Protection Examples

### Products API

```javascript
// Public: View products
GET /api/products
GET /api/products/:slug

// Admin: Manage products
POST /api/products          (authenticate + isAdmin)
PUT /api/products/:id       (authenticate + isAdmin)
DELETE /api/products/:id    (authenticate + isAdmin)
```

### Orders API

```javascript
// Public: Create order
POST /api/orders
GET /api/orders/:orderNumber

// User: View own orders
GET /api/orders             (authenticate)
GET /api/orders/id/:id      (authenticate)
POST /api/orders/:id/cancel (authenticate)

// Admin: Manage all orders
PATCH /api/orders/:id/status (authenticate + isAdmin)
POST /api/orders/:id/ship    (authenticate + isAdmin)
```

### Inventory API

```javascript
// Public: Check stock
GET /api/inventory/available/:variantId

// User: Reserve/commit/release (for orders)
POST /api/inventory/reserve  (authenticate)
POST /api/inventory/commit   (authenticate)
POST /api/inventory/release  (authenticate)

// Admin: View all and adjust
GET /api/inventory/variant/:variantId  (authenticate + isAdmin)
POST /api/inventory/adjust            (authenticate + isAdmin)
```

## Testing Access Control

### Test Public Access
```bash
# Should work without token
curl http://localhost:5001/api/products
```

### Test User Access
```bash
# Should work with user token
curl -H "Authorization: Bearer <user_token>" \
  http://localhost:5001/api/orders

# Should fail (not admin)
curl -H "Authorization: Bearer <user_token>" \
  -X POST http://localhost:5001/api/products
```

### Test Admin Access
```bash
# Should work with admin token
curl -H "Authorization: Bearer <admin_token>" \
  -X POST http://localhost:5001/api/products \
  -d '{"name":"Test Product","base_price":100}'
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```
or
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```
or
```json
{
  "error": "Authentication required"
}
```

## Environment Variables

```env
# JWT Secret (required)
JWT_SECRET=your_secret_key_here

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Supabase Keys
SUPABASE_SERVICE_ROLE_KEY=... # Backend only
SUPABASE_ANON_KEY=... # Frontend safe
```

## Next Steps

1. **Create roles table** (optional, for dynamic role management)
2. **Add role assignment** (admin dashboard)
3. **Implement rate limiting** (prevent abuse)
4. **Add audit logging** (track admin actions)
5. **Set up CORS properly** (production)

---

**Status**: ✅ Role-based access control implemented

