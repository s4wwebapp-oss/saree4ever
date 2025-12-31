-- Create landing_page_video table for managing homepage autoplay video
CREATE TABLE IF NOT EXISTS landing_page_video (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_url TEXT, -- URL to uploaded video file or external link
  video_file_path TEXT, -- Path to uploaded file in storage
  is_active BOOLEAN DEFAULT true,
  autoplay BOOLEAN DEFAULT true,
  muted BOOLEAN DEFAULT true,
  loop BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for active video lookup
CREATE INDEX IF NOT EXISTS idx_landing_page_video_active ON landing_page_video(is_active) WHERE is_active = true;

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
INSERT INTO landing_page_video (video_url, is_active, autoplay, muted, loop) VALUES
(
  NULL,
  false,
  true,
  true,
  true
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE landing_page_video ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active video
CREATE POLICY "Anyone can read active landing page video"
  ON landing_page_video FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated admins can manage video
CREATE POLICY "Admins can manage landing page video"
  ON landing_page_video FOR ALL
  USING (auth.role() = 'authenticated');





