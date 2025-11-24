# Blog & Stories Implementation

## Overview

A complete blog and stories system has been implemented for Saree4Ever, allowing admins to create and manage blog articles about collections, sarees, and related topics. The system includes Instagram reels integration and a beautiful, well-styled article display.

## Features

### Frontend Features
- **Stories Page** (`/stories`): Main landing page displaying:
  - Instagram reels section
  - Featured articles
  - All published articles in a grid layout
- **Article Detail Page** (`/stories/[slug]`): Individual article view with:
  - Full article content with HTML formatting
  - Author, date, and view count
  - Tags and categories
  - Breadcrumb navigation
  - Well-styled typography using prose classes
- **Navigation**: "Stories" link added to main header navigation

### Admin Features
- **Blog Management** (`/admin/blog`): List all articles with:
  - Status filtering (published, draft, archived)
  - Search functionality
  - View, edit, and delete actions
  - Status badges
  - View counts
- **Article Editor** (`/admin/blog/new` and `/admin/blog/[id]/edit`):
  - Rich form with all article fields
  - HTML content editor
  - Category selection
  - Tag management
  - SEO metadata (meta description, keywords)
  - Featured image URL
  - Publishing status control
  - Featured article toggle

### Backend Features
- **RESTful API** for blog articles:
  - `GET /api/blog` - Get all published articles (public)
  - `GET /api/blog/:slug` - Get article by slug (public)
  - `GET /api/blog/categories` - Get all categories (public)
  - `GET /api/blog/admin/all` - Get all articles for admin
  - `GET /api/blog/admin/:id` - Get article by ID (admin)
  - `POST /api/blog/admin` - Create article (admin)
  - `PUT /api/blog/admin/:id` - Update article (admin)
  - `DELETE /api/blog/admin/:id` - Delete article (admin)
- **Database Schema**: Complete `blog_articles` table with:
  - Title, slug, excerpt, content
  - Featured image URL
  - Author information
  - Category and tags
  - Status (draft, published, archived)
  - SEO metadata
  - View count tracking
  - Featured article flag
  - Timestamps

## Database Migration

Run the migration to create the blog articles table:

```bash
# Connect to your Supabase database and run:
psql -h <your-supabase-host> -U postgres -d postgres -f backend/migrations/create_blog_articles_table.sql
```

Or use the Supabase SQL Editor to execute the migration file.

## Article Content Formatting

Articles support HTML formatting. You can use:
- Headings: `<h2>`, `<h3>`
- Paragraphs: `<p>`
- Lists: `<ul>`, `<ol>`, `<li>`
- Text formatting: `<strong>`, `<em>`
- Links: `<a href="...">`
- Images: `<img src="..." alt="...">`

Example article content:
```html
<h2>The Heritage of Kanjivaram</h2>
<p>Kanjivaram sarees are a symbol of South Indian tradition...</p>
<h3>What Makes Kanjivaram Special?</h3>
<ul>
  <li><strong>Pure Silk:</strong> Made from the finest mulberry silk threads</li>
  <li><strong>Zari Work:</strong> Intricate gold and silver thread patterns</li>
</ul>
```

## Instagram Reels Integration

The Instagram reels section currently displays placeholder content. To integrate with actual Instagram reels:

1. **Option 1: Instagram Basic Display API**
   - Set up Instagram app and get access token
   - Fetch reels from Instagram API
   - Update `INSTAGRAM_REELS` in `/frontend/src/app/stories/page.tsx`

2. **Option 2: Manual Management**
   - Add a database table for Instagram reels
   - Create admin UI to manage reels
   - Fetch from database instead of hardcoded array

3. **Option 3: Embed URLs**
   - Use Instagram embed URLs directly
   - Store embed URLs in database
   - Render using iframe or Instagram embed script

## Article Categories

Default categories available:
- Collections
- Saree Care
- Fashion Tips
- History
- Styling
- Fabric Guide
- Occasions

You can add more categories by updating the `CATEGORIES` array in:
- `/frontend/src/app/admin/blog/new/page.tsx`
- `/frontend/src/app/admin/blog/[id]/edit/page.tsx`

## SEO Features

Each article includes:
- **Meta Description**: For search engine snippets
- **Meta Keywords**: For SEO optimization
- **Slug**: SEO-friendly URL structure
- **Category**: For content organization

## Styling

Articles use custom prose classes defined in `globals.css`:
- Serif headings (h2, h3)
- Well-spaced paragraphs
- Styled lists
- Link underlines
- Code blocks
- Blockquotes

The styling maintains the black & white editorial aesthetic of the site.

## Usage

### Creating an Article

1. Navigate to `/admin/blog`
2. Click "+ New Article"
3. Fill in:
   - Title (required)
   - Slug (auto-generated from title, but editable)
   - Excerpt (optional summary)
   - Content (HTML formatted)
   - Featured image URL
   - Category
   - Tags (comma-separated)
   - Author name
   - Meta description and keywords
   - Status (draft/published/archived)
   - Featured toggle
4. Click "Create Article"

### Viewing Articles

- Public articles: Visit `/stories` to see all published articles
- Individual article: Visit `/stories/[slug]` to read full article
- Admin view: Visit `/admin/blog` to manage all articles

## Future Enhancements

Potential improvements:
1. **Rich Text Editor**: Replace textarea with WYSIWYG editor (e.g., TinyMCE, Quill)
2. **Image Upload**: Direct image upload to Supabase Storage
3. **Related Articles**: Show related articles based on tags/category
4. **Comments**: Add commenting system
5. **Social Sharing**: Add share buttons for social media
6. **Reading Time**: Calculate and display estimated reading time
7. **Author Profiles**: Full author profile pages
8. **Newsletter Integration**: Subscribe to blog updates
9. **Search**: Full-text search for articles
10. **RSS Feed**: Generate RSS feed for blog articles

## API Examples

### Get All Published Articles
```javascript
const response = await api.blog.getAll({
  limit: 20,
  offset: 0,
  category: 'Collections',
  featured: true,
  search: 'kanjivaram'
});
```

### Get Article by Slug
```javascript
const response = await api.blog.getBySlug('timeless-elegance-kanjivaram-sarees');
```

### Create Article (Admin)
```javascript
const article = await api.blog.create({
  title: 'New Article',
  slug: 'new-article',
  content: '<p>Article content...</p>',
  status: 'published',
  category: 'Collections',
  tags: ['saree', 'silk']
});
```

## Notes

- Articles are stored with HTML content for flexibility
- View counts are automatically incremented when articles are viewed
- Slug must be unique
- Published articles are visible to all users
- Draft and archived articles are only visible to admins
- Featured articles appear in the featured section on the stories page


