-- Create landing_page_sections table for controlling section visibility
-- This allows admins to show/hide different sections on the landing page

CREATE TABLE IF NOT EXISTS landing_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  section_name VARCHAR(200) NOT NULL,
  description TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default sections
INSERT INTO landing_page_sections (section_key, section_name, description, is_visible, display_order) VALUES
  ('quick_categories', 'Quick Categories', 'Circular category icons above hero section', true, 1),
  ('landing_videos', 'Landing Page Videos', 'Video section after quick categories', true, 2),
  ('hero_carousel', 'Hero Carousel', 'Main hero banner carousel', true, 3),
  ('shop_by_category', 'Shop by Category', 'Expandable category grid section', true, 4),
  ('featured_products', 'Featured Products', 'Featured products showcase', true, 5),
  ('reels', 'Reels Section', 'Instagram/YouTube reels section', true, 6),
  ('stories', 'Stories Section', 'Blog/stories preview section', true, 7),
  ('testimonials', 'Testimonials', 'Customer testimonials section', true, 8),
  ('about_preview', 'About Preview', 'About us preview section', true, 9),
  ('why_choose_us', 'Why Choose Us', 'Benefits/features section', true, 10)
ON CONFLICT (section_key) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  description = EXCLUDED.description;

-- Enable RLS
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access to landing_page_sections"
  ON landing_page_sections
  FOR SELECT
  TO public
  USING (true);

-- RLS Policy: Allow admin insert/update/delete
CREATE POLICY "Allow admin full access to landing_page_sections"
  ON landing_page_sections
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
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_key ON landing_page_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_visible ON landing_page_sections(is_visible);

-- Add comment
COMMENT ON TABLE landing_page_sections IS 'Controls visibility of sections on the landing page';
COMMENT ON COLUMN landing_page_sections.section_key IS 'Unique identifier for the section (e.g., quick_categories, featured_products)';
COMMENT ON COLUMN landing_page_sections.is_visible IS 'Whether the section should be displayed on the landing page';





