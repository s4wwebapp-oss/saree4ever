# Social Media Icons Setup Guide

## Why Social Media Icons Are Not Visible

If the social media icons are not showing in the header, it's likely because:

1. **The migration hasn't been run** - The `social_media_settings` table doesn't exist or has no data
2. **All links are set to invisible** - Links exist but `is_visible = false`
3. **No URLs are configured** - Links exist but have no URLs

## Step 1: Run the Migration

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid
   - Or your project dashboard

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Open the file: `backend/migrations/create_social_media_settings.sql`
   - Copy all the SQL code
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verify the Migration**
   - Go to "Table Editor" in Supabase
   - You should see `social_media_settings` table
   - It should have 5 rows (instagram, facebook, twitter, youtube, pinterest)

## Step 2: Configure Social Media Links

After running the migration, configure your social media links:

1. **Go to Admin Panel**
   - Navigate to: `/admin/settings`
   - Scroll to "Social Media Settings" section

2. **Update URLs**
   - Enter your actual social media URLs for each platform
   - Make sure URLs are valid (start with `https://`)

3. **Set Visibility**
   - Toggle the "Visible" button for each platform you want to show
   - Only platforms with `is_visible = true` will appear in the header

4. **Save Changes**
   - URLs are saved automatically when you blur the input field
   - Visibility is saved when you click the toggle button

## Step 3: Verify

1. **Check the API**
   - Visit: `http://localhost:5001/api/social-media-settings/links`
   - Should return: `{"links": [{"platform": "instagram", "url": "..."}, ...]}`

2. **Check the Frontend**
   - Refresh your website
   - Social media icons should appear at the top of the header (gray bar)
   - Icons are right-aligned

## Troubleshooting

### Icons Still Not Showing?

1. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check for any errors in the Console tab

2. **Check Backend Logs**
   - Look for warnings about social media settings
   - Check if the API endpoint is returning data

3. **Verify Database**
   - Run this query in Supabase SQL Editor:
   ```sql
   SELECT platform, url, is_visible 
   FROM social_media_settings 
   WHERE is_visible = true;
   ```
   - Should return rows with `is_visible = true` and valid URLs

4. **Check RLS Policies**
   - The migration creates a public read policy
   - If icons still don't show, verify the policy exists:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'social_media_settings';
   ```

## Location of Icons

The social media icons appear:
- **Location**: Top of the header (above announcement bar)
- **Style**: Gray bar with right-aligned icons
- **File**: `frontend/src/components/Header.tsx` (lines 268-290)
- **Condition**: Only shows if `socialMediaLinks.length > 0`

## Supported Platforms

- Instagram
- Facebook
- Twitter/X
- YouTube
- Pinterest

Each platform has a custom icon and hover color.





