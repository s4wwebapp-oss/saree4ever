# How Products Update in This E-Commerce Site

## Overview

Products in this e-commerce site can be updated through multiple methods. Here's the complete data flow:

```
Admin Panel / Database / API
  ↓
Backend API (/api/products/:id)
  ↓
Database (PostgreSQL - products table)
  ↓
Frontend API (/api/products)
  ↓
Storefront Pages (Homepage, Collections, Search, etc.)
```

---

## Product Update Methods

### Method 1: Admin Panel (Primary Method) ✅

**Location:** `http://localhost:3000/admin/products/[id]/edit`

**How it works:**
1. Admin logs in at `/admin` (password-based auth in dev mode)
2. Navigates to Products section (`/admin/products`)
3. Clicks "Edit" on any product in the list
4. Updates product details in the edit form
5. Saves changes
6. Product updates in database via `PUT /api/products/:id`
7. Changes reflect on storefront immediately

**What can be updated:**
- ✅ Product Name, Description, SKU
- ✅ Base Price, Compare At Price, MRP
- ✅ Product Attributes: Color, Weave, Length (meters), Blouse Included
- ✅ Subcategories (comma-separated)
- ✅ Collections (multiple selection)
- ✅ Categories (multiple selection)
- ✅ Types/Fabrics (multiple selection)
- ✅ Featured status
- ✅ Active/Inactive status

**Files:**
- Admin UI: `frontend/src/app/admin/products/[id]/edit/page.tsx`
- API Route: `backend/routes/products.js` (PUT /api/products/:id)
- Service: `backend/services/productService.js` (updateProduct)

---

### Method 2: Direct Database Update (Quick Fixes)

**Connect to Supabase:**
- Use Supabase Dashboard SQL Editor
- Or connect via psql if configured

**Update product:**
```sql
-- Update product name and price
UPDATE products 
SET name = 'New Product Name',
    base_price = 5000.00,
    updated_at = now()
WHERE id = 'product-uuid-here';

-- Update taxonomy attributes
UPDATE products 
SET color = 'Red',
    weave = 'Kanjivaram weave',
    length_m = 5.5,
    blouse_included = true,
    mrp = 6000.00,
    subcategories = ARRAY['Pure Silk', 'Handloom']
WHERE id = 'product-uuid-here';

-- Update stock (via variants)
UPDATE variants 
SET stock_quantity = 50 
WHERE product_id = 'product-uuid-here';

-- Update featured status
UPDATE products 
SET is_featured = true 
WHERE id = 'product-uuid-here';
```

---

### Method 3: API Direct Update (Programmatic)

**Endpoint:** `PUT /api/products/:id`

**Requires:** Admin authentication (JWT token in Authorization header)

**Example:**
```bash
curl -X PUT http://localhost:5001/api/products/product-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Updated Product Name",
    "base_price": 5000,
    "mrp": 6000,
    "description": "New description",
    "color": "Red",
    "weave": "Kanjivaram weave",
    "length_m": 5.5,
    "blouse_included": true,
    "subcategories": ["Pure Silk", "Handloom"],
    "collection_ids": ["collection-uuid-1", "collection-uuid-2"],
    "category_ids": ["category-uuid-1"],
    "type_ids": ["type-uuid-1", "type-uuid-2"]
  }'
```

**Note:** The API automatically handles:
- Junction table updates (collections, categories, types)
- Slug regeneration if name changes
- `updated_at` timestamp
- All taxonomy fields

---

### Method 4: CSV Import (Bulk Updates)

**Location:** `http://localhost:3000/admin/import`

**How it works:**
1. Prepare CSV file with product data
2. Upload CSV in admin panel
3. System validates and processes
4. Products updated/created in bulk
5. Import log created with results

**CSV Format:**
```csv
sku,name,description,base_price,mrp,color,weave,length_m,blouse_included
SAREE-001,Product Name,Description,5000,6000,Red,Kanjivaram weave,5.5,true
SAREE-002,Another Product,Desc,3000,3500,Blue,Cotton,6.0,false
```

**Files:**
- Admin UI: `frontend/src/app/admin/import/page.tsx` (to be created)
- API Route: `backend/routes/csv-import.js`
- Service: `backend/services/csvImportService.js`

---

## Product Update Flow

### Step-by-Step Process

1. **Admin Makes Change**
   - Updates product in admin panel
   - Or updates database directly
   - Or imports CSV

2. **Backend Processes**
   - Validates data
   - Updates `products` table
   - Updates related tables (categories, types, images, variants)
   - Updates `updated_at` timestamp

3. **Database Updated**
   - Product record updated
   - Related data updated
   - Changes committed

4. **Frontend Reflects Changes**
   - Storefront fetches from `/api/products`
   - API queries updated database
   - New data displayed
   - No cache (or cache invalidated)

---

## Where Products Are Displayed

### Storefront Pages (Auto-Update)

1. **Homepage** (`/`)
   - Featured products
   - New arrivals
   - Fetches from `/api/products?featured=true`

