# Fix Hero Slides Error - "button_target column not found"

## Problem
The `hero_slides` table is missing the `button_target` column, causing this error:
```
Could not find the 'button_target' column of 'hero_slides' in the schema cache
```

## Solution

Run the following SQL in your Supabase SQL Editor:

### Step 1: Go to Supabase SQL Editor
1. Open https://app.supabase.com/project/vyrsqtolsisgwfbiairv/sql/new
2. Copy and paste the SQL below
3. Click "Run"

### Step 2: Run This SQL

```sql
-- Add button_target column to hero_slides table if it doesn't exist
-- This fixes the "Could not find the 'button_target' column" error

DO $$
BEGIN
  -- Check if column exists, if not add it
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'hero_slides'
    AND column_name = 'button_target'
  ) THEN
    ALTER TABLE hero_slides
    ADD COLUMN button_target VARCHAR(20) DEFAULT '_self';

    RAISE NOTICE 'Added button_target column to hero_slides table';
  ELSE
    RAISE NOTICE 'button_target column already exists in hero_slides table';
  END IF;
END $$;

-- Update any existing records without button_target to have default value
UPDATE hero_slides
SET button_target = '_self'
WHERE button_target IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN hero_slides.button_target IS 'Link target: _self (same tab) or _blank (new tab)';
```

### Step 3: Verify the Fix

After running the SQL, refresh your admin page at `/admin/hero-slides` and the error should be gone!

---

## What This Does

1. **Checks if column exists**: Safely checks if `button_target` already exists
2. **Adds the column**: Creates the column with default value `'_self'`
3. **Updates existing data**: Sets default value for any existing hero slides
4. **Adds documentation**: Adds a comment explaining what the column is for

## Values for button_target

- `_self` = Opens link in same tab (default)
- `_blank` = Opens link in new tab

---

## Alternative: Quick Fix via Command Line

If you prefer to run it from command line:

```bash
# Using psql (if you have PostgreSQL client installed)
psql "postgresql://postgres.vyrsqtolsisgwfbiairv:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f backend/migrations/add_button_target_to_hero_slides.sql
```

Replace `[YOUR-PASSWORD]` with your Supabase database password.

---

## Files Created

- ✅ `backend/migrations/add_button_target_to_hero_slides.sql` - The migration SQL
- ✅ `FIX-HERO-SLIDES.md` - This guide

---

**After running the SQL, the Hero Slides admin page should work perfectly!**
