-- Quick Insert: Test Product - Kanjivaram Pure Silk
-- Copy and paste this entire block into Supabase SQL Editor and run it

-- Step 1: Create Type and Category (if they don't exist)
INSERT INTO types (name, slug, description, is_active)
VALUES ('Kanjivaram', 'kanjivaram', 'Traditional Kanjivaram silk sarees', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, is_active)
VALUES ('Bridal', 'bridal', 'Bridal collection sarees', true)
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Insert Product
INSERT INTO products (
  name,
  slug,
  description,
  type_id,
  category_id,
  base_price,
  compare_at_price,
  sku,
  is_active,
  is_featured
)
SELECT 
  'Kanjivaram Pure Silk',
  'kanjivaram-pure-silk',
  'Beautiful traditional Kanjivaram pure silk saree, perfect for bridal occasions.',
  (SELECT id FROM types WHERE slug = 'kanjivaram' LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'bridal' LIMIT 1),
  9999.00,
  12999.00,
  'P1',
  true,
  true
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- Step 3: Insert Variant
INSERT INTO variants (
  product_id,
  name,
  sku,
  price,
  color,
  has_blouse,
  blouse_included,
  stock_quantity,
  track_inventory,
  is_active
)
SELECT 
  (SELECT id FROM products WHERE slug = 'kanjivaram-pure-silk' LIMIT 1),
  'Maroon with Blouse',
  'V1',
  9999.00,
  'Maroon',
  true,
  true,
  5,
  true,
  true
ON CONFLICT (sku) DO UPDATE SET
  stock_quantity = EXCLUDED.stock_quantity,
  price = EXCLUDED.price,
  updated_at = NOW();

-- Step 4: View the result
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.sku as product_sku,
  p.base_price,
  t.name as type_name,
  c.name as category_name,
  v.id as variant_id,
  v.name as variant_name,
  v.color,
  v.has_blouse,
  v.blouse_included,
  v.price as variant_price,
  v.stock_quantity
FROM products p
LEFT JOIN types t ON p.type_id = t.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN variants v ON v.product_id = p.id
WHERE p.slug = 'kanjivaram-pure-silk';

