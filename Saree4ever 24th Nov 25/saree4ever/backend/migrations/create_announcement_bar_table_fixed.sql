-- Create announcement_bar table for managing the top announcement banner
-- Run this in Supabase SQL Editor

-- Drop existing table if you need to recreate (optional - remove if table has data)
-- DROP TABLE IF EXISTS announcement_bar CASCADE;

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

-- Create index for active announcements
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_announcement_bar_updated_at ON announcement_bar;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_announcement_bar_updated_at
  BEFORE UPDATE ON announcement_bar
  FOR EACH ROW
  EXECUTE FUNCTION update_announcement_bar_updated_at();

-- Enable Row Level Security
ALTER TABLE announcement_bar ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can read active announcements" ON announcement_bar;
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcement_bar;
DROP POLICY IF EXISTS "Service role can manage all announcements" ON announcement_bar;

-- Policy: Anyone can read active announcements
CREATE POLICY "Anyone can read active announcements"
  ON announcement_bar FOR SELECT
  USING (is_active = true);

-- Policy: Service role (backend) can manage all announcements
CREATE POLICY "Service role can manage all announcements"
  ON announcement_bar FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can manage announcements (for admin panel)
CREATE POLICY "Admins can manage announcements"
  ON announcement_bar FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Insert default announcement (only if table is empty)
INSERT INTO announcement_bar (text, link_url, link_target, is_active, display_order)
SELECT 
  'FREE SHIPPING WORLDWIDE | COMPLIMENTARY FALLS & PICO',
  NULL,
  '_self',
  true,
  0
WHERE NOT EXISTS (SELECT 1 FROM announcement_bar);

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'announcement_bar') THEN
    RAISE NOTICE '✅ announcement_bar table created successfully!';
  ELSE
    RAISE EXCEPTION '❌ Failed to create announcement_bar table';
  END IF;
END $$;


