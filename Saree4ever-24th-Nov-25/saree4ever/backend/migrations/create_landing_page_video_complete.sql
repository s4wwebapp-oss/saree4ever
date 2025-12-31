-- ============================================
-- COMPLETE MIGRATION: Landing Page Video Table
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Create landing_page_video table for managing homepage autoplay video
CREATE TABLE IF NOT EXISTS landing_page_video (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT, -- URL to uploaded video file or external link
  video_file_path TEXT, -- Path to uploaded file in storage
  is_active BOOLEAN DEFAULT true,
  autoplay BOOLEAN DEFAULT true,
  muted BOOLEAN DEFAULT true,
  loop BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- For ordering multiple videos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for active video lookup
CREATE INDEX IF NOT EXISTS idx_landing_page_video_active 
ON landing_page_video(is_active) WHERE is_active = true;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_landing_page_video_display_order 
ON landing_page_video(display_order) WHERE is_active = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_landing_page_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_landing_page_video_updated_at
  BEFORE UPDATE ON landing_page_video
  FOR EACH ROW
  EXECUTE FUNCTION update_landing_page_video_updated_at();

-- Insert default record (inactive)
INSERT INTO landing_page_video (video_url, is_active, autoplay, muted, loop, display_order) VALUES
(
  NULL,
  false,
  true,
  true,
  true,
  0
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE landing_page_video ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active videos
CREATE POLICY "Anyone can read active landing page video"
  ON landing_page_video FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated admins can manage videos
CREATE POLICY "Admins can manage landing page video"
  ON landing_page_video FOR ALL
  USING (auth.role() = 'authenticated');





