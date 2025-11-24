-- Migration: Create Many-to-Many Relationships for Products
-- This allows products to appear in multiple collections, categories, and types
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Create Junction Tables
-- ============================================

-- Product Collections (Many-to-Many)
CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON product_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_display_order ON product_collections(display_order);

-- Product Categories (Many-to-Many)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);

-- Product Types (Many-to-Many)
CREATE TABLE IF NOT EXISTS product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES types(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, type_id)
);

CREATE INDEX IF NOT EXISTS idx_product_types_product_id ON product_types(product_id);
CREATE INDEX IF NOT EXISTS idx_product_types_type_id ON product_types(type_id);
CREATE INDEX IF NOT EXISTS idx_product_types_display_order ON product_types(display_order);

-- ============================================
-- 2. Migrate Existing Data
-- ============================================

-- Migrate existing collection_id relationships
INSERT INTO product_collections (product_id, collection_id, display_order)
SELECT id, collection_id, 0
FROM products
WHERE collection_id IS NOT NULL
ON CONFLICT (product_id, collection_id) DO NOTHING;

-- Migrate existing category_id relationships
INSERT INTO product_categories (product_id, category_id, display_order)
SELECT id, category_id, 0
FROM products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Migrate existing type_id relationships
INSERT INTO product_types (product_id, type_id, display_order)
SELECT id, type_id, 0
FROM products
WHERE type_id IS NOT NULL
ON CONFLICT (product_id, type_id) DO NOTHING;

-- ============================================
-- 3. Optional: Keep old columns for backward compatibility
-- ============================================
-- Note: We keep collection_id, category_id, type_id columns for now
-- to maintain backward compatibility. You can remove them later
-- after verifying everything works with junction tables.

-- ============================================
-- 4. Add helpful comments
-- ============================================
COMMENT ON TABLE product_collections IS 'Many-to-many relationship: Products can belong to multiple collections';
COMMENT ON TABLE product_categories IS 'Many-to-many relationship: Products can belong to multiple categories';
COMMENT ON TABLE product_types IS 'Many-to-many relationship: Products can belong to multiple types';



