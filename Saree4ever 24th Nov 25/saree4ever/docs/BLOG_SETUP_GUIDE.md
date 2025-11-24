# Blog & Stories Setup Guide

## Quick Start

### 1. Run Database Migration

Execute the migration SQL file in your Supabase database:

```sql
-- Run: backend/migrations/create_blog_articles_table.sql
```

This creates:
- `blog_articles` table with all necessary columns
- Indexes for performance
- Row Level Security policies
- Sample articles for testing

### 2. Restart Backend Server

The backend server needs to be restarted to load the new blog routes:

```bash
cd backend
npm run dev
```

### 3. Access the Features

**Public Pages:**
- Stories Page: `http://localhost:3000/stories`
- Individual Article: `http://localhost:3000/stories/[slug]`

**Admin Pages:**
- Blog Management: `http://localhost:3000/admin/blog`
- Create Article: `http://localhost:3000/admin/blog/new`
- Edit Article: `http://localhost:3000/admin/blog/[id]/edit`

## Navigation

The "Stories" link has been added to the main header navigation, appearing after "Offers".

## Creating Your First Article

1. Log in as admin
2. Go to `/admin/blog`
3. Click "+ New Article"
4. Fill in the form:
   - **Title**: "The Art of Saree Draping"
   - **Slug**: "art-of-saree-draping" (auto-generated)
   - **Content**: Use HTML for formatting:
     ```html
     <h2>Introduction</h2>
     <p>Draping a saree is an art form...</p>
     <h3>Basic Steps</h3>
     <ul>
       <li>Step 1: Tuck the pallu</li>
       <li>Step 2: Create pleats</li>
     </ul>
     ```
   - **Category**: Select from dropdown
   - **Tags**: "draping, tutorial, tips" (comma-separated)
   - **Status**: Select "Published"
5. Click "Create Article"
6. Visit `/stories` to see your article

## Instagram Reels

Currently, the Instagram reels section shows placeholder content. To add real reels:

1. **Option A**: Update the `INSTAGRAM_REELS` array in `/frontend/src/app/stories/page.tsx`
2. **Option B**: Create a database table for reels and fetch from API
3. **Option C**: Integrate with Instagram Basic Display API

## Article Content Tips

### HTML Formatting Examples

**Headings:**
```html
<h2>Main Section</h2>
<h3>Subsection</h3>
```

**Paragraphs:**
```html
<p>Your paragraph text here.</p>
```

**Lists:**
```html
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

**Bold and Italic:**
```html
<strong>Bold text</strong>
<em>Italic text</em>
```

**Links:**
```html
<a href="https://example.com">Link text</a>
```

**Images:**
```html
<img src="https://example.com/image.jpg" alt="Description" />
```

## Troubleshooting

### Articles Not Showing
- Check article status is "published"
- Verify database migration ran successfully
- Check browser console for errors

### Cannot Create Article
- Ensure you're logged in as admin
- Check backend server is running
- Verify database connection

### Styling Issues
- Clear browser cache
- Check `globals.css` has prose styles
- Verify Tailwind CSS is compiling

## Next Steps

1. Create sample articles for each category
2. Add featured images to articles
3. Set up Instagram reels integration
4. Customize categories as needed
5. Add more prose styling if needed

## Support

For issues or questions, refer to:
- `docs/BLOG_IMPLEMENTATION.md` - Full implementation details
- Backend routes: `backend/routes/blog.js`
- Frontend pages: `frontend/src/app/stories/`
- Admin pages: `frontend/src/app/admin/blog/`


