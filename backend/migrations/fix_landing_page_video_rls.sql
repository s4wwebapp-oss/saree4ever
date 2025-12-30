-- Fix RLS policies for landing_page_video table
-- Run this in Supabase SQL Editor to fix "new row violates row-level security policy" error

-- First, let's check and drop existing policies
DROP POLICY IF EXISTS "Admins can manage landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Anyone can read active landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Authenticated users can insert landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Authenticated users can update landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Authenticated users can delete landing page video" ON landing_page_video;

-- Policy 1: Anyone can read active videos (public access)
CREATE POLICY "Anyone can read active landing page video"
  ON landing_page_video FOR SELECT
  USING (is_active = true);

-- Policy 2: Authenticated users can insert videos
-- This allows the backend API (using authenticated admin tokens) to create videos
CREATE POLICY "Authenticated users can insert landing page video"
  ON landing_page_video FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Authenticated users can update any video
CREATE POLICY "Authenticated users can update landing page video"
  ON landing_page_video FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Authenticated users can delete any video
CREATE POLICY "Authenticated users can delete landing page video"
  ON landing_page_video FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'landing_page_video';





