-- Migration: Create Homepage Quick Categories
-- This ensures the 4 homepage circular category icons exist
-- Run this in Supabase SQL Editor

-- Insert or update categories for homepage circular icons
-- Using INSERT ... ON CONFLICT to update if exists, insert if not

INSERT INTO categories (name, slug, description, is_active, display_order, image_url) VALUES
  (
    'Blouses',
    'blouses',
    'Beautiful blouses to complement your sarees',
    true,
    1,
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80'
  ),
  (
    'Jewels',
    'jewels',
    'Exquisite jewelry to complete your look',
    true,
    2,
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80'
  ),
  (
    'New Arrivals',
    'new-arrivals',
    'Latest additions to our collection',
    true,
    3,
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80'
  ),
  (
    'Hot deals',
    'hot-deals',
    'Special offers and discounted items',
    true,
    4,
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80'
  )
ON CONFLICT (slug) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- Note: This assumes 'slug' has a UNIQUE constraint
-- If not, you may need to check for existing categories first and update them

