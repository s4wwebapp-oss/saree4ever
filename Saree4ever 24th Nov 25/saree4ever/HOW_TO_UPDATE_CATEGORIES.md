# How to Update the "Shop by Category" Section

## Overview

The "Shop by Category" section is dynamically loaded from the database. Here's how the data flows:

```
Database (PostgreSQL) 
  ↓
Backend API (/api/taxonomy/categories)
  ↓
Frontend (pages/index.js)
  ↓
Displayed on Homepage
```

---

## How It Works

### 1. **Database Structure**

Categories are stored in the `categories` table with these fields:
- `id` - Unique identifier
- `slug` - URL-friendly identifier (e.g., 'bridal-wedding')
- `name` - Display name (e.g., 'Bridal / Wedding')
- `description` - Category description
- `image_url` - Model image URL
- `display_order` - Order for sorting
- `icon` - Optional icon
- `created_at` / `updated_at` - Timestamps

### 2. **Backend API**

**Endpoint:** `GET /api/taxonomy/categories`

**Location:** `backend/src/routes/taxonomy.ts`

**What it does:**
- Queries all categories from database
- Orders by `display_order` and `name`
- Returns JSON with all category data including `image_url`

### 3. **Frontend Display**

**Location:** `nextjs-saree4sure/pages/index.js`

**How it works:**
1. Fetches categories from `/api/taxonomy/categories` on page load
2. Displays first 8 categories in a grid
3. Each card shows:
   - Model image (from `image_url`)
   - Category name
   - Description
   - "Explore →" link

---

## How to Update Categories

### Method 1: Direct Database Update (Quick)

```sql
-- Update category name
UPDATE categories 
SET name = 'New Category Name' 
WHERE slug = 'bridal-wedding';

-- Update description
UPDATE categories 
SET description = 'New description text' 
WHERE slug = 'bridal-wedding';

-- Update image
UPDATE categories 
SET image_url = 'https://your-new-image-url.com/image.jpg' 
WHERE slug = 'bridal-wedding';

-- Change display order
UPDATE categories 
SET display_order = 1 
WHERE slug = 'bridal-wedding';
```

### Method 2: Using Migration Script (Recommended)

**File:** `backend/src/db/migrate-category-images.ts`

You can create a new migration script:

```typescript
// Example: Update specific category
await pool.query(
  `UPDATE categories 
   SET image_url = $1, description = $2 
   WHERE slug = $3`,
  [
    'https://new-image-url.com/image.jpg',
    'Updated description',
    'bridal-wedding'
  ]
);
```

### Method 3: Add New Category

```sql
INSERT INTO categories (slug, name, description, image_url, display_order)
VALUES (
  'new-category-slug',
  'New Category Name',
  'Category description',
  'https://image-url.com/model.jpg',
  0
);
```

Or update the seed file: `backend/src/db/seed-taxonomy.ts`

### Method 4: Admin Panel (Future Enhancement)

Currently, categories are managed via database. You can add an admin interface to:
- Create/edit/delete categories
- Upload images
- Set display order
- Update descriptions

---

## Updating Images

### Current Image URLs

All images are stored as URLs in the `image_url` column. Current images use Unsplash:

- **Bridal / Wedding:** `https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&h=1000&q=90`
- **Festive / Celebration:** `https://images.unsplash.com/photo-1610030488171-3ef53b90aa19?auto=format&fit=crop&w=800&h=1000&q=90`
- And so on...

### To Update Images:

1. **Upload to your server/CDN:**
   ```sql
   UPDATE categories 
   SET image_url = '/uploads/categories/bridal-model.jpg' 
   WHERE slug = 'bridal-wedding';
   ```

2. **Use external URLs:**
   ```sql
   UPDATE categories 
   SET image_url = 'https://your-cdn.com/bridal-model.jpg' 
   WHERE slug = 'bridal-wedding';
   ```

3. **Use the migration script:**
   ```bash
   cd backend
   npm run migrate:category-images
   ```

---

## Frontend Display Logic

### Current Implementation

```javascript
// Fetches categories on page load
useEffect(() => {
  fetch('/api/taxonomy/categories')
    .then(r => r.json())
    .then(data => setCategories(data.categories || []))
    .catch(console.error);
}, []);

// Displays first 8 categories
{categories.slice(0, 8).map((category) => (
  <Link href={`/categories/${category.slug}`}>
    <img src={category.image_url} alt={category.name} />
    <h3>{category.name}</h3>
    <p>{category.description}</p>
  </Link>
))}
```

### To Change Display:

1. **Show more/fewer categories:**
   ```javascript
   {categories.slice(0, 12).map(...)} // Show 12 instead of 8
   ```

2. **Change grid layout:**
   ```javascript
   // Current: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
   // Change to: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   ```

3. **Filter categories:**
   ```javascript
   {categories
     .filter(cat => cat.display_order > 0)
     .slice(0, 8)
     .map(...)}
   ```

---

## Quick Update Commands

### Update Single Category Image

```bash
# Connect to database
psql -U your_user -d saree4ever

# Update image
UPDATE categories 
SET image_url = 'https://new-url.com/image.jpg' 
WHERE slug = 'bridal-wedding';
```

### Re-seed All Categories

```bash
cd backend
npm run seed:taxonomy
```

### Run Migration

```bash
cd backend
npm run migrate:category-images
```

---

## Testing Updates

1. **Check API response:**
   ```bash
   curl http://localhost:3000/api/taxonomy/categories
   ```

2. **Verify in browser:**
   - Visit: http://localhost:5001
   - Scroll to "Shop by Category" section
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to clear cache

3. **Check database:**
   ```sql
   SELECT slug, name, image_url FROM categories;
   ```

---

## File Locations

- **Database Schema:** `backend/src/db/schema-taxonomy.sql`
- **Seed Data:** `backend/src/db/seed-taxonomy.ts`
- **Migration:** `backend/src/db/migrate-category-images.ts`
- **API Route:** `backend/src/routes/taxonomy.ts`
- **Frontend Display:** `nextjs-saree4sure/pages/index.js`

---

## Summary

**To update the "Shop by Category" section:**

1. **Update database** → Changes appear automatically
2. **Refresh browser** → New data loads from API
3. **No code changes needed** → Frontend is dynamic

The section automatically reflects any database changes because it fetches data on every page load!

