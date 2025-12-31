-- Create a PostgreSQL function to query landing_page_sections
-- This bypasses PostgREST schema cache issues by using a direct SQL function

CREATE OR REPLACE FUNCTION get_landing_page_sections()
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

-- Create function to get visible sections only
CREATE OR REPLACE FUNCTION get_visible_landing_page_sections()
RETURNS TABLE (
  section_key VARCHAR,
  is_visible BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lps.section_key,
    lps.is_visible
  FROM landing_page_sections lps
  WHERE lps.is_visible = true
  ORDER BY lps.display_order ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_landing_page_sections() TO authenticated;
GRANT EXECUTE ON FUNCTION get_visible_landing_page_sections() TO authenticated;
GRANT EXECUTE ON FUNCTION get_landing_page_sections() TO anon;
GRANT EXECUTE ON FUNCTION get_visible_landing_page_sections() TO anon;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';





