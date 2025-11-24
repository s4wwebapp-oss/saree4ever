# Admin Authentication Setup

## Overview
The admin panel uses JWT-based authentication with Supabase. To access admin features, you need to set up proper authentication.

---

## Backend Setup

### 1. Environment Variables

Add these to your `backend/.env` file:

```env
# JWT Secret (generate a strong random string)
JWT_SECRET=your-secret-key-here

# Admin Emails (comma-separated list)
ADMIN_EMAILS=admin@saree4ever.com,your-email@example.com

# Supabase credentials (should already be set)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Generate JWT_SECRET

```bash
# Generate a secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Frontend Setup

### 1. Environment Variables

Add these to your `frontend/.env.local` file:

```env
# Admin credentials
NEXT_PUBLIC_ADMIN_EMAIL=admin@saree4ever.com
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Supabase credentials (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Supabase Setup

### 1. Create Admin User

Go to your Supabase project and create an admin user:

1. Open Supabase Dashboard
2. Go to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter:
   - Email: `admin@saree4ever.com` (or your preferred email)
   - Password: Your secure admin password
   - Email Confirm: ✅ (mark as confirmed)
5. Click **Create user**

### 2. Verify User

The admin user must:
- ✅ Have a Supabase account (authentication)
- ✅ Be listed in `ADMIN_EMAILS` environment variable
- ✅ Have email confirmed in Supabase

---

## Admin Login Flow

### How It Works

```
1. User visits /admin
2. Enters password
3. Frontend calls POST /api/auth/admin/signin with:
   - email (from NEXT_PUBLIC_ADMIN_EMAIL)
   - password (from user input)
4. Backend verifies:
   - Credentials against Supabase
   - Email is in ADMIN_EMAILS list
5. Backend returns JWT token with role: 'admin'
6. Frontend stores token in localStorage
7. All subsequent API calls use this token
```

### Token Structure

The JWT token contains:

```json
{
  "id": "user-uuid",
  "email": "admin@saree4ever.com",
  "role": "admin",
  "exp": 1234567890
}
```

---

## Testing Admin Access

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Authentication

1. Visit `http://localhost:3000/admin`
2. Enter the admin password
3. You should see the admin dashboard
4. Open Browser DevTools → Network
5. Check API calls have `Authorization: Bearer <token>` header

---

## Troubleshooting

### Error: "No token provided"

**Cause:** API calls aren't sending authentication token

**Solutions:**
- Check token is stored in localStorage: `localStorage.getItem('token')`
- Verify backend receives Authorization header
- Check JWT_SECRET is set in backend .env
- Ensure admin user exists in Supabase

### Error: "Invalid or expired token"

**Cause:** Token is malformed or expired

**Solutions:**
- Re-login to get a fresh token
- Check JWT_SECRET matches between token generation and verification
- Verify token hasn't expired (24h for admin tokens)

### Error: "Admin access denied"

**Cause:** Email not in ADMIN_EMAILS list

**Solutions:**
- Add your email to ADMIN_EMAILS in backend .env
- Restart backend server after changing .env
- Verify email spelling matches exactly

### Error: "Invalid email or password"

**Cause:** Credentials don't match Supabase user

**Solutions:**
- Verify user exists in Supabase Authentication
- Check password is correct
- Ensure email is confirmed in Supabase
- Try resetting password in Supabase Dashboard

---

## Security Best Practices

### Production Setup

1. **Never commit .env files**
   - Add `.env` and `.env.local` to `.gitignore`
   - Use environment variables in deployment platform

2. **Use strong JWT_SECRET**
   - Minimum 32 characters
   - Random alphanumeric string
   - Different for each environment

3. **Secure admin passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Never share or hardcode

4. **Limit admin emails**
   - Only add trusted admin emails
   - Review and remove old admin access
   - Use role-based access control

5. **Use HTTPS**
   - Always use HTTPS in production
   - Never send tokens over HTTP
   - Enable CORS properly

6. **Token expiration**
   - Admin tokens expire in 24 hours
   - User tokens expire in 7 days
   - Implement token refresh if needed

---

## Admin Routes Protection

All admin routes are protected with middleware:

```javascript
// In backend/routes/*.js
router.use(authenticate);  // Requires valid JWT token
router.use(isAdmin);       // Requires role: 'admin'
```

Protected routes:
- ✅ `/api/hero-slides/*` (except `/active`)
- ✅ `/api/announcement/*` (admin endpoints)
- ✅ `/api/blog/*` (admin endpoints)
- ✅ `/api/collections/*` (write operations)
- ✅ `/api/types/*` (write operations)
- ✅ `/api/categories/*` (write operations)
- ✅ `/api/products/*` (write operations)
- ✅ `/api/orders/*`
- ✅ `/api/inventory/*`
- ✅ `/api/audit/*`

Public routes (no auth required):
- ✅ `/api/products` (read-only)
- ✅ `/api/collections` (read-only)
- ✅ `/api/types` (read-only)
- ✅ `/api/categories` (read-only)
- ✅ `/api/hero-slides/active`
- ✅ `/api/announcement/active`
- ✅ `/api/blog` (public posts)

---

## Quick Setup Checklist

- [ ] Generate JWT_SECRET and add to backend .env
- [ ] Add admin email to ADMIN_EMAILS in backend .env
- [ ] Create admin user in Supabase with same email
- [ ] Set NEXT_PUBLIC_ADMIN_EMAIL in frontend .env.local
- [ ] Set NEXT_PUBLIC_ADMIN_PASSWORD in frontend .env.local
- [ ] Restart both backend and frontend servers
- [ ] Test login at /admin
- [ ] Verify API calls have Authorization header

---

## Example .env Files

### backend/.env

```env
# Required
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
ADMIN_EMAILS=admin@saree4ever.com

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server
PORT=5001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

### frontend/.env.local

```env
# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@saree4ever.com
NEXT_PUBLIC_ADMIN_PASSWORD=SecureP@ssw0rd123

# API
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Complete  
**Related Docs:**
- `ADMIN_FEATURES_COMPLETE.md` - Full admin features guide
- `ADMIN_WIRING_SUMMARY.md` - Admin setup summary


