# ⚠️ IMPORTANT: Run Database Migration First

## Before Testing Instagram/YouTube Integration

You **MUST** run the database migration to add the new columns before the integration will work.

### Step 1: Run the Migration

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project: `vjgxuamvrnmulvdajvid`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the contents of: `backend/migrations/add_social_media_to_blog.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Cmd/Ctrl + Enter`

### Step 2: Verify Migration

Run this query to verify the columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blog_articles' 
AND column_name IN ('instagram_reel_url', 'youtube_short_url');
```

You should see both columns listed.

### Step 3: Test Again

After running the migration:
1. Go back to admin panel
2. Edit the article again
3. Add the Instagram Reel URL
4. Save
5. Check `/stories` page - the reel should appear!

---

**Migration File**: `backend/migrations/add_social_media_to_blog.sql`


