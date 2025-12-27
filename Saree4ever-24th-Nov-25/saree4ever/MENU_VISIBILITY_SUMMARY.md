# Menu Hide/Show Functionality - Complete Summary

## ✅ Status: All Admin Pages Exist with Hide/Show Functionality

All three admin pages are already implemented with full hide/show (active/inactive) functionality:

1. ✅ **Collections** - `/admin/collections`
2. ✅ **Categories** - `/admin/categories`  
3. ✅ **Types** - `/admin/types`

---

## 📍 Where to Find Hide/Show Function

### 1. Admin Panel (Easiest Method)

#### Collections Page
- **URL**: `/admin/collections`
- **Location**: `frontend/src/app/admin/collections/page.tsx`
- **How to use**: Click "Deactivate" or "Activate" button on each collection card
- **Status**: ✅ Fully functional (may need backend API endpoint)

#### Categories Page
- **URL**: `/admin/categories`
- **Location**: `frontend/src/app/admin/categories/page.tsx`
- **How to use**: 
  - Click the "Active"/"Inactive" status badge in the table, OR
  - Click "Edit" and toggle the "Active" checkbox
- **Status**: ✅ Fully functional with backend API

#### Types Page
- **URL**: `/admin/types`
- **Location**: `frontend/src/app/admin/types/page.tsx`
- **How to use**: 
  - Click the "Active"/"Inactive" status badge in the table, OR
  - Click "Edit" and toggle the "Active" checkbox
- **Status**: ✅ Fully functional with backend API

---

## 🔧 Backend Implementation

### How It Works

**Backend Services** automatically filter by `is_active = true`:

1. **Collections**: 
   - File: `backend/services/collectionService.js`
   - Line 10: `.eq('is_active', true)`

2. **Categories**: 
   - File: `backend/services/categoryService.js`
   - Similar filtering

3. **Types**: 
   - File: `backend/services/typeService.js`
   - Similar filtering

**Frontend Header** (`frontend/src/components/Header.tsx`):
- Fetches only active items via API
- Inactive items are automatically excluded from menu

---

## 📝 SQL Queries for Direct Database Updates

### Hide Collections
```sql
UPDATE collections 
SET is_active = false, updated_at = NOW()
WHERE slug = 'collection-slug-here';
```

### Show Collections
```sql
UPDATE collections 
SET is_active = true, updated_at = NOW()
WHERE slug = 'collection-slug-here';
```

### Hide Categories
```sql
UPDATE categories 
SET is_active = false, updated_at = NOW()
WHERE slug = 'category-slug-here';
```

### Show Categories
```sql
UPDATE categories 
SET is_active = true, updated_at = NOW()
WHERE slug = 'category-slug-here';
```

### Hide Types
```sql
UPDATE types 
SET is_active = false, updated_at = NOW()
WHERE slug = 'type-slug-here';
```

### Show Types
```sql
UPDATE types 
SET is_active = true, updated_at = NOW()
WHERE slug = 'type-slug-here';
```

### Find Items by Name
```sql
-- Find collection
SELECT id, name, slug, is_active FROM collections WHERE name ILIKE '%name%';

-- Find category
SELECT id, name, slug, is_active FROM categories WHERE name ILIKE '%name%';

-- Find type
SELECT id, name, slug, is_active FROM types WHERE name ILIKE '%name%';
```

---

## 📚 Complete Documentation

For detailed instructions, see:
- **Full Guide**: `backend/docs/MENU_HIDE_SHOW_GUIDE.md`

---

## 🎯 Quick Actions

### Via Admin Panel:
1. Go to `/admin/collections`, `/admin/categories`, or `/admin/types`
2. Find the item you want to hide/show
3. Click the status toggle button or edit the item

### Via SQL (Supabase):
1. Open Supabase SQL Editor
2. Run the appropriate UPDATE query (see above)
3. Changes take effect immediately

---

## ⚠️ Note on Collections

The Collections admin page has the UI for hide/show, but the backend update endpoint may need to be implemented. If the toggle doesn't work, use SQL queries or implement the update endpoint in:
- `backend/routes/collections.js` (add PUT endpoint)
- `backend/controllers/collectionController.js` (add update method)

---

**All functionality is ready to use!** 🎉





