# Access Control Summary

## Quick Reference

### Public (No Authentication)
✅ Can view:
- Products
- Collections
- Categories
- Types
- Variants
- Active offers
- Available stock

✅ Can do:
- Create orders
- View order by order number

### User (Authenticated)
✅ Can do everything Public can, plus:
- View own orders
- Cancel own orders
- Reserve/commit/release stock (for orders)
- Receive real-time updates for own orders

### Admin (Authenticated + Admin Role)
✅ Can do everything User can, plus:
- Create/update/delete products
- Create/update/delete variants
- Adjust inventory
- View all orders
- Update order status
- Ship orders
- Update tracking
- Manage offers
- Upload CSV files
- View all inventory records

## Route Protection

| Route | Public | User | Admin |
|-------|--------|------|-------|
| `GET /api/products` | ✅ | ✅ | ✅ |
| `POST /api/products` | ❌ | ❌ | ✅ |
| `GET /api/orders` | ❌ | ✅ | ✅ |
| `POST /api/orders` | ✅ | ✅ | ✅ |
| `POST /api/csv-import/products` | ❌ | ❌ | ✅ |

## Security Layers

1. **JWT Authentication** - Verifies user identity
2. **Role Checking** - Verifies user permissions
3. **Supabase RLS** - Database-level security
4. **Route Middleware** - API-level protection

---

**Status**: ✅ All routes protected with proper access control

