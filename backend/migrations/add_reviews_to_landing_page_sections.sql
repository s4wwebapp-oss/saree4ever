-- Add Reviews section to landing_page_sections table
-- This allows admins to show/hide the reviews section on the landing page

INSERT INTO landing_page_sections (section_key, section_name, description, is_visible, display_order)
VALUES ('reviews', 'Reviews', 'Customer reviews section with Google-style review cards', true, 12)
ON CONFLICT (section_key) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;





