-- ============================================
-- COMPLETE FIX: Landing Page Video RLS Policies
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Admins can manage landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Anyone can read active landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Authenticated users can insert landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Authenticated users can update landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Authenticated users can delete landing page video" ON landing_page_video;

-- Step 2: Create new policies

-- Policy 1: Public can read active videos
CREATE POLICY "Public can read active landing page video"
  ON landing_page_video FOR SELECT
  USING (is_active = true);

-- Policy 2: Authenticated users can insert (for admin API)
CREATE POLICY "Authenticated users can insert landing page video"
  ON landing_page_video FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Authenticated users can update
CREATE POLICY "Authenticated users can update landing page video"
  ON landing_page_video FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Authenticated users can delete
CREATE POLICY "Authenticated users can delete landing page video"
  ON landing_page_video FOR DELETE
  TO authenticated
  USING (true);

-- Step 3: Verify policies were created
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'landing_page_video'
ORDER BY policyname;

-- Step 4: Test query (should return policies)
-- If you see 4 policies above, the fix is complete!





