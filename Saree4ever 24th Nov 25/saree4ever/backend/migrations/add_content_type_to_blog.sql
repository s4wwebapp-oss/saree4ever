-- Add content_type field to distinguish between Articles and Reels/Videos
-- Run this in Supabase SQL Editor

-- Add content_type field (defaults to 'article' for existing records)
ALTER TABLE blog_articles 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'article' CHECK (content_type IN ('article', 'reel', 'video'));

-- Update existing records to be articles
UPDATE blog_articles 
SET content_type = 'article' 
WHERE content_type IS NULL;

-- Add index for filtering by content type
CREATE INDEX IF NOT EXISTS idx_blog_articles_content_type 
ON blog_articles (content_type);

-- Add comment for documentation
COMMENT ON COLUMN blog_articles.content_type IS 'Type of content: article (text-based), reel (Instagram Reel), or video (YouTube Short/Video)';


