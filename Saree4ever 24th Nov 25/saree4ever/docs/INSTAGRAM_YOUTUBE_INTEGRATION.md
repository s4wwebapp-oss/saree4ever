# Instagram Reels & YouTube Shorts Integration

## Summary

Added support for Instagram Reels and YouTube Shorts links in blog articles, which are displayed on the `/stories` page.

## Database Migration

### Run This Migration First

1. Go to Supabase SQL Editor
2. Run the migration: `backend/migrations/add_social_media_to_blog.sql`

This adds two new columns to the `blog_articles` table:
- `instagram_reel_url` (TEXT) - URL to Instagram Reel or Post
- `youtube_short_url` (TEXT) - URL to YouTube Short or Video

## Admin Panel Updates

### Blog Create/Edit Pages

**Location**: `/admin/blog/new` and `/admin/blog/[id]/edit`

**New Section**: "Social Media Links"
- **Instagram Reel URL**: Input field for Instagram Reel/Post URL
- **YouTube Short URL**: Input field for YouTube Short/Video URL

**How to Use**:
1. Create or edit a blog article
2. Scroll to "Social Media Links" section
3. Paste the full URL:
   - Instagram: `https://www.instagram.com/reel/ABC123/` or `https://www.instagram.com/p/ABC123/`
   - YouTube: `https://www.youtube.com/shorts/ABC123` or `https://youtu.be/ABC123`
4. Save the article

## Frontend Display

### Stories Page (`/stories`)

**New Section**: "Reels & Shorts"
- Displays articles that have Instagram Reel or YouTube Short URLs
- Shows up to 6 Instagram Reels and 6 YouTube Shorts
- Each card shows:
  - Featured image (or placeholder)
  - Article title
  - Excerpt
  - Platform badge (Instagram/YouTube)
  - Click to view full article

**Features**:
- Responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
- Hover effects
- Links to full article page
- Empty state message if no reels/shorts available

### Individual Story Page (`/stories/[slug]`)

**New Section**: "Watch on Social Media"
- Appears if article has Instagram Reel or YouTube Short URL
- Shows cards with:
  - Platform branding (Instagram gradient / YouTube red)
  - Platform icon
  - Direct link to watch on platform
  - Article title

## URL Format Support

### Instagram URLs Supported:
- `https://www.instagram.com/reel/ABC123/`
- `https://www.instagram.com/p/ABC123/`
- `https://instagram.com/reel/ABC123/` (without www)

### YouTube URLs Supported:
- `https://www.youtube.com/shorts/ABC123`
- `https://youtu.be/ABC123`
- `https://www.youtube.com/watch?v=ABC123`
- `https://youtube.com/shorts/ABC123` (without www)

## Implementation Details

### Helper Functions

**getInstagramReelId(url)**: Extracts Instagram Reel/Post ID from URL
**getYouTubeVideoId(url)**: Extracts YouTube Video ID from URL

### Database Schema

```sql
ALTER TABLE blog_articles 
ADD COLUMN instagram_reel_url TEXT,
ADD COLUMN youtube_short_url TEXT;
```

### API Updates

The blog API automatically includes these fields when:
- Creating articles
- Updating articles
- Fetching articles

No backend changes needed - fields are passed through automatically.

## Usage Example

1. **Create Article with Social Links**:
   - Go to `/admin/blog/new`
   - Fill in article details
   - In "Social Media Links" section:
     - Instagram: `https://www.instagram.com/reel/CxYz123/`
     - YouTube: `https://www.youtube.com/shorts/ABC123`
   - Save article

2. **View on Stories Page**:
   - Go to `/stories`
   - See article in "Reels & Shorts" section
   - Click to view full article

3. **View on Article Page**:
   - Click article from stories page
   - See "Watch on Social Media" section
   - Click links to watch on Instagram/YouTube

## Notes

- URLs are stored as-is (no validation/transformation)
- Links open in new tab with `target="_blank"` and `rel="noopener noreferrer"`
- If no social media links are added, sections won't appear
- Featured images are used as thumbnails when available
- Platform badges help users identify content type

---

**Last Updated**: November 24, 2025  
**Status**: ✅ Complete - Instagram Reels and YouTube Shorts fully integrated


