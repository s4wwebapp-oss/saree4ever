-- Create hero_slides table for managing homepage hero carousel
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text VARCHAR(100),
  button_link TEXT,
  button_target VARCHAR(20) DEFAULT '_self', -- '_self' or '_blank'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on display_order and is_active for fast lookups
CREATE INDEX IF NOT EXISTS idx_hero_slides_display_order ON hero_slides(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active) WHERE is_active = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hero_slides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_slides_updated_at();

-- Insert default hero slides (optional - for testing)
INSERT INTO hero_slides (title, subtitle, image_url, button_text, button_link, button_target, display_order, is_active) VALUES
(
  'Traditional Elegance, Modern Style',
  'Discover our curated collection of handcrafted sarees',
  'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=1920',
  'Shop Collections',
  '/collections',
  '_self',
  0,
  true
),
(
  'New Arrivals',
  'Explore our latest collection of exquisite sarees',
  'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=1920',
  'View New Arrivals',
  '/collections/new-arrivals',
  '_self',
  1,
  true
),
(
  'Special Offers',
  'Limited time offers on selected collections',
  'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=1920',
  'View Offers',
  '/offers',
  '_self',
  2,
  true
)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active hero slides
CREATE POLICY "Anyone can read active hero slides"
  ON hero_slides FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated admins can manage hero slides
CREATE POLICY "Admins can manage hero slides"
  ON hero_slides FOR ALL
  USING (auth.role() = 'authenticated');


