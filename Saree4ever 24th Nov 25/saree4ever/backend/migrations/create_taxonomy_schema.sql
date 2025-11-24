-- Migration: Create Taxonomy Schema and Seed Data
-- This implements the complete taxonomy system with 11 categories, 30+ types, and product attributes
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add Product Attributes to Products Table
-- ============================================

-- Add color field
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;
COMMENT ON COLUMN products.color IS 'Saree color (e.g., Red, Maroon, Blue)';

-- Add weave field
ALTER TABLE products ADD COLUMN IF NOT EXISTS weave TEXT;
COMMENT ON COLUMN products.weave IS 'Weave technique (e.g., Kanjivaram weave, Banarasi weave)';

-- Add length_m field
ALTER TABLE products ADD COLUMN IF NOT EXISTS length_m NUMERIC(5,2);
COMMENT ON COLUMN products.length_m IS 'Saree length in meters (e.g., 5.5, 6.0)';

-- Add blouse_included field
ALTER TABLE products ADD COLUMN IF NOT EXISTS blouse_included BOOLEAN DEFAULT false;
COMMENT ON COLUMN products.blouse_included IS 'Whether blouse is included with the saree';

-- Add mrp field (Maximum Retail Price)
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC(10,2);
COMMENT ON COLUMN products.mrp IS 'Maximum Retail Price (original price before discount)';

-- Add subcategories array field
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategories TEXT[];
COMMENT ON COLUMN products.subcategories IS 'Array of subcategories (e.g., ["Pure Silk", "Handloom"])';

-- ============================================
-- 2. Ensure Categories Table Has All Fields
-- ============================================

-- Add icon field if not exists
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
COMMENT ON COLUMN categories.icon IS 'Icon identifier for the category';

-- ============================================
-- 3. Seed Categories (11 Categories)
-- ============================================

INSERT INTO categories (name, slug, description, is_active, display_order, icon) VALUES
  ('Bridal / Wedding', 'bridal-wedding', 'Traditional bridal sarees for weddings and special occasions', true, 1, 'wedding'),
  ('Festive / Celebration', 'festive-celebration', 'Festive sarees for celebrations and festivals', true, 2, 'festival'),
  ('Party / Evening Wear', 'party-evening', 'Elegant sarees for parties and evening events', true, 3, 'party'),
  ('Designer / Premium', 'designer-premium', 'Exclusive designer and premium saree collections', true, 4, 'designer'),
  ('Handloom / Artisanal', 'handloom-artisanal', 'Handcrafted handloom and artisanal sarees', true, 5, 'handloom'),
  ('Daily / Casual / Everyday', 'daily-casual', 'Comfortable sarees for daily wear', true, 6, 'casual'),
  ('Office / Formal / Workwear', 'office-formal', 'Professional sarees for office and formal occasions', true, 7, 'office'),
  ('Lightweight / Travel-friendly', 'lightweight-travel', 'Lightweight sarees perfect for travel', true, 8, 'travel'),
  ('Sustainable / Eco-friendly', 'sustainable-eco', 'Eco-friendly and sustainable saree options', true, 9, 'eco'),
  ('New Arrivals', 'new-arrivals', 'Latest saree collections just arrived', true, 10, 'new'),
  ('Sale / Offers / Clearance', 'sale-offers', 'Discounted sarees and special offers', true, 11, 'sale')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

-- ============================================
-- 4. Seed Types (30+ Fabric Types)
-- ============================================

