# Menu Hide/Show Functionality Guide

## Overview

Menu items (Collections, Categories, Types) can be hidden or shown on the storefront by toggling their `is_active` status. This guide shows you all three ways to manage menu visibility.

---

## ✅ Method 1: Admin Panel (Recommended)

### Access Admin Pages

1. **Collections**: `/admin/collections`
2. **Categories**: `/admin/categories`
3. **Types**: `/admin/types`

### How to Hide/Show Items

#### For Collections:
1. Go to `/admin/collections`
2. Find the collection you want to hide/show
3. Click the **"Deactivate"** or **"Activate"** button
4. The status badge will update immediately

#### For Categories:
1. Go to `/admin/categories`
2. Find the category in the table
3. Click the **"Active"** or **"Inactive"** status badge to toggle
4. Or click **"Edit"** and toggle the "Active" checkbox in the form

#### For Types:
1. Go to `/admin/types`
2. Find the type in the table
3. Click the **"Active"** or **"Inactive"** status badge to toggle
4. Or click **"Edit"** and toggle the "Active" checkbox in the form

### Status Indicators
- **Green badge "Active"** = Visible on storefront menu
- **Gray badge "Inactive"** = Hidden from storefront menu

---

## ✅ Method 2: Direct Database Updates (SQL)

### Hide/Show Collections

```sql
-- Hide a collection (set inactive)
UPDATE collections 
SET is_active = false, updated_at = NOW()
WHERE slug = 'collection-slug-here';

-- Show a collection (set active)
UPDATE collections 
SET is_active = true, updated_at = NOW()
WHERE slug = 'collection-slug-here';

-- Hide multiple collections by name
UPDATE collections 
SET is_active = false, updated_at = NOW()
WHERE name IN ('Collection Name 1', 'Collection Name 2');

-- Show all collections
UPDATE collections 
SET is_active = true, updated_at = NOW();
```

### Hide/Show Categories

```sql
-- Hide a category (set inactive)
UPDATE categories 
SET is_active = false, updated_at = NOW()
WHERE slug = 'category-slug-here';

-- Show a category (set active)
UPDATE categories 
SET is_active = true, updated_at = NOW()
WHERE slug = 'category-slug-here';

-- Hide multiple categories by name
UPDATE categories 
SET is_active = false, updated_at = NOW()
WHERE name IN ('Category Name 1', 'Category Name 2');

-- Show all categories
UPDATE categories 
SET is_active = true, updated_at = NOW();
```

### Hide/Show Types

```sql
-- Hide a type (set inactive)
UPDATE types 
SET is_active = false, updated_at = NOW()
WHERE slug = 'type-slug-here';

-- Show a type (set active)
UPDATE types 
SET is_active = true, updated_at = NOW()
WHERE slug = 'type-slug-here';

-- Hide multiple types by name
UPDATE types 
SET is_active = false, updated_at = NOW()
WHERE name IN ('Type Name 1', 'Type Name 2');

-- Show all types
UPDATE types 
SET is_active = true, updated_at = NOW();
```

### Find Items by Slug

```sql
-- Find collection slug
SELECT id, name, slug, is_active FROM collections WHERE name ILIKE '%collection name%';

-- Find category slug
SELECT id, name, slug, is_active FROM categories WHERE name ILIKE '%category name%';

-- Find type slug
SELECT id, name, slug, is_active FROM types WHERE name ILIKE '%type name%';
```

---

## ✅ Method 3: API Endpoints

### Collections API

```bash
# Get all collections (including inactive for admin)
GET /api/collections?admin=true

# Update collection status
PUT /api/collections/:id
Body: { "is_active": false }
```

### Categories API

```bash
# Get all categories (including inactive for admin)
GET /api/categories?admin=true

# Update category status
PUT /api/categories/:id
Body: { "is_active": false }
```

### Types API

```bash
# Get all types (including inactive for admin)
GET /api/types?admin=true

# Update type status
PUT /api/types/:id
Body: { "is_active": false }
```

---

## 📋 Common Use Cases

### Hide All Items of a Type

```sql
-- Hide all collections
UPDATE collections SET is_active = false, updated_at = NOW();

-- Hide all categories
UPDATE categories SET is_active = false, updated_at = NOW();

-- Hide all types
UPDATE types SET is_active = false, updated_at = NOW();
```

### Show Only Specific Items

