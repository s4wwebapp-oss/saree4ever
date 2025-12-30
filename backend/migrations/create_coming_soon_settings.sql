-- Create coming_soon_settings table for managing coming soon mode
-- This allows admins to toggle between regular landing page and coming soon page

CREATE TABLE IF NOT EXISTS coming_soon_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN DEFAULT false,
  title TEXT DEFAULT 'Grand Opening',
  subtitle TEXT DEFAULT 'Get ready to immerse yourself in the art of the saree.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default setting (disabled by default)
INSERT INTO coming_soon_settings (is_enabled, title, subtitle)
VALUES (false, 'Grand Opening', 'Get ready to immerse yourself in the art of the saree.')
ON CONFLICT DO NOTHING;

-- Create coming_soon_media table for managing videos and images
CREATE TABLE IF NOT EXISTS coming_soon_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('video', 'image')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  autoplay BOOLEAN DEFAULT true,
  muted BOOLEAN DEFAULT true,
  loop BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE coming_soon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coming_soon_media ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access to coming_soon_settings"
  ON coming_soon_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to coming_soon_media"
  ON coming_soon_media
  FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policy: Allow admin insert/update/delete
CREATE POLICY "Allow admin full access to coming_soon_settings"
  ON coming_soon_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = current_setting('app.settings.admin_email', true)::text
    )
  );

CREATE POLICY "Allow admin full access to coming_soon_media"
  ON coming_soon_media
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = current_setting('app.settings.admin_email', true)::text
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coming_soon_media_active ON coming_soon_media(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coming_soon_media_order ON coming_soon_media(display_order);

-- Create updated_at trigger for coming_soon_settings
CREATE OR REPLACE FUNCTION update_coming_soon_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coming_soon_settings_updated_at
  BEFORE UPDATE ON coming_soon_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_coming_soon_settings_updated_at();

-- Create updated_at trigger for coming_soon_media
CREATE OR REPLACE FUNCTION update_coming_soon_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coming_soon_media_updated_at
  BEFORE UPDATE ON coming_soon_media
  FOR EACH ROW
  EXECUTE FUNCTION update_coming_soon_media_updated_at();

-- Add comments
COMMENT ON TABLE coming_soon_settings IS 'Controls whether coming soon page is enabled';
COMMENT ON TABLE coming_soon_media IS 'Videos and images for the coming soon page';
