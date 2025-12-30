-- Create filter_options table for storing configurable product filters
-- Run this in Supabase SQL Editor

-- Create the filter_options table
CREATE TABLE IF NOT EXISTS filter_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filter_type VARCHAR(50) NOT NULL, -- 'color', 'sort', 'size', 'fabric', etc.
  name VARCHAR(100) NOT NULL,
  value VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}', -- For additional data like hex color codes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create unique constraint on filter_type + value
ALTER TABLE filter_options ADD CONSTRAINT filter_options_type_value_unique 
  UNIQUE (filter_type, value);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_filter_options_type ON filter_options(filter_type);
CREATE INDEX IF NOT EXISTS idx_filter_options_active ON filter_options(is_active);

-- Enable RLS
ALTER TABLE filter_options ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on filter_options"
ON filter_options FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert on filter_options"
ON filter_options FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on filter_options"
ON filter_options FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on filter_options"
ON filter_options FOR DELETE
USING (auth.role() = 'authenticated');

-- Insert default color options
INSERT INTO filter_options (filter_type, name, value, display_order, metadata) VALUES
  ('color', 'Red', 'red', 1, '{"hex": "#DC2626"}'),
  ('color', 'Blue', 'blue', 2, '{"hex": "#2563EB"}'),
  ('color', 'Green', 'green', 3, '{"hex": "#16A34A"}'),
  ('color', 'Yellow', 'yellow', 4, '{"hex": "#CA8A04"}'),
  ('color', 'Purple', 'purple', 5, '{"hex": "#9333EA"}'),
  ('color', 'Pink', 'pink', 6, '{"hex": "#EC4899"}'),
  ('color', 'Orange', 'orange', 7, '{"hex": "#EA580C"}'),
  ('color', 'Black', 'black', 8, '{"hex": "#000000"}'),
  ('color', 'White', 'white', 9, '{"hex": "#FFFFFF"}'),
  ('color', 'Gold', 'gold', 10, '{"hex": "#B8860B"}'),
  ('color', 'Silver', 'silver', 11, '{"hex": "#C0C0C0"}'),
  ('color', 'Maroon', 'maroon', 12, '{"hex": "#800000"}')
ON CONFLICT (filter_type, value) DO NOTHING;

-- Insert default sort options
INSERT INTO filter_options (filter_type, name, value, display_order) VALUES
  ('sort', 'Newest First', 'newest', 1),
  ('sort', 'Price: Low to High', 'price_asc', 2),
  ('sort', 'Price: High to Low', 'price_desc', 3),
  ('sort', 'Name: A to Z', 'name_asc', 4),
  ('sort', 'Name: Z to A', 'name_desc', 5),
  ('sort', 'Most Popular', 'popularity', 6),
  ('sort', 'Best Rating', 'rating', 7)
ON CONFLICT (filter_type, value) DO NOTHING;

-- Insert default size options (optional - for clothing)
INSERT INTO filter_options (filter_type, name, value, display_order) VALUES
  ('size', 'Free Size', 'free', 1),
  ('size', 'Small', 'S', 2),
  ('size', 'Medium', 'M', 3),
  ('size', 'Large', 'L', 4),
  ('size', 'Extra Large', 'XL', 5),
  ('size', 'XXL', 'XXL', 6)
ON CONFLICT (filter_type, value) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_filter_options_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS filter_options_updated_at ON filter_options;
CREATE TRIGGER filter_options_updated_at
  BEFORE UPDATE ON filter_options
  FOR EACH ROW
  EXECUTE FUNCTION update_filter_options_updated_at();
