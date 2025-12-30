-- Cleanup old landing_page_video (singular) table references
-- This fixes the Supabase schema cache issue

-- Drop RLS policies on old singular table if it exists
DROP POLICY IF EXISTS "Anyone can read active landing page video" ON landing_page_video;
DROP POLICY IF EXISTS "Admins can manage landing page video" ON landing_page_video;

-- Drop triggers on old table if they exist
DROP TRIGGER IF EXISTS update_landing_page_video_updated_at ON landing_page_video;
DROP FUNCTION IF EXISTS update_landing_page_video_updated_at();

-- Drop the old singular table if it exists
DROP TABLE IF EXISTS landing_page_video CASCADE;

-- Ensure the plural table has proper RLS
ALTER TABLE landing_page_videos ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for the plural table if they don't exist
DROP POLICY IF EXISTS "Anyone can read active landing page videos" ON landing_page_videos;
CREATE POLICY "Anyone can read active landing page videos"
  ON landing_page_videos FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage landing page videos" ON landing_page_videos;
CREATE POLICY "Admins can manage landing page videos"
  ON landing_page_videos FOR ALL
  USING (auth.role() = 'authenticated');
