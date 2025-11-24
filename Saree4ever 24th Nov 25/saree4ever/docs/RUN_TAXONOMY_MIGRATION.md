# Run Taxonomy Migration

This guide provides instructions to run the SQL migration for creating the complete taxonomy system.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** in the left sidebar
3. Click on **"New query"** to open a new query tab

## Step 2: Run the Migration SQL

1. Open the file `backend/migrations/create_taxonomy_schema.sql` in your local project
2. Copy the entire content of the SQL file
3. Paste the copied SQL into the Supabase SQL Editor
4. Click the **"Run"** button (usually a ▶ icon) to execute the migration

## Step 3: Verify Migration

After running the migration, verify that everything was created successfully:

### Check Product Attributes
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('color', 'weave', 'length_m', 'blouse_included', 'mrp', 'subcategories');
```

### Check Categories
```sql
SELECT COUNT(*) as category_count FROM categories;
-- Should return 11
```

### Check Types
```sql
SELECT COUNT(*) as type_count FROM types;
-- Should return 32+
```

### Check Collections
```sql
SELECT COUNT(*) as collection_count FROM collections;
-- Should return 6
```

## Step 4: Verify Seed Data

### Categories (11)
```sql
SELECT name, slug FROM categories ORDER BY display_order;
```

Expected categories:
- Bridal / Wedding
- Festive / Celebration
- Party / Evening Wear
- Designer / Premium
- Handloom / Artisanal
- Daily / Casual / Everyday
- Office / Formal / Workwear
- Lightweight / Travel-friendly
- Sustainable / Eco-friendly
- New Arrivals
- Sale / Offers / Clearance

### Types (32+)
```sql
SELECT name, slug FROM types ORDER BY display_order LIMIT 10;
```

Should include: Kanjivaram, Banarasi, Paithani, Tussar, Mysore Silk, Muga, Silk, Cotton, Chanderi, Jamdani, etc.

### Collections (6)
```sql
SELECT name, slug FROM collections ORDER BY display_order;
```

Expected collections:
- Bridal Edit
- Pure Silk Classics
- Handloom Heritage
- Festive Specials
- Office / Formal Edit
- Summer Lightweight

## Troubleshooting

- **"Column already exists" error**: This means you've run the migration before. The `IF NOT EXISTS` clauses should prevent this, but if you encounter it, you can safely ignore it or drop the columns first if you intend a clean re-run.

- **"Permission denied" error**: Ensure you are logged in with a role that has sufficient permissions to create tables and alter columns (e.g., `postgres` role or a custom role with `ALTER` privileges).

- **Data not appearing**: Double-check for any errors in the SQL Editor output. Ensure the `ON CONFLICT` clauses are working correctly.

## Rollback (if needed)

If you need to revert this migration, you can drop the columns:

```sql
ALTER TABLE products DROP COLUMN IF EXISTS color;
ALTER TABLE products DROP COLUMN IF EXISTS weave;
ALTER TABLE products DROP COLUMN IF EXISTS length_m;
ALTER TABLE products DROP COLUMN IF EXISTS blouse_included;
ALTER TABLE products DROP COLUMN IF EXISTS mrp;
ALTER TABLE products DROP COLUMN IF EXISTS subcategories;
ALTER TABLE categories DROP COLUMN IF EXISTS icon;
```

**Note:** This will NOT delete the seed data (categories, types, collections) as they may be referenced by products. If you want to remove seed data, do it manually.

---

**Status:** Migration SQL created. Ready to be executed.



