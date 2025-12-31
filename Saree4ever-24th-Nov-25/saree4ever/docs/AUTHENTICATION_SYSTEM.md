# Authentication System

## Overview

Saree4Ever uses a **hybrid authentication system** combining:
1. **Supabase Auth** - For user management and storage
2. **JWT (JSON Web Tokens)** - For API authentication and authorization

## Architecture

### Two-Layer Authentication

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  - Supabase Client (anon key)                           │
│  - Stores JWT token from backend                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls with JWT
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express/Node.js)               │
│  - Verifies JWT tokens                                  │
│  - Uses Supabase Service Role for admin operations     │
│  - Generates JWT tokens on signin                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Database Operations
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (Database + Auth)                  │
│  - auth.users (user accounts)                           │
│  - user_profiles (extended profile data)                │
│  - Row Level Security (RLS) policies                    │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Supabase Auth

**Purpose**: User account management and storage

**What it handles**:
- User signup (`supabase.auth.signUp()`)
- User signin (`supabase.auth.signInWithPassword()`)
- User storage in `auth.users` table
- Password hashing and security
- Email verification (if enabled)
- Session management

**Configuration**:
- **Frontend**: Uses `anon` key (public, safe for client-side)
- **Backend**: Uses `service_role` key (private, admin access)

**Location**:
- Frontend: `frontend/src/lib/supabase.ts`
- Backend: `backend/config/db.js`

### 2. JWT (JSON Web Tokens)

**Purpose**: API authentication and authorization

**What it handles**:
- API request authentication
- Role-based access control (user vs admin)
- Token generation on signin
- Token verification on protected routes

**Token Structure**:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "user" | "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Token Expiration**:
- **Regular users**: 7 days
- **Admins**: 24 hours

**Location**:
- Token generation: `backend/middleware/auth.js`
- Token verification: `backend/middleware/auth.js`

## Authentication Flow

### Signup Flow

```
1. User submits signup form
   ↓
2. Frontend calls: POST /api/auth/signup
   ↓
3. Backend creates user in Supabase Auth
   - supabase.auth.signUp()
   - Creates record in auth.users
   ↓
4. Backend creates user profile
   - Inserts into user_profiles table
   ↓
5. Backend returns success (no token yet)
   ↓
6. User must sign in to get JWT token
```

### Signin Flow

```
1. User submits signin form
   ↓
2. Frontend calls: POST /api/auth/signin
   ↓
3. Backend authenticates with Supabase
   - supabase.auth.signInWithPassword()
   - Verifies email/password
   ↓
4. Backend fetches user profile
   - Gets role from user_profiles or defaults to 'user'
   ↓
5. Backend generates JWT token
   - generateToken({ id, email, role })
   ↓
6. Backend returns JWT token + user info
   ↓
7. Frontend stores JWT token
   - localStorage or memory
   ↓
8. Frontend includes token in API requests
   - Authorization: Bearer <token>
```

### API Request Flow

```
1. Frontend makes API request
   - Includes: Authorization: Bearer <token>
   ↓
2. Backend middleware verifies token
   - jwt.verify(token, JWT_SECRET)
   - Extracts user info (id, email, role)
   ↓
3. Backend checks authorization
   - authenticate middleware: verifies token
   - isAdmin middleware: checks role === 'admin'
   ↓
4. Request proceeds or returns 401/403
```

## Implementation Details

### Backend Authentication

**File**: `backend/middleware/auth.js`

**Functions**:
- `authenticate` - Verifies JWT token, extracts user info
- `optionalAuth` - Allows both authenticated and public access
- `isAdmin` - Checks if user has admin role
- `generateToken` - Creates JWT for regular users
- `generateAdminToken` - Creates JWT for admins

**Usage**:
```javascript
// Protect route - requires authentication
router.get('/orders', authenticate, controller.getOrders);

// Protect route - requires admin role
router.post('/products', authenticate, isAdmin, controller.createProduct);

// Optional auth - works with or without token
router.get('/products', optionalAuth, controller.getProducts);
```

### Frontend Authentication

**File**: `frontend/src/lib/api.ts`

**Token Storage**:
- JWT token stored in memory or localStorage
- Automatically included in API requests via `Authorization` header

**API Helper**:
```typescript
// Automatically includes token in requests
const response = await api.orders.getAll();
```

## Security Features

