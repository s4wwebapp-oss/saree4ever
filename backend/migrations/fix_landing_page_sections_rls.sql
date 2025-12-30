-- Fix RLS policies for landing_page_sections table
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to landing_page_sections" ON landing_page_sections;
DROP POLICY IF EXISTS "Allow admin full access to landing_page_sections" ON landing_page_sections;

-- Policy 1: Anyone can read sections (public access)
CREATE POLICY "Public can read landing page sections"
  ON landing_page_sections FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can insert (for admin API)
CREATE POLICY "Authenticated users can insert landing page sections"
  ON landing_page_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Authenticated users can update
CREATE POLICY "Authenticated users can update landing page sections"
  ON landing_page_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Authenticated users can delete
CREATE POLICY "Authenticated users can delete landing page sections"
  ON landing_page_sections FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies were created
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'landing_page_sections'
ORDER BY policyname;





