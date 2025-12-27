-- Create PostgreSQL functions to update landing_page_sections
-- These bypass PostgREST schema cache issues by using direct SQL functions

-- Function to update a single section's visibility
CREATE OR REPLACE FUNCTION update_landing_page_section_visibility(
  p_section_key VARCHAR,
  p_is_visible BOOLEAN
)
RETURNS TABLE (
  id UUID,
  section_key VARCHAR,
  section_name VARCHAR,
  description TEXT,
  is_visible BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the section
  UPDATE landing_page_sections
  SET 
    is_visible = p_is_visible,
    updated_at = NOW()
  WHERE section_key = p_section_key;
  
  -- Return the updated section
  RETURN QUERY
  SELECT 
    lps.id,
    lps.section_key,
    lps.section_name,
    lps.description,
    lps.is_visible,
    lps.display_order,
    lps.created_at,
    lps.updated_at
  FROM landing_page_sections lps
  WHERE lps.section_key = p_section_key;
END;
$$;

-- Function to bulk update multiple sections' visibility
CREATE OR REPLACE FUNCTION bulk_update_landing_page_sections_visibility(
  p_updates JSONB
)
RETURNS TABLE (
  id UUID,
  section_key VARCHAR,
  section_name VARCHAR,
  description TEXT,
  is_visible BOOLEAN,
  display_order INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  update_item JSONB;
BEGIN
  -- Loop through each update
  FOR update_item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE landing_page_sections
    SET 
      is_visible = (update_item->>'is_visible')::BOOLEAN,
      updated_at = NOW()
    WHERE section_key = update_item->>'section_key';
  END LOOP;
  
  -- Return all sections ordered by display_order
  RETURN QUERY
  SELECT 
    lps.id,
    lps.section_key,
    lps.section_name,
    lps.description,
    lps.is_visible,
    lps.display_order,
    lps.created_at,
    lps.updated_at
  FROM landing_page_sections lps
  ORDER BY lps.display_order ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_landing_page_section_visibility(VARCHAR, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_landing_page_sections_visibility(JSONB) TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';





