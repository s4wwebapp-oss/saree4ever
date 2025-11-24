# Reels & Videos Implementation Guide

## Overview
This implementation adds separate management for Instagram Reels and YouTube Videos, with embedded video players that stream directly on your site.

## Features Implemented

### 1. Embedded Video Player
- **Component**: `frontend/src/components/VideoPlayer.tsx`
- **Features**:
  - Embeds Instagram Reels directly on the page (playable inline)
  - Embeds YouTube Videos/Shorts directly on the page (playable inline)
  - Responsive design with proper aspect ratios
  - Fallback links to original platforms

### 2. Database Schema
- **Migration**: `backend/migrations/add_content_type_to_blog.sql`
- **New Field**: `content_type` (values: 'article', 'reel', 'video')
- **Purpose**: Distinguishes between text-based articles and video content

### 3. Separate Admin Pages

#### Articles (Text-based)
- **Path**: `/admin/blog`
- **Create**: `/admin/blog/new`
- **Edit**: `/admin/blog/[id]/edit`
- **Features**: Full article editor with optional social media links

#### Reels & Videos
- **Path**: `/admin/reels`
- **Create Reel**: `/admin/reels/new?type=reel`
- **Create Video**: `/admin/reels/new?type=video`
- **Edit**: `/admin/reels/[id]/edit`
- **Features**: 
  - Focused on video URL (Instagram Reel or YouTube)
  - Optional text content
  - Separate filtering by type

### 4. Frontend Display

#### Stories Page (`/stories`)
- Shows "Reels & Shorts" section with video cards
- Shows "Featured Stories" section (articles)
- Shows "All Stories" section (all content)

#### Individual Story/Reel Page (`/stories/[slug]`)
- **For Articles**: Shows featured image and text content
- **For Reels/Videos**: Shows embedded video player at the top
- Video plays directly on the page (no redirect)
- Additional content below video if provided

## Setup Instructions

### Step 1: Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration: `backend/migrations/add_content_type_to_blog.sql`
3. This adds the `content_type` field to distinguish content types

### Step 2: Verify Backend Service

The backend service (`backend/services/blogService.js`) has been updated to:
- Accept `content_type` field
- Make content optional for reels/videos
- Validate that reels have Instagram URLs and videos have YouTube URLs

### Step 3: Test the Features

1. **Create a Reel**:
   - Go to `/admin/reels`
   - Click "+ New Reel"
   - Add Instagram Reel URL
   - Save and view on `/stories`

2. **Create a Video**:
   - Go to `/admin/reels`
   - Click "+ New Video"
   - Add YouTube Video URL
   - Save and view on `/stories`

3. **View Embedded Video**:
   - Navigate to `/stories/[slug]` for a reel/video
   - Video should play directly on the page

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── VideoPlayer.tsx          # Embedded video player component
│   └── app/
│       ├── stories/
│       │   ├── page.tsx             # Main stories page (updated)
│       │   └── [slug]/
│       │       └── page.tsx         # Individual story/reel page (updated with video player)
│       └── admin/
│           ├── blog/
│           │   ├── page.tsx         # Articles list (filters out reels/videos)
│           │   ├── new/
│           │   │   └── page.tsx    # Create article
│           │   └── [id]/
│           │       └── edit/
│           │           └── page.tsx # Edit article
│           └── reels/
│               ├── page.tsx         # Reels/Videos list
│               ├── new/
│               │   └── page.tsx     # Create reel/video
│               └── [id]/
│                   └── edit/
│                       └── page.tsx # Edit reel/video

backend/
├── migrations/
│   └── add_content_type_to_blog.sql # Database migration
└── services/
    └── blogService.js               # Updated to handle content_type
```

## Usage

### Creating an Instagram Reel
1. Navigate to `/admin/reels`
2. Click "+ New Reel"
3. Fill in:
   - Title (required)
   - Slug (required)
   - Instagram Reel URL (required)
   - Description (optional)
   - Additional content (optional)
4. Set status and publish

### Creating a YouTube Video
1. Navigate to `/admin/reels`
2. Click "+ New Video"
3. Fill in:
   - Title (required)
   - Slug (required)
   - YouTube Video URL (required)
   - Description (optional)
   - Additional content (optional)
4. Set status and publish

### Creating an Article
1. Navigate to `/admin/blog`
2. Click "+ New Article"
3. Fill in article content
4. Optionally add Instagram/YouTube links (these will show as links, not embedded)

## Key Differences

| Feature | Articles | Reels/Videos |
|---------|----------|--------------|
| Content Type | `article` | `reel` or `video` |
| Primary Content | Text/HTML | Video URL |
| Video Display | Link only | Embedded player |
| Content Required | Yes | No (optional) |
| Video URL Required | No | Yes |

## Notes

- Instagram Reels are embedded using Instagram's embed API
- YouTube Videos are embedded using YouTube's iframe API
- Videos play directly on the site (no redirect)
- Both types appear in the "Reels & Shorts" section on `/stories`
- Articles appear in "Featured Stories" and "All Stories" sections


