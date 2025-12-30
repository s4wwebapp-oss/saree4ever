-- Add display_order column to landing_page_video table
ALTER TABLE landing_page_video 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_landing_page_video_display_order 
ON landing_page_video(display_order) WHERE is_active = true;





