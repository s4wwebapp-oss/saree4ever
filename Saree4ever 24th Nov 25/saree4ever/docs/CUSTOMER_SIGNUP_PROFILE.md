# Customer Signup - Profile, Roles & Visibility

## Overview

When a customer signs up on Saree4Ever, they receive a user account with specific profile data, role permissions, and visibility settings. This document explains what customers get upon registration.

## Signup Process

### What Happens During Signup

1. **Supabase Authentication**
   - User account created in `auth.users` table (Supabase managed)
   - Email and password stored securely
   - User receives email verification (if enabled)

2. **User Profile Creation**
   - Profile record created in `user_profiles` table
   - Profile includes:
     - `id` (UUID, matches auth.users.id)
     - `full_name` (optional, from signup form)
     - `phone` (optional, from signup form)
     - `created_at` (timestamp)

3. **JWT Token Generation**
   - Backend generates JWT token with:
     - `id`: User UUID
     - `email`: User email
     - `role`: `'user'` (default customer role)
   - Token expires in 7 days

## Customer Profile Structure

### Database Schema

```sql
-- user_profiles table
{
  id: UUID (primary key, references auth.users.id),
  full_name: VARCHAR (nullable),
  phone: VARCHAR (nullable),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Profile Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Matches Supabase auth user ID |
| `full_name` | String | No | Customer's full name |
| `phone` | String | No | Customer's phone number |
| `created_at` | Timestamp | Auto | Account creation date |
| `updated_at` | Timestamp | Auto | Last profile update |

## Customer Role: "user"

### Default Role Assignment

- **Role Name**: `user`
- **Default**: All new signups get `role: 'user'`
- **Cannot be changed by customer**: Only admins can change roles
- **Stored in**: JWT token (not in database by default)

### Role Permissions

Customers with `user` role can:

#### ✅ Allowed Actions

1. **Browse & View**
   - ✅ View all products (published)
   - ✅ View product details
   - ✅ View collections
   - ✅ View categories
   - ✅ View product types
   - ✅ View variants
   - ✅ Check stock availability
   - ✅ View active offers
   - ✅ View blog articles (published)
   - ✅ View hero slides
   - ✅ View announcement bar

2. **Shopping**
   - ✅ Add items to cart
   - ✅ Place orders
   - ✅ View order by order number (public)
   - ✅ View own orders (authenticated)
   - ✅ Cancel own orders
   - ✅ Reserve stock for checkout
   - ✅ Commit stock after payment
   - ✅ Release stock if payment fails

3. **Account Management**
   - ✅ View own account page (`/account`)
   - ✅ View own profile information
   - ✅ View own order history
   - ✅ Access account menu

4. **Storage**
   - ✅ Upload images to `product-media` bucket (if needed)
   - ✅ Update own uploads
   - ✅ Delete own uploads

#### ❌ Restricted Actions

Customers **cannot**:

- ❌ Access admin dashboard (`/admin/*`)
- ❌ Create/edit/delete products
- ❌ Manage inventory
- ❌ View all orders (only their own)
- ❌ Manage shipments
- ❌ Create/edit offers
- ❌ Import CSV files
- ❌ View audit logs
- ❌ Manage blog articles
- ❌ Manage hero slides
- ❌ Manage announcements
- ❌ View other customers' data
- ❌ Change their own role

## Visibility & Access Control

### Public Visibility (No Login Required)

Customers can see these **without signing in**:

- All product listings
- Product details
- Collections
- Categories
- Product types
- Stock availability
- Active offers
- Blog articles
- Hero slides
- Announcement bar

### Authenticated Visibility (Login Required)

Customers **must sign in** to see:

- **Own Orders**: `/api/orders` (returns only their orders)
- **Own Order Details**: `/api/orders/id/:id` (only if they own it)
- **Account Page**: `/account` (shows their profile)
- **User-specific real-time updates**: `/api/realtime/events/user`

### Data Privacy

- **Own Data Only**: Customers can only view their own:
  - Orders
  - Order history
  - Profile information
  - Cart contents (stored in browser/localStorage)

- **Cannot See**:
  - Other customers' orders
  - Other customers' profiles
  - Admin-only data
  - System settings

## Account Page Features

When signed in, customers can access `/account` which shows:

1. **Account Information**
   - Email address
   - Full name (if provided)
   - Phone number (if provided)

2. **Quick Actions**
   - View Orders link
   - View Cart link

3. **Account Menu**
   - My Orders
   - Account Details
   - Shopping Cart
   - Browse Collections

## API Endpoints Available to Customers

### Public Endpoints (No Auth)
```
GET /api/products
GET /api/products/:slug
GET /api/collections
GET /api/categories
GET /api/types
GET /api/offers/active
GET /api/blog
GET /api/blog/:slug
GET /api/hero-slides/active
GET /api/announcement/active
POST /api/orders (create order)
GET /api/orders/:orderNumber (view by order number)
GET /api/inventory/available/:variantId
```

### Authenticated Endpoints (Requires Login)
```
GET /api/orders (own orders only)
GET /api/orders/id/:id (own order only)
POST /api/orders/:id/cancel (own order only)
POST /api/inventory/reserve
POST /api/inventory/commit
POST /api/inventory/release
GET /api/realtime/events/user
GET /api/auth/me
```

## Security Features

### Row Level Security (RLS)

Supabase RLS policies ensure:

1. **Orders Table**
   - Customers can only SELECT their own orders
   - `WHERE user_id = auth.uid()`

2. **User Profiles**
   - Customers can only view/update their own profile
   - `WHERE id = auth.uid()`

3. **Storage**
   - Customers can upload/update/delete only their own files
   - Files are scoped by user ID

### JWT Token Security

- **Token Expiration**: 7 days for regular users
- **Token Storage**: Frontend stores in memory/localStorage
- **Token Validation**: Backend verifies on every authenticated request
- **Role Verification**: Server-side only (never trust client)

## Signup Form Fields

### Required Fields
- **Email**: Must be valid email format
- **Password**: Must meet security requirements (Supabase default)

### Optional Fields
- **Full Name**: Customer's full name
- **Phone**: Contact phone number

### Signup API

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",  // optional
  "phone": "+91 1234567890"  // optional
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-here",
    "email": "customer@example.com"
  }
}
```

## Sign In Process

After signup, customers sign in:

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Sign in successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid-here",
    "email": "customer@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

## Profile Updates

Customers can update their profile (future feature):

```http
PUT /api/users/profile
Authorization: Bearer <token>

{
  "full_name": "Updated Name",
  "phone": "+91 9876543210"
}
```

## Admin Visibility of Customers

Admins can see:

- **Customer List**: `/admin/customers`
- **Customer Details**: Email, name, phone, order count, total spent
- **Customer Orders**: All orders placed by a customer
- **Customer Profile**: Full profile information

## Future Enhancements

Potential additions for customer profiles:

1. **Wishlist/Favorites**
   - Save favorite products
   - Create wishlists

2. **Address Book**
   - Save multiple shipping addresses
   - Set default address

3. **Order Preferences**
   - Preferred payment method
   - Delivery preferences

4. **Profile Picture**
   - Upload avatar image

5. **Account Settings**
   - Change password
   - Email preferences
   - Notification settings

6. **Loyalty Program**
   - Points/credits
   - Rewards history

7. **Review & Ratings**
   - Product reviews
   - Rating history

## Summary

### What Customers Get on Signup:

✅ **Profile Created**
- User account in Supabase auth
- Profile record in `user_profiles` table
- Basic info: email, name (optional), phone (optional)

✅ **Role Assigned**
- Default role: `user`
- JWT token with 7-day expiration
- Access to customer-only features

✅ **Visibility & Access**
- Can view all public content (products, collections, etc.)
- Can view own orders and account
- Cannot access admin features
- Cannot view other customers' data

✅ **Shopping Capabilities**
- Add to cart
- Place orders
- View order history
- Cancel own orders
- Reserve/commit stock for orders

✅ **Account Management**
- Access account page
- View profile information
- View order history
- Quick actions (orders, cart)

### Security & Privacy:

🔒 **Data Protection**
- RLS policies ensure data isolation
- JWT tokens for secure authentication
- Server-side role verification
- Customers can only see their own data

🔒 **Access Control**
- Public content: No login required
- Customer content: Login required
- Admin content: Admin role required

---

**Last Updated**: Current implementation
**Status**: ✅ Customer signup and profile system fully functional

