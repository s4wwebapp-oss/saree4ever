# Admin Access Fix - "Admin access required" Error

## Problem

When logging into the admin panel, you're seeing "Admin access required" on pages like the Customers page. This happens because:

1. The login system was hardcoding all users as `role: 'user'`
2. Admin pages require `role: 'admin'` in the JWT token
3. Your account exists but doesn't have the admin role set in the database

## Solution Applied

### 1. Fixed Authentication Controller ✅

**File:** `backend/controllers/authController.js`

**Changes:**
- Now checks the `user_roles` table during signin
- Includes the actual role in the JWT token
- Returns the correct role to the frontend

```javascript
// Before: Hardcoded role
const token = generateToken({
  id: data.user.id,
  email: data.user.email,
  role: 'user', // ❌ Always 'user'
});

// After: Dynamic role from database
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', data.user.id)
  .single();

const userRole = roleData?.role || 'user';

const token = generateToken({
  id: data.user.id,
  email: data.user.email,
  role: userRole, // ✅ Actual role from database
});
```

---

## How to Set Your Account as Admin

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Complete Setup Script

1. Open the file: `backend/migrations/SETUP_ADMIN_ACCESS.sql`
2. **Copy the ENTIRE file** (it creates the table AND sets admin role)
3. Paste it into the Supabase SQL Editor
4. Click **Run** or press `Ctrl+Enter`

**What this script does:**
- ✅ Creates the `user_roles` table (if it doesn't exist)
- ✅ Sets up security policies
- ✅ Assigns default 'user' role to all existing users
- ✅ Sets 'admin' role for your email addresses
- ✅ Shows verification queries to confirm it worked

### Step 3: Sign Out and Sign In Again

1. In your admin panel, click your profile and **Sign Out**
2. **Sign in again** with the same credentials
3. Your new login will have an admin token
4. All admin pages should now work correctly

---

## Verification

After signing in again, you can verify your admin access:

### Check Your Token (Browser Console)

```javascript
// Open browser console (F12)
const token = localStorage.getItem('token');
console.log(JSON.parse(atob(token.split('.')[1])));

// Should show:
// {
//   id: "uuid...",
//   email: "your-email@example.com",
//   role: "admin",  // ← Should be 'admin'
//   iat: ...,
//   exp: ...
// }
```

### Check Database (Supabase SQL Editor)

```sql
-- Run this to see all admin users
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

---

## What Changed in the Codebase

### Modified Files:

1. **`backend/controllers/authController.js`**
   - Lines 81-88: Added role lookup from `user_roles` table
   - Line 94: Use actual role instead of hardcoded 'user'
   - Line 104: Return actual role in response

### New Files:

2. **`backend/migrations/set_admin_role.sql`**
   - SQL script to set admin role for your account
   - Includes verification query

3. **`ADMIN-ACCESS-FIX.md`** (this file)
   - Complete documentation of the fix
   - Step-by-step instructions

---

## Technical Details

### How Authentication Works Now

```
┌─────────────────┐
│   User Signs In │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Check auth.users table   │
│ (email + password)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Lookup user_roles table  │ ← NEW: Check actual role
│ Get role ('admin' or     │
│ 'user')                  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Generate JWT token       │
│ with role included       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Return token + user info │
│ Frontend stores token    │
└──────────────────────────┘
```

### Middleware Flow

```
Admin Page Request
       │
       ▼
┌──────────────────┐
│ authenticate     │ ← Verify JWT token exists
│ middleware       │   Extract req.user from token
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ isAdmin          │ ← Check req.user.role === 'admin'
│ middleware       │   Allow/deny access
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Controller       │ ← Execute admin function
│ (e.g., getAll    │   (e.g., fetch all orders)
│ orders)          │
└──────────────────┘
```

---

## Troubleshooting

### Problem: Still seeing "Admin access required" after running SQL

**Solution:**
1. Make sure you signed out completely
2. Clear localStorage: `localStorage.clear()` in browser console
3. Sign in again with your admin account

### Problem: SQL says "0 rows updated"

**Solution:**
1. Check if your user exists:
   ```sql
   SELECT email FROM auth.users WHERE email = 'your-email@example.com';
   ```
2. If no results, you haven't created an account yet - sign up first
3. Then run the admin role SQL again

### Problem: Token still shows role: 'user'

**Solution:**
1. The old token is cached
2. Sign out completely
3. Close all browser tabs
4. Open a new browser window
5. Sign in again

---

## Security Notes

⚠️ **Important:**
- Only set admin role for trusted users
- Admin users have full access to:
  - All orders
  - All customer data
  - Product management
  - Content management
  - Site settings

🔒 **Best Practice:**
- Use separate admin accounts (don't use personal shopping accounts as admin)
- Regularly audit who has admin access:
  ```sql
  SELECT u.email, ur.role, ur.created_at
  FROM auth.users u
  JOIN user_roles ur ON u.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at DESC;
  ```

---

## Related Documentation

- [User Roles Schema](backend/migrations/create_user_profiles_table.sql)
- [Authentication Middleware](backend/middleware/auth.js)
- [Security Roles Documentation](backend/docs/SECURITY_ROLES.md)

---

**Status:** ✅ Fix completed - Ready to apply

**Next Steps:**
1. Run the SQL migration with your email
2. Sign out and sign in again
3. Verify admin access works
