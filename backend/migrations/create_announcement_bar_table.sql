-- Create announcement_bar table for managing the top announcement banner
CREATE TABLE IF NOT EXISTS announcement_bar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  link_url TEXT, -- URL to navigate to when clicked (optional)
  link_target VARCHAR(20) DEFAULT '_self', -- '_self' or '_blank'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Note: We'll handle "only one active" logic in the application layer
-- Multiple announcements can exist, but only one should be active at a time
CREATE INDEX IF NOT EXISTS idx_announcement_bar_active 
ON announcement_bar (is_active) 
WHERE is_active = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_announcement_bar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_announcement_bar_updated_at
  BEFORE UPDATE ON announcement_bar
  FOR EACH ROW
  EXECUTE FUNCTION update_announcement_bar_updated_at();

-- Insert default announcement
INSERT INTO announcement_bar (text, link_url, link_target, is_active, display_order) VALUES
(
  'NEW STORE NOW OPEN | VISIT OUR SHOWROOM',
  '/contact',
  '_self',
  true,
  0
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE announcement_bar ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active announcements
CREATE POLICY "Anyone can read active announcements"
  ON announcement_bar FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated admins can manage announcements
CREATE POLICY "Admins can manage announcements"
  ON announcement_bar FOR ALL
  USING (auth.role() = 'authenticated');

