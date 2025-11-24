# How to Run the Audit Tables Migration

## Quick Start

1. **Open Supabase SQL Editor**
   - Go to your Supabase Dashboard
   - Navigate to **SQL Editor**
   - Click **"New query"**

2. **Copy and Paste the Migration**
   - Open `backend/migrations/create_audit_tables.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

3. **Run the Migration**
   - Click **"Run"** or press `Cmd/Ctrl + Enter`
   - Wait for success message

4. **Verify Tables Created**
   - Go to **Table Editor** in Supabase Dashboard
   - You should see three new tables:
     - `audit_logs`
     - `stock_adjustments`
     - `import_logs`

## What Gets Created

### 1. `audit_logs` Table
Tracks all admin actions:
- Who did it (actor_id, actor_email)
- What action (action type)
- What resource (resource_type, resource_id)
- What changed (before_data, after_data)
- When (created_at)
- Where from (ip_address, user_agent)

### 2. `stock_adjustments` Table
Tracks all stock changes:
- Which variant/product
- Previous stock → New stock
- Delta (auto-calculated)
- Reason for change
- Who made the change
- When

### 3. `import_logs` Table
Tracks CSV imports:
- Import type (products/variants/stock/offers)
- File name
- Results (imported/updated/failed counts)
- Errors (JSON array)
- Who imported
- When

## Indexes Created

All tables have indexes for fast queries:
- By actor/user
- By resource/product/variant
- By date (for recent activity)
- By status (for imports)

## Verification Queries

After running the migration, test with these queries:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('audit_logs', 'stock_adjustments', 'import_logs');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('audit_logs', 'stock_adjustments', 'import_logs');

-- Test insert (will be empty initially)
SELECT COUNT(*) FROM audit_logs;
SELECT COUNT(*) FROM stock_adjustments;
SELECT COUNT(*) FROM import_logs;
```

## Next Steps

After migration:

1. **Backend will start logging:**
   - Product updates → `audit_logs`
   - Stock changes → `stock_adjustments`
   - CSV imports → `import_logs`

2. **Create API endpoints:**
   - `GET /api/audit/logs` - View audit logs
   - `GET /api/inventory/adjustments` - View stock adjustments
   - `GET /api/csv-import/history` - View import history

3. **Create Frontend pages:**
   - `/admin/audit` - Audit log viewer
   - `/admin/stock-history` - Stock adjustment history
   - Enhanced `/admin/import` - Show import history

## Troubleshooting

### Error: "relation already exists"
- Tables already exist, migration was run before
- Safe to ignore or drop tables first if you want to recreate

### Error: "permission denied"
- Make sure you're using the SQL Editor (has full permissions)
- Not using the API (which has RLS restrictions)

### Error: "foreign key constraint"
- Make sure `user_profiles`, `variants`, and `products` tables exist
- These are referenced by the new tables

## Rollback (if needed)

If you need to remove these tables:

```sql
DROP TABLE IF EXISTS import_logs CASCADE;
DROP TABLE IF EXISTS stock_adjustments CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP FUNCTION IF EXISTS calculate_stock_delta() CASCADE;
```

**Warning:** This will delete all audit history. Only do this in development.



