-- Migration: Add Auto SKU Generation Functions
-- This creates database functions to automatically generate SKUs for products and variants
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Function to Generate Product SKU
-- ============================================

CREATE OR REPLACE FUNCTION generate_product_sku(
  p_name TEXT,
  p_type_id UUID DEFAULT NULL,
  p_color TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_type_abbr TEXT := 'PRD';
  v_color_abbr TEXT := 'GEN';
  v_prefix TEXT;
  v_max_num INT := 0;
  v_next_num TEXT;
  v_type_slug TEXT;
BEGIN
  -- Get type abbreviation
  IF p_type_id IS NOT NULL THEN
    SELECT slug INTO v_type_slug
    FROM types
    WHERE id = p_type_id;
    
    IF v_type_slug IS NOT NULL THEN
      -- Extract abbreviation from type slug
      -- Remove '-saree' suffix and convert to abbreviation
      v_type_slug := REPLACE(REPLACE(v_type_slug, '-saree', ''), '-', ' ');
      v_type_abbr := UPPER(SUBSTRING(REGEXP_REPLACE(v_type_slug, '[^a-zA-Z0-9\s]', '', 'g'), 1, 6));
      
      -- If still empty, use first 4 chars
      IF LENGTH(v_type_abbr) < 3 THEN
        v_type_abbr := UPPER(SUBSTRING(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]', '', 'g'), 1, 4));
      END IF;
    END IF;
  END IF;
  
  -- Get color abbreviation
  IF p_color IS NOT NULL AND p_color != '' THEN
    v_color_abbr := UPPER(SUBSTRING(REGEXP_REPLACE(p_color, '[^a-zA-Z0-9]', '', 'g'), 1, 4));
  END IF;
  
  -- Create prefix
  v_prefix := v_type_abbr || '-' || v_color_abbr;
  
  -- Find max number for this prefix
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(sku FROM '(\d+)$') AS INT)
  ), 0) INTO v_max_num
  FROM products
  WHERE sku LIKE v_prefix || '-%'
    AND sku ~ ('^' || v_prefix || '-\d+$');
  
  -- Generate next number (3 digits, zero-padded)
  v_next_num := LPAD((v_max_num + 1)::TEXT, 3, '0');
  
  RETURN v_prefix || '-' || v_next_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Function to Generate Variant SKU
-- ============================================

CREATE OR REPLACE FUNCTION generate_variant_sku(
  p_product_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_product_sku TEXT;
  v_max_variant INT := 0;
  v_next_variant TEXT;
BEGIN
  -- Get product SKU
  SELECT sku INTO v_product_sku
  FROM products
  WHERE id = p_product_id;
  
  -- If product has no SKU, use default
  IF v_product_sku IS NULL OR v_product_sku = '' THEN
    v_product_sku := 'VAR';
  END IF;
  
  -- Find max variant number for this product
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(sku FROM '-V(\d+)$') AS INT)
  ), 0) INTO v_max_variant
  FROM variants
  WHERE product_id = p_product_id
    AND sku LIKE v_product_sku || '-V%'
    AND sku ~ ('^' || v_product_sku || '-V\d+$');
  
  -- Generate next variant number
  v_next_variant := (v_max_variant + 1)::TEXT;
  
  RETURN v_product_sku || '-V' || v_next_variant;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Trigger Function for Products (Auto-generate SKU if NULL)
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_product_sku()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate SKU if it's NULL or empty
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := generate_product_sku(
      NEW.name,
      NEW.type_id,
      NEW.color
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_product_sku ON products;
CREATE TRIGGER trigger_auto_generate_product_sku
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_sku();

-- ============================================
-- 4. Trigger Function for Variants (Auto-generate SKU if NULL)
-- ============================================

CREATE OR REPLACE FUNCTION auto_generate_variant_sku()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate SKU if it's NULL or empty
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := generate_variant_sku(NEW.product_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_variant_sku ON variants;
CREATE TRIGGER trigger_auto_generate_variant_sku
  BEFORE INSERT ON variants
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_variant_sku();

-- ============================================
-- 5. Add Comments
-- ============================================

COMMENT ON FUNCTION generate_product_sku IS 'Automatically generates a unique SKU for products based on type and color';
COMMENT ON FUNCTION generate_variant_sku IS 'Automatically generates a unique SKU for variants based on product SKU';
COMMENT ON FUNCTION auto_generate_product_sku IS 'Trigger function to auto-generate product SKU on insert';
COMMENT ON FUNCTION auto_generate_variant_sku IS 'Trigger function to auto-generate variant SKU on insert';