INSERT INTO types (name, slug, description, is_active, display_order) VALUES
  -- Silk Types
  ('Kanjivaram', 'kanjivaram', 'Traditional Kanjivaram silk sarees from Tamil Nadu', true, 1),
  ('Banarasi', 'banarasi', 'Elegant Banarasi silk sarees from Varanasi', true, 2),
  ('Paithani', 'paithani', 'Luxurious Paithani sarees from Maharashtra', true, 3),
  ('Tussar', 'tussar', 'Natural Tussar silk sarees', true, 4),
  ('Mysore Silk', 'mysore-silk', 'Pure Mysore silk sarees from Karnataka', true, 5),
  ('Muga', 'muga', 'Golden Muga silk from Assam', true, 6),
  ('Silk', 'silk', 'Pure silk sarees', true, 7),
  
  -- Cotton Types
  ('Cotton', 'cotton', 'Comfortable cotton sarees', true, 8),
  ('Chanderi', 'chanderi', 'Lightweight Chanderi cotton sarees', true, 9),
  ('Jamdani', 'jamdani', 'Intricate Jamdani weave sarees', true, 10),
  ('Kota Doria', 'kota-doria', 'Delicate Kota Doria sarees', true, 11),
  ('Tant', 'tant', 'Traditional Tant cotton sarees from West Bengal', true, 12),
  ('Linen', 'linen', 'Natural linen sarees', true, 13),
  
  -- Sheer Types
  ('Chiffon', 'chiffon', 'Elegant chiffon sarees', true, 14),
  ('Georgette', 'georgette', 'Flowing georgette sarees', true, 15),
  ('Net', 'net', 'Stylish net sarees', true, 16),
  ('Organza', 'organza', 'Sheer organza sarees', true, 17),
  ('Crepe', 'crepe', 'Wrinkle-free crepe sarees', true, 18),
  ('Satin', 'satin', 'Luxurious satin sarees', true, 19),
  
  -- Handloom Types
  ('Ikat', 'ikat', 'Traditional Ikat/Pochampally sarees', true, 20),
  ('Patola', 'patola', 'Exquisite Patola sarees from Gujarat', true, 21),
  ('Sambalpuri', 'sambalpuri', 'Beautiful Sambalpuri sarees from Odisha', true, 22),
  ('Baluchari', 'baluchari', 'Narrative Baluchari sarees', true, 23),
  ('Gadwal', 'gadwal', 'Elegant Gadwal sarees', true, 24),
  
  -- Special Types
  ('Printed', 'printed', 'Printed sarees with modern designs', true, 25),
  ('Embroidered', 'embroidered', 'Intricately embroidered sarees', true, 26),
  ('Sequined', 'sequined', 'Glittering sequined sarees', true, 27),
  ('Tissue', 'tissue', 'Delicate tissue sarees', true, 28),
  ('Bandhani', 'bandhani', 'Traditional Bandhani tie-dye sarees', true, 29),
  ('Leheriya', 'leheriya', 'Colorful Leheriya sarees', true, 30),
  ('Kalamkari', 'kalamkari', 'Hand-painted Kalamkari sarees', true, 31),
  ('Block Print', 'block-print', 'Traditional block print sarees', true, 32)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 5. Seed Collections (6 Default Collections)
-- ============================================

INSERT INTO collections (name, slug, description, is_active, display_order) VALUES
  ('Bridal Edit', 'bridal-edit', 'Curated collection of bridal sarees', true, 1),
  ('Pure Silk Classics', 'pure-silk-classics', 'Timeless pure silk sarees', true, 2),
  ('Handloom Heritage', 'handloom-heritage', 'Traditional handloom sarees', true, 3),
  ('Festive Specials', 'festive-specials', 'Special collection for festivals', true, 4),
  ('Office / Formal Edit', 'office-formal-edit', 'Professional sarees for office wear', true, 5),
  ('Summer Lightweight', 'summer-lightweight', 'Lightweight sarees for summer', true, 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 6. Add Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_weave ON products(weave);
CREATE INDEX IF NOT EXISTS idx_products_blouse_included ON products(blouse_included);
CREATE INDEX IF NOT EXISTS idx_products_mrp ON products(mrp);

-- ============================================
-- 7. Add Comments
-- ============================================

COMMENT ON TABLE categories IS 'Product categories for merchandising and shopper intent (11 categories)';
COMMENT ON TABLE types IS 'Fabric/weave/construction types (30+ types)';
COMMENT ON TABLE collections IS 'Curated product collections';