```sql
-- Show only specific collections
UPDATE collections 
SET is_active = false, updated_at = NOW(); -- Hide all first
UPDATE collections 
SET is_active = true, updated_at = NOW()
WHERE slug IN ('bridal-edit', 'festive-specials', 'new-arrivals');

-- Show only specific categories
UPDATE categories 
SET is_active = false, updated_at = NOW(); -- Hide all first
UPDATE categories 
SET is_active = true, updated_at = NOW()
WHERE slug IN ('bridal-wedding', 'festive-celebration', 'party-evening');

-- Show only specific types
UPDATE types 
SET is_active = false, updated_at = NOW(); -- Hide all first
UPDATE types 
SET is_active = true, updated_at = NOW()
WHERE slug IN ('chiffon-saree', 'cotton-saree', 'designer-saree');
```

### Check Current Status

```sql
-- View all collections with status
SELECT name, slug, is_active, display_order 
FROM collections 
ORDER BY display_order;

-- View all categories with status
SELECT name, slug, is_active, display_order 
FROM categories 
ORDER BY display_order;

-- View all types with status
SELECT name, slug, is_active, display_order 
FROM types 
ORDER BY display_order;
```

---

## 🔍 How It Works

### Backend Filtering

The backend services automatically filter by `is_active = true` when fetching menu items:

- **Collections**: `backend/services/collectionService.js` (line 10)
- **Categories**: `backend/services/categoryService.js`
- **Types**: `backend/services/typeService.js`

### Frontend Display

The Header component (`frontend/src/components/Header.tsx`) fetches only active items:

```typescript
api.collections.getAll()  // Returns only is_active = true
api.categories.getAll()   // Returns only is_active = true
api.types.getAll()        // Returns only is_active = true
```

### Menu Visibility

- **Active items** (`is_active = true`) → **Visible** in menu
- **Inactive items** (`is_active = false`) → **Hidden** from menu

---

## ⚠️ Important Notes

1. **Products are not affected**: Hiding a collection/category/type does NOT hide products. Products have their own `is_active` field.

2. **Immediate effect**: Changes take effect immediately on the storefront (no cache clearing needed).

3. **Admin view**: Admin pages can show inactive items by using `?admin=true` parameter.

4. **Display order**: Inactive items still have display_order, but won't appear in menu.

---

## 🎯 Quick Reference

| Action | Admin Panel | SQL | API |
|--------|------------|-----|-----|
| Hide Collection | `/admin/collections` → Deactivate | `UPDATE collections SET is_active = false WHERE slug = '...'` | `PUT /api/collections/:id` |
| Show Collection | `/admin/collections` → Activate | `UPDATE collections SET is_active = true WHERE slug = '...'` | `PUT /api/collections/:id` |
| Hide Category | `/admin/categories` → Click status badge | `UPDATE categories SET is_active = false WHERE slug = '...'` | `PUT /api/categories/:id` |
| Show Category | `/admin/categories` → Click status badge | `UPDATE categories SET is_active = true WHERE slug = '...'` | `PUT /api/categories/:id` |
| Hide Type | `/admin/types` → Click status badge | `UPDATE types SET is_active = false WHERE slug = '...'` | `PUT /api/types/:id` |
| Show Type | `/admin/types` → Click status badge | `UPDATE types SET is_active = true WHERE slug = '...'` | `PUT /api/types/:id` |

---

## 📝 Examples

### Example 1: Hide "Kanjivaram" Type

**Admin Panel:**
1. Go to `/admin/types`
2. Find "Kanjivaram"
3. Click "Active" badge → It becomes "Inactive"

**SQL:**
```sql
UPDATE types 
SET is_active = false, updated_at = NOW()
WHERE slug = 'kanjivaram';
```

### Example 2: Show Only "Bridal" Category

**SQL:**
```sql
-- Hide all categories first
UPDATE categories SET is_active = false, updated_at = NOW();

-- Show only Bridal
UPDATE categories 
SET is_active = true, updated_at = NOW()
WHERE slug = 'bridal-wedding';
```

### Example 3: Hide Multiple Collections

**SQL:**
```sql
UPDATE collections 
SET is_active = false, updated_at = NOW()
WHERE slug IN ('old-collection-1', 'old-collection-2', 'seasonal-collection');
```

---

**Last Updated**: Based on current codebase structure
**Related Files**: 
- `frontend/src/app/admin/collections/page.tsx`
- `frontend/src/app/admin/categories/page.tsx`
- `frontend/src/app/admin/types/page.tsx`
- `backend/services/collectionService.js`
- `backend/services/categoryService.js`
- `backend/services/typeService.js`





