-- Add Instagram Reels and YouTube Shorts fields to blog_articles table
-- Run this in Supabase SQL Editor

-- Add Instagram Reel URL field
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS instagram_reel_url TEXT;

-- Add YouTube Short URL field
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS youtube_short_url TEXT;

-- Add index for filtering articles with social media links
CREATE INDEX IF NOT EXISTS idx_blog_articles_has_social 
ON blog_articles (instagram_reel_url, youtube_short_url) 
WHERE instagram_reel_url IS NOT NULL OR youtube_short_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN blog_articles.instagram_reel_url IS 'URL to Instagram Reel (e.g., https://www.instagram.com/reel/ABC123/)';
COMMENT ON COLUMN blog_articles.youtube_short_url IS 'URL to YouTube Short (e.g., https://www.youtube.com/shorts/ABC123)';