### 1. Row Level Security (RLS)

Supabase RLS policies enforce database-level security:

- **Users can only see their own data**
- **Admins can see all data** (via service role)
- **Public data is accessible to everyone**

**Example RLS Policy**:
```sql
-- Users can only view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);
```

### 2. JWT Token Security

- **Secret Key**: Stored in `.env` (never committed)
- **Expiration**: Tokens expire automatically
- **Server-side Verification**: Tokens verified on every request
- **Role-based**: Tokens include role for authorization

### 3. Two-Key System

- **Anon Key**: Public, safe for frontend (limited permissions)
- **Service Role Key**: Private, backend only (full access)

## Environment Variables

### Backend (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (for token signing)
JWT_SECRET=your-secret-key-here

# Admin Emails (comma-separated)
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Frontend (.env.local)

```env
# Supabase Configuration (anon key only)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/signup      - Create new user account
POST /api/auth/signin      - Sign in and get JWT token
POST /api/auth/signout     - Sign out (requires auth)
GET  /api/auth/me          - Get current user info (requires auth)
POST /api/auth/admin/signin - Admin sign in (server-only)
```

### Protected Endpoints

**User Endpoints** (require authentication):
```
GET  /api/orders           - Get user's own orders
GET  /api/orders/id/:id    - Get own order details
POST /api/orders/:id/cancel - Cancel own order
POST /api/inventory/reserve - Reserve stock
POST /api/inventory/commit  - Commit stock
POST /api/inventory/release - Release stock
```

**Admin Endpoints** (require admin role):
```
POST /api/products         - Create product
PUT  /api/products/:id     - Update product
DELETE /api/products/:id   - Delete product
POST /api/inventory/adjust - Adjust stock
GET  /api/orders/admin/all - Get all orders
POST /api/csv-import/*     - CSV import operations
```

## User Roles

### Role: "user" (Default)

- **Assigned**: Automatically on signup
- **Permissions**: View own data, place orders, manage account
- **Token Expiry**: 7 days

### Role: "admin"

- **Assigned**: Manually (via ADMIN_EMAILS env var or roles table)
- **Permissions**: Full access to all features
- **Token Expiry**: 24 hours

## Database Tables

### auth.users (Supabase Managed)

- Managed by Supabase Auth
- Contains: email, password hash, metadata
- Not directly accessible (use Supabase client)

### user_profiles (Custom Table)

- Extends auth.users with additional data
- Fields: id, full_name, phone, avatar_url, etc.
- Linked via foreign key to auth.users.id

### user_roles (Optional)

- Stores user roles
- Fields: user_id, role, created_at, updated_at
- Can be used for dynamic role management

## Advantages of This System

### ✅ Benefits

1. **Supabase Auth**:
   - Built-in security (password hashing, email verification)
   - No need to manage user storage
   - Automatic session management
   - Easy to add OAuth providers later

2. **JWT Tokens**:
   - Stateless authentication (no server-side sessions)
   - Fast API verification
   - Works across multiple servers
   - Includes role for authorization

3. **Hybrid Approach**:
   - Best of both worlds
   - Supabase for user management
   - JWT for API access control
   - Flexible and scalable

### ⚠️ Considerations

1. **Token Storage**: Frontend must securely store JWT tokens
2. **Token Refresh**: Currently manual (user must sign in again after expiry)
3. **Role Management**: Currently via env var (can be enhanced with roles table)

## Future Enhancements

Potential improvements:

1. **Token Refresh**: Automatic token refresh before expiration
2. **OAuth Providers**: Add Google, Facebook, Apple sign-in
3. **MFA**: Multi-factor authentication
4. **Role Management UI**: Admin panel to manage user roles
5. **Session Management**: Track active sessions
6. **Password Reset**: Forgot password flow
7. **Email Verification**: Require email verification before account activation

## Summary

**Current Authentication System**:
- ✅ **Supabase Auth** - User management and storage
- ✅ **JWT Tokens** - API authentication
- ✅ **RLS Policies** - Database-level security
- ✅ **Role-based Access** - User vs Admin permissions

**Flow**:
1. User signs up → Supabase creates account
2. User signs in → Backend generates JWT token
3. User makes API calls → Backend verifies JWT token
4. Database enforces RLS → Users only see their own data

This hybrid approach provides robust security while maintaining flexibility and scalability.


