-- Add missing columns to landing_page_videos table
-- This migration adds columns that are defined in Prisma schema but missing from database

-- Add display_order column if it doesn't exist
ALTER TABLE landing_page_videos
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add video_orientation column if it doesn't exist  
ALTER TABLE landing_page_videos
ADD COLUMN IF NOT EXISTS video_orientation TEXT DEFAULT 'horizontal';

-- Add thumbnail_url column if it doesn't exist
ALTER TABLE landing_page_videos
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create index for display_order if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_landing_page_videos_display_order ON landing_page_videos(display_order);
