# Hero Slides Management

## Overview

The homepage hero section now features a carousel with up to 3 scrollable slides that can be fully managed from the admin panel. Admins can create, edit, reorder, and activate/deactivate hero slides.

## Features

- **Carousel with 3 Slides**: Up to 3 active slides displayed in rotation
- **Auto-Play**: Slides automatically advance every 5 seconds
- **Manual Navigation**: Users can click arrows or indicators to navigate
- **Pause on Interaction**: Auto-play pauses when user manually navigates
- **Fully Editable**: All slide content managed from admin panel
- **Image Preview**: Live preview of images in admin panel
- **Reorder**: Drag and drop or up/down buttons to reorder slides
- **Active/Inactive Toggle**: Control which slides appear on homepage

## Database Migration

Run the migration to create the hero slides table:

```sql
-- Run: backend/migrations/create_hero_slides_table.sql
```

This creates:
- `hero_slides` table with all necessary columns
- Indexes for performance
- Row Level Security policies
- 3 default sample slides

## Admin Access

1. Log in as admin
2. Navigate to `/admin/hero-slides`
3. You'll see:
   - List of all hero slides
   - Create/Edit form
   - Active slides preview (shows first 3)
   - Reorder controls
   - Active/Inactive toggle

## Creating a Hero Slide

1. Click "+ New Slide"
2. Fill in the form:
   - **Image URL** * (required): Full URL to the hero image
   - **Title**: Main heading text (e.g., "Traditional Elegance, Modern Style")
   - **Subtitle**: Supporting text below title
   - **Button Text**: Text for the call-to-action button (optional)
   - **Button Link**: URL to navigate when button is clicked (optional)
   - **Button Target**: `_self` (same window) or `_blank` (new tab)
   - **Display Order**: Lower numbers appear first (0, 1, 2...)
   - **Active**: Check to activate this slide
3. Click "Create"

## Editing a Hero Slide

1. Click "Edit" next to any slide
2. Modify the fields
3. Click "Update"

## Reordering Slides

- Use the ↑ (up) and ↓ (down) buttons in the "Order" column
- Or manually set the "Display Order" number (lower = first)
- Only the first 3 active slides will appear on the homepage

## Activating/Deactivating

- Click the status badge (Active/Inactive) to toggle
- Only active slides with the lowest display_order values (up to 3) will be shown
- You can have more than 3 slides, but only the first 3 active ones will display

## Slide Content Guidelines

### Image Requirements
- **Recommended Size**: 1920x1080px or similar wide aspect ratio
- **Format**: JPG, PNG, or WebP
- **File Size**: Keep under 500KB for fast loading
- **Content**: Should work well with text overlay (darker areas for text)

### Text Guidelines
- **Title**: Keep it short and impactful (1-2 lines)
- **Subtitle**: Supporting text, can be longer (2-3 lines)
- **Button**: Clear call-to-action (e.g., "Shop Now", "View Collection")

### Link Examples
- `/collections` - Browse all collections
- `/collections/new-arrivals` - New arrivals page
- `/offers` - Offers page
- `/products` - All products page
- `https://example.com` - External link

## Frontend Display

The hero carousel:
- Shows up to 3 active slides
- Auto-advances every 5 seconds
- Pauses auto-play when user clicks navigation
- Includes navigation arrows (left/right)
- Shows slide indicators at the bottom
- Fully responsive (60vh on mobile, 80vh on desktop)

## API Endpoints

### Public
- `GET /api/hero-slides/active` - Get active hero slides (up to 3)

### Admin (requires authentication)
- `GET /api/hero-slides` - Get all hero slides
- `GET /api/hero-slides/:id` - Get slide by ID
- `POST /api/hero-slides` - Create slide
- `PUT /api/hero-slides/:id` - Update slide
- `DELETE /api/hero-slides/:id` - Delete slide
- `POST /api/hero-slides/reorder` - Reorder slides

## Best Practices

1. **Image Quality**: Use high-quality images that look good at full width
2. **Text Contrast**: Ensure text is readable over images (use dark overlay)
3. **Content Variety**: Use different images and messages for each slide
4. **Call-to-Action**: Include clear buttons with relevant links
5. **Keep it Fresh**: Update slides regularly for promotions, seasons, etc.
6. **Limit to 3**: Only activate 3 slides for best performance and UX

## Troubleshooting

### Slides Not Showing
- Check if slides are marked as "Active"
- Verify display_order is set correctly (0, 1, 2 for first 3)
- Check browser console for errors
- Ensure image URLs are accessible

### Images Not Loading
- Verify image URLs are correct and accessible
- Check if images are hosted on a CORS-enabled domain
- Ensure image URLs are full URLs (https://...)

### Carousel Not Working
- Check browser console for JavaScript errors
- Verify backend server is running
- Check database migration ran successfully

## Example Slides

### Slide 1: Main Collection
```
Title: Traditional Elegance, Modern Style
Subtitle: Discover our curated collection of handcrafted sarees
Button: Shop Collections
Link: /collections
Image: [High-quality saree image]
```

### Slide 2: New Arrivals
```
Title: New Arrivals
Subtitle: Explore our latest collection of exquisite sarees
Button: View New Arrivals
Link: /collections/new-arrivals
Image: [Latest collection image]
```

### Slide 3: Special Offers
```
Title: Special Offers
Subtitle: Limited time offers on selected collections
Button: View Offers
Link: /offers
Image: [Promotional image]
```


