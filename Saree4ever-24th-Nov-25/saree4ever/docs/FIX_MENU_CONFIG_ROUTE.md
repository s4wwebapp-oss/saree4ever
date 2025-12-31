# Fix Menu Config Route Error

## Error
```
Route not found
at fetchAPI (/menu-config)
```

## Solution

### Step 1: Create the Database Table
Run the migration SQL in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Open `backend/migrations/create_menu_config_table.sql`
3. Copy and paste the entire SQL script
4. Click "Run"

This will create the `menu_config` table with default values.

### Step 2: Restart Backend Server
The backend needs to be restarted to pick up the new route:

```bash
# Stop the current backend server (Ctrl+C)
# Then restart it:
cd saree4ever/backend
npm run dev
```

### Step 3: Verify the Route
Test the endpoint:

```bash
# Should return menu configs
curl http://localhost:5001/api/menu-config
```

### Step 4: Check Backend Logs
When you restart the backend, you should see:
```
🚀 Server is running on port 5001
📍 Health check: http://localhost:5001/health
📦 API: http://localhost:5001/api
```

## Quick Fix Commands

```bash
# 1. Navigate to backend
cd "saree4ever/backend"

# 2. Restart the server
npm run dev
```

## Verify Database Table Exists

Run this in Supabase SQL Editor:
```sql
SELECT * FROM menu_config;
```

If the table doesn't exist, run the migration script.

## Expected Response

When working correctly, `/api/menu-config` should return:
```json
{
  "configs": {
    "shop_by": {
      "id": "...",
      "menu_type": "shop_by",
      "column_1_title": "HERITAGE SILKS",
      "column_2_title": "COTTON & HANDLOOM",
      "column_3_title": "MODERN & CONTEMPORARY"
    },
    "collections": { ... },
    "categories": { ... }
  },
  "raw": [ ... ]
}
```


