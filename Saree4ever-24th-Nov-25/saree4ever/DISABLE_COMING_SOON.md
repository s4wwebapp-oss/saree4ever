# How to Disable Coming Soon Page

## Quick Method: Admin Panel (Recommended)

1. **Navigate to Admin Settings**
   - Go to: `/admin/settings`
   - Or: `https://your-domain.com/admin/settings`

2. **Find Coming Soon Section**
   - Scroll to "Coming Soon Page" section

3. **Toggle Off**
   - Click the button that says "Enabled"
   - It will change to "Disabled"
   - You'll see a success message

4. **Refresh Homepage**
   - Go back to your homepage
   - The regular landing page should now display

## Alternative: Direct Database Update (SQL)

If you have access to Supabase SQL Editor:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid
   - Navigate to: SQL Editor

2. **Run this SQL query**:

```sql
UPDATE coming_soon_settings 
SET is_enabled = false, updated_at = NOW()
WHERE id IN (SELECT id FROM coming_soon_settings LIMIT 1);
```

Or if you want to disable all records:

```sql
UPDATE coming_soon_settings 
SET is_enabled = false, updated_at = NOW();
```

3. **Check the result**:
```sql
SELECT * FROM coming_soon_settings;
```

4. **Refresh your homepage** - The coming soon page should be disabled.

## Verify It's Disabled

After disabling, visit your homepage and you should see:
- ✅ Regular landing page with all sections
- ✅ Header and navigation visible
- ✅ Product listings and categories
- ❌ No "Coming Soon" page

## Re-enable Later

If you want to enable it again:
- Use the admin panel toggle, or
- Run: `UPDATE coming_soon_settings SET is_enabled = true;`
