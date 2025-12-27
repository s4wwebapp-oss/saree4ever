-- Add video_orientation column to landing_page_video table
-- This allows admins to manually specify if video is horizontal or vertical

ALTER TABLE landing_page_video 
ADD COLUMN IF NOT EXISTS video_orientation VARCHAR(10) DEFAULT 'horizontal' 
CHECK (video_orientation IN ('horizontal', 'vertical'));

-- Update existing records to have default orientation
UPDATE landing_page_video 
SET video_orientation = 'horizontal' 
WHERE video_orientation IS NULL;

-- Add comment
COMMENT ON COLUMN landing_page_video.video_orientation IS 'Video orientation: horizontal (16:9) or vertical (9:16) for reels/shorts';





