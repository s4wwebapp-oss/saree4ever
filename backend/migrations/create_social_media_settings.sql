-- Create social_media_settings table for managing social media links and visibility
-- This allows admins to control which social media links appear in the header

CREATE TABLE IF NOT EXISTS social_media_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) UNIQUE NOT NULL,
  url TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default social media platforms
INSERT INTO social_media_settings (platform, url, is_visible, display_order) VALUES
  ('instagram', 'https://www.instagram.com/saree4ever', true, 1),
  ('facebook', 'https://www.facebook.com/saree4ever', true, 2),
  ('twitter', 'https://twitter.com/saree4ever', true, 3),
  ('youtube', 'https://www.youtube.com/@saree4ever', true, 4),
  ('pinterest', 'https://www.pinterest.com/saree4ever', true, 5)
ON CONFLICT (platform) DO NOTHING;

-- Enable RLS
ALTER TABLE social_media_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access to social_media_settings"
  ON social_media_settings
  FOR SELECT
  TO public
  USING (true);

-- RLS Policy: Allow admin insert/update/delete
CREATE POLICY "Allow admin full access to social_media_settings"
  ON social_media_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = current_setting('app.settings.admin_email', true)::text
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_media_settings_platform ON social_media_settings(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_settings_visible ON social_media_settings(is_visible) WHERE is_visible = true;

-- Add comment
COMMENT ON TABLE social_media_settings IS 'Controls social media links and visibility in the header';
COMMENT ON COLUMN social_media_settings.platform IS 'Social media platform name (instagram, facebook, twitter, youtube, pinterest)';
COMMENT ON COLUMN social_media_settings.url IS 'URL to the social media profile';
COMMENT ON COLUMN social_media_settings.is_visible IS 'Whether the social media link should be displayed in the header';





