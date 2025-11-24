# Fix: announcement_bar Table Missing

## 🔍 Error
```
Could not find the table 'public.announcement_bar' in the schema cache
```

## ✅ Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Run the Migration

1. Open the file: `backend/migrations/create_announcement_bar_table_fixed.sql`
2. Copy **ALL** the contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 3: Verify

Run this query to verify the table exists:

```sql
SELECT * FROM announcement_bar;
```

You should see at least one row with the default announcement.

---

## 📋 What the Migration Creates

### Table: `announcement_bar`

**Columns:**
- `id` (UUID) - Primary key
- `text` (TEXT) - Announcement text
- `link_url` (TEXT) - Optional link URL
- `link_target` (VARCHAR) - Link target (`_self` or `_blank`)
- `is_active` (BOOLEAN) - Whether announcement is active
- `display_order` (INTEGER) - Display order
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Features Created:
- ✅ Table with all columns
- ✅ Index on `is_active` for performance
- ✅ Auto-update trigger for `updated_at`
- ✅ Row Level Security (RLS) policies
- ✅ Default announcement inserted

---

## 🔐 RLS Policies

1. **Public Read**: Anyone can read active announcements
2. **Service Role**: Backend can manage all announcements
3. **Authenticated Users**: Admin panel can manage announcements

---

## 🧪 Test After Migration

### Test 1: Check Table Exists

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'announcement_bar';
```

**Expected:** Should return 1 row

### Test 2: Check Default Data

```sql
SELECT * FROM announcement_bar;
```

**Expected:** Should return at least 1 row with default announcement

### Test 3: Test Admin API

After migration, try accessing:
- Admin page: `http://localhost:3000/admin/announcement`
- Should load without errors

---

## 🚨 If Migration Fails

### Error: "relation already exists"

**Solution:** Table already exists. Skip the CREATE TABLE part or drop it first:

```sql
DROP TABLE IF EXISTS announcement_bar CASCADE;
-- Then run the full migration again
```

### Error: "permission denied"

**Solution:** Make sure you're using the SQL Editor with proper permissions, or use the service role key.

### Error: "function already exists"

**Solution:** The migration handles this with `CREATE OR REPLACE`, so this shouldn't happen. If it does, the migration is idempotent and safe to run again.

---

## 📝 Manual Table Creation (If Migration Fails)

If the migration doesn't work, create the table manually:

```sql
CREATE TABLE announcement_bar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  link_url TEXT,
  link_target VARCHAR(20) DEFAULT '_self',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default
INSERT INTO announcement_bar (text, is_active, display_order)
VALUES ('FREE SHIPPING WORLDWIDE | COMPLIMENTARY FALLS & PICO', true, 0);
```

---

## ✅ Verification Checklist

After running the migration:

- [ ] Table `announcement_bar` exists
- [ ] Can query: `SELECT * FROM announcement_bar;`
- [ ] Default announcement is inserted
- [ ] Admin page `/admin/announcement` loads without errors
- [ ] Can create/edit announcements in admin panel

---

## 🔗 Related Files

- **Migration:** `backend/migrations/create_announcement_bar_table_fixed.sql`
- **Original:** `backend/migrations/create_announcement_bar_table.sql`
- **Admin Page:** `frontend/src/app/admin/announcement/page.tsx`
- **Backend Route:** `backend/routes/announcement.js`

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Ready to Run

Run the migration SQL in Supabase and the error will be fixed!


