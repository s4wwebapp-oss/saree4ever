# Migration Instructions for Landing Page Video Feature

## Files to Run in Supabase

You need to run **ONE** of the following options:

### Option 1: Complete Migration (Recommended)
**File:** `create_landing_page_video_complete.sql`

This is a **single file** that contains everything you need. Run this if the table doesn't exist yet.

### Option 2: Step-by-Step (If table already exists)
If you already ran `create_landing_page_video_table.sql` before, you only need to run:
**File:** `add_display_order_to_landing_page_video.sql`

---

## How to Run in Supabase

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid
   - Or your project dashboard

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste**
   - Open the migration file (`create_landing_page_video_complete.sql`)
   - Copy all the SQL code
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Wait for success message

5. **Verify**
   - Go to "Table Editor" in Supabase
   - You should see `landing_page_video` table
   - It should have columns: `id`, `video_url`, `video_file_path`, `is_active`, `autoplay`, `muted`, `loop`, `display_order`, `created_at`, `updated_at`

---

## Additional Setup Required

### 1. Create Storage Bucket

After running the migration, create a storage bucket for videos:

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Name: `landing-videos`
4. Set to **Public** (uncheck "Private bucket")
5. Click **"Create bucket"**

### 2. Set Storage Policies (Optional - for direct uploads)

If you want direct uploads from frontend, add this policy in SQL Editor:

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'landing-videos');

-- Allow authenticated users to update their videos
CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'landing-videos');

-- Allow authenticated users to delete videos
CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'landing-videos');
```

---

## Migration Files Summary

| File | Purpose | When to Run |
|------|---------|-------------|
| `create_landing_page_video_complete.sql` | Complete migration (table + display_order) | **Use this if table doesn't exist** |
| `create_landing_page_video_table.sql` | Creates initial table (without display_order) | Only if you need the old version |
| `add_display_order_to_landing_page_video.sql` | Adds display_order column | Only if table exists without display_order |

---

## Troubleshooting

### Error: "relation already exists"
- The table already exists. You can either:
  - Skip the table creation part, OR
  - Run only `add_display_order_to_landing_page_video.sql` if display_order is missing

### Error: "column already exists"
- The `display_order` column already exists. You can skip that part.

### Error: "policy already exists"
- The RLS policies already exist. This is fine, the migration uses `CREATE POLICY IF NOT EXISTS` where possible.

---

## After Migration

Once migration is complete:
1. ✅ Table `landing_page_video` exists
2. ✅ Storage bucket `landing-videos` is created (public)
3. ✅ You can now use `/admin/landing-page-video` to manage videos
4. ✅ Videos will appear on homepage after Quick Categories section





