-- Add missing columns to landing_page_sections table
-- Run this in Supabase SQL Editor

-- Add section_name column
ALTER TABLE landing_page_sections 
ADD COLUMN IF NOT EXISTS section_name VARCHAR(100);

-- Add description column
ALTER TABLE landing_page_sections 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add display_order column
ALTER TABLE landing_page_sections 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Now insert/update all landing page sections with proper data
INSERT INTO landing_page_sections (section_key, section_name, description, is_visible, display_order)
VALUES 
  ('hero_carousel', 'Hero Carousel', 'Main hero banner carousel at the top of the page', true, 1),
  ('quick_categories', 'Quick Categories', 'Quick access category icons (Blouses, Jewels, New Arrivals, Hot Deals)', true, 2),
  ('landing_videos', 'Landing Videos', 'Video section showcasing products or brand story', true, 3),
  ('shop_by_category', 'Shop by Category', 'Full category grid with images and links', true, 4),
  ('featured_products', 'Featured Products', 'Highlighted products marked as featured', true, 5),
  ('collections', 'Collections', 'Curated collections like Festive, Bridal, etc.', true, 6),
  ('reels', 'Reels / Short Videos', 'Instagram Reels or YouTube Shorts style content', true, 7),
  ('stories', 'Stories / Blog', 'Featured blog posts and brand stories', true, 8),
  ('testimonials', 'Testimonials', 'Customer testimonials and reviews', true, 9),
  ('reviews', 'Customer Reviews', 'Product reviews section', true, 10),
  ('about_preview', 'About Preview', 'Brief about us section with link to full page', true, 11),
  ('why_choose_us', 'Why Choose Us', 'Key selling points and benefits', true, 12)
ON CONFLICT (section_key) 
DO UPDATE SET 
  section_name = EXCLUDED.section_name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;
