-- ============================================================
-- ADMIN ACCESS SETUP - RUN THIS COMPLETE SCRIPT IN ORDER
-- ============================================================
-- This script creates the user_roles table and sets admin access
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- STEP 1: Create user_roles table
-- ============================================================

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user', 'admin', 'manager', 'support'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on role for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;

-- Policy: Users can view their own role
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all roles
CREATE POLICY "Service role can manage all roles"
  ON user_roles FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- STEP 2: Create default user roles for existing users
-- ============================================================

-- Insert 'user' role for all existing users who don't have a role yet
INSERT INTO user_roles (user_id, role)
SELECT id, 'user'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- STEP 3: Set admin role for your account
-- ============================================================

-- Set admin role for admin@saree4ever.com
UPDATE user_roles
SET role = 'admin', updated_at = NOW()
WHERE user_id = (
  SELECT id
  FROM auth.users
  WHERE email = 'admin@saree4ever.com'
);

-- If the role doesn't exist for this user, create it
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@saree4ever.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();

-- Set admin role for abhi.mr3@gmail.com (if different from above)
UPDATE user_roles
SET role = 'admin', updated_at = NOW()
WHERE user_id = (
  SELECT id
  FROM auth.users
  WHERE email = 'abhi.mr3@gmail.com'
);

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'abhi.mr3@gmail.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();

-- ============================================================
-- STEP 4: Verify the setup
-- ============================================================

-- Check all admin users
SELECT
  u.email,
  ur.role,
  ur.created_at,
  ur.updated_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- Check all users and their roles
SELECT
  u.email,
  COALESCE(ur.role, 'no role') as role,
  u.created_at as user_created,
  ur.created_at as role_created
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
-- If you see your email with role='admin' above, you're all set!
-- Next steps:
-- 1. Restart your backend server (Ctrl+C then npm start)
-- 2. Sign out from admin panel
-- 3. Sign in again
-- 4. Admin pages should now work!
-- ============================================================
