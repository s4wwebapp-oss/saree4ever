-- Create menu configuration table for managing dropdown titles and column groupings
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS menu_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_type TEXT NOT NULL UNIQUE CHECK (menu_type IN ('shop_by', 'collections', 'categories')),
  column_1_title TEXT NOT NULL DEFAULT 'COLUMN 1',
  column_2_title TEXT NOT NULL DEFAULT 'COLUMN 2',
  column_3_title TEXT NOT NULL DEFAULT 'COLUMN 3',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configurations
INSERT INTO menu_config (menu_type, column_1_title, column_2_title, column_3_title)
VALUES 
  ('shop_by', 'HERITAGE SILKS', 'COTTON & HANDLOOM', 'MODERN & CONTEMPORARY'),
  ('collections', 'FEATURED COLLECTIONS', 'POPULAR COLLECTIONS', 'NEW COLLECTIONS'),
  ('categories', 'TRADITIONAL', 'OCCASIONS', 'STYLES')
ON CONFLICT (menu_type) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_menu_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_config_updated_at
  BEFORE UPDATE ON menu_config
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_config_updated_at();

-- Add RLS policies
ALTER TABLE menu_config ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read menu config"
  ON menu_config FOR SELECT
  USING (true);

-- Admin can manage
CREATE POLICY "Admins can manage menu config"
  ON menu_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN auth.users u ON u.id = ur.user_id
      WHERE ur.role = 'admin' AND u.id = auth.uid()
    )
  );

COMMENT ON TABLE menu_config IS 'Configuration for navigation menu dropdown column titles';
COMMENT ON COLUMN menu_config.menu_type IS 'Type of menu: shop_by, collections, or categories';
COMMENT ON COLUMN menu_config.column_1_title IS 'Title for the first column in the dropdown';
COMMENT ON COLUMN menu_config.column_2_title IS 'Title for the second column in the dropdown';
COMMENT ON COLUMN menu_config.column_3_title IS 'Title for the third column in the dropdown';


