-- Add Collections section to landing_page_sections table
-- This allows admins to show/hide the collections showcase section on the landing page

INSERT INTO landing_page_sections (section_key, section_name, description, is_visible, display_order)
VALUES ('collections', 'Collections', 'Showcase of collections grid section', true, 11)
ON CONFLICT (section_key) DO UPDATE SET
  section_name = EXCLUDED.section_name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;





