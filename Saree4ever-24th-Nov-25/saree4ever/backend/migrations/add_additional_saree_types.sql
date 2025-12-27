-- Add additional saree types that are missing
-- Run this in Supabase SQL Editor

INSERT INTO types (name, slug, description, is_active, display_order) VALUES
  ('Japan Satin', 'japan-satin', 'Premium Japan satin sarees with smooth, lustrous finish', true, 19),
  ('Ho Silk', 'ho-silk', 'Traditional Ho silk sarees', true, 7)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- Verify the additions
SELECT name, slug, description FROM types 
WHERE slug IN ('japan-satin', 'ho-silk', 'chiffon', 'cotton', 'satin')
ORDER BY name;