2. **Product Detail** (`/product/[id]`)
   - Single product view
   - Fetches from `/api/products/:id`

3. **Collections** (`/collections/[slug]`)
   - Products in collection
   - Fetches from `/api/products?collection=slug`

4. **Categories** (`/categories/[slug]`)
   - Products by category
   - Fetches from `/api/products?category=slug`

5. **Types** (`/types/[slug]`)
   - Products by fabric type
   - Fetches from `/api/products?type=slug`

6. **Search** (`/search`)
   - Search results
   - Fetches from `/api/products?search=query`

---

## Product Update API Endpoints

### Admin Endpoints (Protected - Requires Authentication)

**Create Product:**
```
POST /api/products
Headers: { Authorization: Bearer TOKEN }
Body: { 
  name, description, base_price, mrp, sku,
  color, weave, length_m, blouse_included, subcategories,
  collection_ids[], category_ids[], type_ids[],
  is_featured, is_active
}
```

**Update Product:**
```
PUT /api/products/:id
Headers: { Authorization: Bearer TOKEN }
Body: { 
  name, description, base_price, mrp, sku,
  color, weave, length_m, blouse_included, subcategories,
  collection_ids[], category_ids[], type_ids[],
  is_featured, is_active
}
```

**Update Product Status:**
```
PATCH /api/products/:id/status
Headers: { Authorization: Bearer TOKEN }
Body: { is_active: boolean, is_featured: boolean }
```

**Delete Product:**
```
DELETE /api/products/:id
Headers: { Authorization: Bearer TOKEN }
```

**Get Product by ID:**
```
GET /api/products/id/:id
```

### Public Endpoints

**Get All Products:**
```
GET /api/products?featured=true&limit=10
GET /api/products?collection=slug
GET /api/products?category=slug
GET /api/products?type=slug
GET /api/products?collections=slug1,slug2
GET /api/products?categories=slug1,slug2
GET /api/products?types=slug1,slug2
GET /api/products?search=query
GET /api/products?minPrice=1000&maxPrice=50000
GET /api/products?sortBy=price-low
```

**Get Single Product:**
```
GET /api/products/:slug
GET /api/products/id/:id
```

---

## Product Data Structure

### Database Tables

1. **products** - Main product data
   - id, sku, name, slug, description, long_description
   - base_price, compare_at_price, mrp
   - color, weave, length_m, blouse_included, subcategories[]
   - primary_image_url, image_urls[]
   - is_featured, is_active
   - display_order, tags[]
   - meta_title, meta_description
   - created_at, updated_at

2. **variants** - Product variants/stock
   - id, product_id, name, sku
   - stock_quantity, track_inventory
   - price (optional, overrides product price)
   - is_active

3. **product_collections** - Collection assignments (Many-to-Many)
   - id, product_id, collection_id, display_order

4. **product_categories** - Category assignments (Many-to-Many)
   - id, product_id, category_id, display_order

5. **product_types** - Type/fabric assignments (Many-to-Many)
   - id, product_id, type_id, display_order

6. **collections** - Product collections
   - id, name, slug, description, is_active

7. **categories** - Product categories
   - id, name, slug, description, icon, is_active

8. **types** - Fabric/types
   - id, name, slug, description, is_active

---

## Real-Time Update Behavior

### Immediate Updates

✅ **Admin Panel** - Changes save immediately
✅ **Database** - Updates committed immediately
✅ **API** - Returns updated data immediately
✅ **Storefront** - Shows updates on next page load/refresh

### Caching (If Implemented)

If Redis caching is enabled:
- Product cache invalidated on update
- New data fetched on next request
- Cache refreshed automatically

---

## Update Examples

### Example 1: Update Product Price

**Via Admin Panel:**
1. Go to `/admin/products`
2. Click "Edit" on product
3. Change price field
4. Click "Save"
5. Price updated everywhere

**Via Database:**
```sql
UPDATE products SET price = 4500.00 WHERE sku = 'SAREE-001';
```

**Via API:**
```bash
curl -X PUT http://localhost:3000/api/admin/products/product-id \
  -H "Authorization: Bearer TOKEN" \
  -d '{"price": 4500}'
```

### Example 2: Update Stock

**Via Admin Panel:**
1. Go to `/admin/inventory`
2. Find product
3. Edit stock inline
4. Save
5. Stock updated

**Via Database:**
```sql
UPDATE product_variants 
SET stock = 25 
WHERE product_id = 'product-uuid';
```

### Example 3: Add Product Images

**Via Admin Panel:**
1. Go to product edit page
2. Click "Upload Images"
3. Select image files
4. Images uploaded to server
5. Images saved to database
6. Product displays new images

**Via Database:**
```sql
INSERT INTO product_images (product_id, url, is_primary)
VALUES ('product-uuid', '/uploads/image.jpg', true);
```

---

## File Locations

