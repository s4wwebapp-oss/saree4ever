# Coming Soon Page Implementation

## Overview

A complete coming soon page system has been implemented that allows admins to toggle between the regular landing page and a full-page coming soon page with scrollable videos and images.

## Features

### 1. Coming Soon Page Component
- **Full-page video/image display** with autoplay
- **Scrollable navigation** - Users can scroll (mouse wheel, touch, or arrow keys) to navigate between videos/images
- **Auto-advance** - Videos automatically advance to the next when they end (if not looping)
- **Navigation indicators** - Dots showing current position
- **Responsive design** - Works on all screen sizes
- **Keyboard support** - Arrow keys for navigation

### 2. Admin Controls
- **Toggle in Settings** (`/admin/settings`) - Enable/disable coming soon mode
- **Media Management** (`/admin/coming-soon`) - Add, edit, delete, and reorder videos/images
- **Customizable title and subtitle** for the coming soon page

### 3. Database Structure
- `coming_soon_settings` table - Stores toggle state and page text
- `coming_soon_media` table - Stores videos and images with metadata

## Files Created/Modified

### Backend
1. **Migration**: `backend/migrations/create_coming_soon_settings.sql`
   - Creates `coming_soon_settings` and `coming_soon_media` tables
   - Sets up RLS policies for public read and admin write access

2. **Service**: `backend/services/comingSoonService.js`
   - Handles all database operations for coming soon settings and media

3. **Controller**: `backend/controllers/comingSoonController.js`
   - API endpoints for managing coming soon settings and media

4. **Routes**: `backend/routes/coming-soon.js`
   - Public routes: `/api/coming-soon/settings`, `/api/coming-soon/media`
   - Admin routes: All CRUD operations for media management

5. **Server**: `backend/server.js`
   - Added route registration for coming soon API

### Frontend
1. **Component**: `frontend/src/components/ComingSoon.tsx`
   - Main coming soon page component with full-page video/image display
   - Scroll navigation, keyboard support, and auto-advance

2. **Landing Page**: `frontend/src/app/page.tsx`
   - Checks coming soon mode before rendering
   - Shows ComingSoon component if enabled, otherwise shows regular page

3. **Admin Settings**: `frontend/src/app/admin/settings/page.tsx`
   - Added coming soon toggle section
   - Allows enabling/disabling and customizing title/subtitle

4. **Admin Media Management**: `frontend/src/app/admin/coming-soon/page.tsx`
   - Full CRUD interface for managing videos and images
   - Upload support via Supabase Storage
   - Reordering functionality

5. **API Client**: `frontend/src/lib/api.ts`
   - Added `comingSoon` API methods

## Database Migration

Run the migration in your Supabase SQL Editor:

```sql
-- File: backend/migrations/create_coming_soon_settings.sql
```

This creates:
- `coming_soon_settings` table with `is_enabled`, `title`, `subtitle`
- `coming_soon_media` table with support for videos and images

## Usage

### 1. Enable Coming Soon Mode

1. Go to `/admin/settings`
2. Find the "Coming Soon Page" section
3. Click "Enable" button
4. Optionally customize the title and subtitle

### 2. Add Videos/Images

1. Go to `/admin/coming-soon`
2. Select media type (Video or Image)
3. Either:
   - Enter a URL directly, or
   - Click "Upload" to upload a file
4. Fill in optional title and description
5. Configure video settings (autoplay, muted, loop)
6. Set display order
7. Click "Create"

### 3. Manage Media

- **Edit**: Click "Edit" on any media item
- **Delete**: Click "Delete" (with confirmation)
- **Reorder**: Use ↑ and ↓ buttons to change display order
- **Toggle Active**: Edit and uncheck "Active" to hide without deleting

### 4. Navigation on Coming Soon Page

Users can navigate between videos/images using:
- **Mouse wheel** - Scroll up/down
- **Touch gestures** - Swipe up/down on mobile
- **Arrow keys** - Up/Down arrow keys
- **Navigation dots** - Click on dots at bottom

## API Endpoints

### Public Endpoints
- `GET /api/coming-soon/settings` - Get coming soon settings
- `GET /api/coming-soon/media` - Get active media (public)

### Admin Endpoints (require authentication)
- `PUT /api/coming-soon/settings` - Update settings
- `GET /api/coming-soon/media/all` - Get all media
- `POST /api/coming-soon/media` - Create media
- `PUT /api/coming-soon/media/:id` - Update media
- `DELETE /api/coming-soon/media/:id` - Delete media
- `PUT /api/coming-soon/media/reorder` - Reorder media

## Technical Details

### Coming Soon Component Features
- **Full-page display** - Uses `fixed inset-0` for full viewport coverage
- **Video autoplay** - Videos autoplay when scrolled into view
- **Smooth transitions** - 800ms transition between media items
- **Touch support** - Handles touch events for mobile devices
- **Keyboard navigation** - Arrow keys for accessibility
- **Auto-advance** - Videos automatically move to next when finished (if not looping)

### Media Types Supported
- **Videos**: MP4, WebM, and other HTML5 video formats
- **Images**: JPG, PNG, WebP, and other image formats

### Video Settings
- **Autoplay**: Video starts playing automatically
- **Muted**: Video plays without sound (required for autoplay in most browsers)
- **Loop**: Video repeats when finished

## Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Test the coming soon page** by enabling it in admin settings
3. **Add your videos/images** via the admin interface
4. **Customize the title/subtitle** to match your brand

## Notes

- The coming soon page takes full control of the viewport
- Regular landing page sections are completely hidden when coming soon is enabled
- Media is stored in Supabase Storage (uploads bucket)
- All media must be publicly accessible for the coming soon page to display correctly
