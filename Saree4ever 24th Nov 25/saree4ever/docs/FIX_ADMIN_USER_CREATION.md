# Fix: Database Error Creating Admin User in Supabase

## 🔍 Common Errors

### Error 1: "relation user_profiles does not exist"
**Cause:** Tables haven't been created yet

**Solution:** Run the migration SQL file

### Error 2: "permission denied for table user_profiles"
**Cause:** RLS policies blocking the insert

**Solution:** Ensure service_role can bypass RLS

### Error 3: "trigger function handle_new_user() does not exist"
**Cause:** Trigger function wasn't created

**Solution:** Run the fix script

---

## ✅ Quick Fix (5 minutes)

### Step 1: Run the Fix Script

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of:
   ```
   backend/migrations/fix_user_profiles_setup.sql
   ```
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. ✅ You should see "Setup complete!" message

### Step 2: Create Admin User

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email:** `admin@saree4ever.com`
   - **Password:** Your secure password
   - **Auto Confirm User:** ✅ Check this
   - **Send invitation email:** ❌ Uncheck (optional)
4. Click **Create user**
5. ✅ User should be created successfully

**Option B: Via SQL (If Dashboard fails)**

Run this in SQL Editor:

```sql
-- Create user via Supabase Auth
-- Note: This requires service_role key or admin access
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@saree4ever.com',
  crypt('YourPasswordHere', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}'
)
ON CONFLICT (email) DO NOTHING;
```

**Option C: Manual Profile Creation (If trigger fails)**

If the user was created but profile wasn't:

```sql
-- Get the user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@saree4ever.com';

-- Then create profile manually (replace USER_ID with actual ID)
INSERT INTO user_profiles (id, full_name)
VALUES ('USER_ID', 'Admin User')
ON CONFLICT (id) DO NOTHING;

-- Create role
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

---

## 🔧 Detailed Troubleshooting

### Check 1: Tables Exist?

Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'user_roles');
```

**Expected:** Should return 2 rows

**If empty:** Run `backend/migrations/create_user_profiles_table.sql`

### Check 2: Trigger Exists?

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';
```

**Expected:** Should return 1 row

**If empty:** Run the fix script

### Check 3: RLS Policies Correct?

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename, policyname;
```

**Expected:** Should see policies including "Service role can manage all profiles"

### Check 4: Function Has SECURITY DEFINER?

```sql
SELECT 
  proname,
  prosecdef, -- Should be true
  proconfig
FROM pg_proc
WHERE proname = 'handle_new_user';
```

**Expected:** `prosecdef` should be `true`

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot insert into user_profiles"

**Solution:**
```sql
-- Temporarily disable RLS to test
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create user
-- (create user in dashboard)

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### Issue: "Trigger function execution failed"

**Solution:**
```sql
-- Check function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- If missing, recreate it (from fix script)
```

### Issue: "Foreign key constraint violation"

**Solution:**
```sql
-- Check if user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'admin@saree4ever.com';

-- If not, create user first via Dashboard
```

### Issue: "Permission denied for schema public"

**Solution:**
```sql
-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_roles TO authenticated;
```

---

## ✅ Verification

After creating the admin user, verify everything works:

```sql
-- 1. Check user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@saree4ever.com';

-- 2. Check profile was created
SELECT id, full_name 
FROM user_profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@saree4ever.com');

-- 3. Check role was set (optional - can set manually)
SELECT user_id, role 
FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@saree4ever.com');
```

**Expected Results:**
- ✅ User exists in `auth.users`
- ✅ Profile exists in `user_profiles`
- ✅ Role exists in `user_roles` (or can be set manually)

---

## 🎯 Quick Test

After setup, test admin login:

1. **Backend:** Make sure `ADMIN_EMAILS=admin@saree4ever.com` in `.env`
2. **Frontend:** Visit `/admin`
3. **Login:** Use the password you set
4. ✅ Should login successfully

---

## 📋 Complete Setup Checklist

- [ ] Run `fix_user_profiles_setup.sql` in Supabase SQL Editor
- [ ] Verify tables exist (`user_profiles`, `user_roles`)
- [ ] Verify trigger exists (`on_auth_user_created`)
- [ ] Create admin user via Dashboard
- [ ] Verify profile was auto-created
- [ ] Set admin role (if using user_roles table)
- [ ] Test admin login at `/admin`
- [ ] Verify API calls work with token

---

## 🔐 Setting Admin Role

If you're using the `user_roles` table:

```sql
-- Set admin role for user
UPDATE user_roles
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@saree4ever.com');

-- Or insert if doesn't exist
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@saree4ever.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

**Note:** The backend currently checks `ADMIN_EMAILS` environment variable, not the `user_roles` table. But you can set it for future use.

---

## 📚 Related Files

- **Fix Script:** `backend/migrations/fix_user_profiles_setup.sql`
- **Original Migration:** `backend/migrations/create_user_profiles_table.sql`
- **Auth Setup:** `docs/ADMIN_AUTH_SETUP.md`

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Ready to Use

If you still get errors after running the fix script, share the exact error message and I'll help debug further!