### Backend
- **Product Routes:** `backend/routes/products.js`
- **Product Controller:** `backend/controllers/productController.js`
- **Product Service:** `backend/services/productService.js`
- **Database Schema:** `backend/migrations/create_taxonomy_schema.sql`
- **CSV Import:** `backend/routes/csv-import.js`
- **CSV Import Service:** `backend/services/csvImportService.js`

### Frontend
- **Admin Product Editor:** `frontend/src/app/admin/products/[id]/edit/page.tsx` ✅
- **Admin Product Create:** `frontend/src/app/admin/products/page.tsx`
- **Admin Product List:** `frontend/src/app/admin/products/list/page.tsx`
- **Inventory Management:** `frontend/src/app/admin/inventory/page.tsx`
- **CSV Import:** `frontend/src/app/admin/import/page.tsx` (to be created)
- **Product Detail:** `frontend/src/app/product/[slug]/page.tsx`
- **Homepage:** `frontend/src/app/page.tsx`

### API Client
- **API Helper:** `frontend/src/lib/api.ts`
  - `api.products.update(id, data)` - Update product
  - `api.products.getById(id)` - Get product by ID
  - `api.products.create(data)` - Create product

---

## Testing Product Updates

### 1. Test Admin Update via UI
1. Start backend: `cd backend && npm run dev` (port 5001)
2. Start frontend: `cd frontend && npm run dev` (port 3000)
3. Visit: `http://localhost:3000/admin`
4. Login with password (from `NEXT_PUBLIC_ADMIN_PASSWORD`)
5. Go to Products → Click "Edit" on any product
6. Update fields and save
7. Verify changes on storefront

### 2. Test Admin Update via API
```bash
# Get admin token (if auth is implemented)
# For now, admin routes use simple password check

# Update product
curl -X PUT http://localhost:5001/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "base_price": 5000,
    "color": "Red",
    "weave": "Kanjivaram weave"
  }'
```

### 3. Verify Update
```bash
# Check product
curl http://localhost:5001/api/products/id/PRODUCT_ID
# or by slug
curl http://localhost:5001/api/products/product-slug
```

### 4. Check Storefront
- Visit: `http://localhost:3000/product/product-slug`
- Verify changes are displayed

---

## Common Update Scenarios

### Scenario 1: Price Change
**Impact:** All product listings, cart, checkout
**Update Time:** Immediate
**Method:** Admin panel (`/admin/products/[id]/edit`) or database
**Fields:** `base_price`, `compare_at_price`, `mrp`

### Scenario 2: Stock Update
**Impact:** Product availability, add to cart
**Update Time:** Immediate
**Method:** Admin inventory page (`/admin/inventory`) or database
**Table:** `variants.stock_quantity`

### Scenario 3: Add New Product
**Impact:** Appears in listings, search, collections, categories, types
**Update Time:** Immediate
**Method:** Admin panel (`/admin/products?action=create`), CSV import, or database
**Includes:** All taxonomy fields, multiple categories/types/collections

### Scenario 4: Update Taxonomy
**Impact:** Category pages, type pages, filters, search
**Update Time:** Immediate
**Method:** Admin panel product editor
**Fields:** `collection_ids[]`, `category_ids[]`, `type_ids[]`, `color`, `weave`, `length_m`, `blouse_included`, `subcategories[]`

### Scenario 5: Update Product Attributes
**Impact:** Product detail page, filters, search
**Update Time:** Immediate
**Method:** Admin panel product editor
**Fields:** `color`, `weave`, `length_m`, `blouse_included`, `mrp`, `subcategories[]`

---

## Summary

**Products update through:**
1. ✅ **Admin Panel** - Primary method (easiest)
   - Edit page: `/admin/products/[id]/edit`
   - Create page: `/admin/products?action=create`
   - List page: `/admin/products`
2. ✅ **Database** - Direct SQL updates (Supabase SQL Editor)
3. ✅ **API** - Programmatic updates (`PUT /api/products/:id`)
4. ✅ **CSV Import** - Bulk updates (`/admin/import`)

**Updates are:**
- ✅ Immediate (no delay)
- ✅ Reflected everywhere (homepage, collections, categories, types, search)
- ✅ Persistent (saved to database)
- ✅ Real-time (no cache blocking)
- ✅ Supports all taxonomy fields (color, weave, length, blouse, mrp, subcategories)
- ✅ Supports multiple categories/types/collections via junction tables

**To update a product:**
1. Use admin panel at `/admin/products` → Click "Edit"
2. Or update via API: `PUT /api/products/:id`
3. Or update database directly via Supabase SQL Editor
4. Refresh storefront to see changes
5. No code deployment needed!

**Implementation Status:**
- ✅ Backend update endpoint: `PUT /api/products/:id`
- ✅ Frontend edit page: `/admin/products/[id]/edit`
- ✅ Database schema: All fields supported
- ✅ Taxonomy support: Full (categories, types, collections, attributes)
- ✅ Junction tables: Many-to-many relationships working

