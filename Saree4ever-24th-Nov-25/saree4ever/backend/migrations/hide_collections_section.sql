-- Hide Collections section on landing page
-- This sets the collections section visibility to false

UPDATE landing_page_sections
SET 
  is_visible = false,
  updated_at = NOW()
WHERE section_key = 'collections';

-- If the section doesn't exist yet, insert it as hidden
INSERT INTO landing_page_sections (section_key, section_name, description, is_visible, display_order)
VALUES ('collections', 'Collections', 'Showcase of collections grid section', false, 11)
ON CONFLICT (section_key) DO UPDATE SET
  is_visible = false,
  updated_at = NOW();
