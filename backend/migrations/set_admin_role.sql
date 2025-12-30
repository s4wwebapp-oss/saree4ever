-- Set admin role for specific user account
-- Run this in Supabase SQL Editor to grant admin access

-- INSTRUCTIONS:
-- 1. Replace 'your-email@example.com' with your actual admin email address
-- 2. Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard/project/YOUR_PROJECT/editor)
-- 3. After running, sign out and sign in again to get a new token with admin role

-- Update user role to admin (replace with your email)
UPDATE user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id
  FROM auth.users
  WHERE email = 'admin@saree4ever.com'
);

-- If the user_roles entry doesn't exist, create it
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@saree4ever.com'
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin';

-- Verify the change
SELECT
  u.email,
  ur.role,
  ur.updated_at
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'abhi.mr3@gmail.com';
