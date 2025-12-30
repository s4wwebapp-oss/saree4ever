# Complete Guide: How to Add Your Products

This guide explains **3 different methods** to add products to your Saree4ever store. Choose the method that works best for you!

---

## 📋 Table of Contents
1. [Method 1: Admin Panel (One-by-One)](#method-1-admin-panel-one-by-one)
2. [Method 2: CSV Bulk Import (Recommended for Many Products)](#method-2-csv-bulk-import-recommended)
3. [Method 3: Using API (For Developers)](#method-3-using-api-for-developers)
4. [Getting Collection/Category/Type IDs](#getting-ids)
5. [Product Structure Explained](#product-structure)

---

## Method 1: Admin Panel (One-by-One) ⭐ Easiest for Few Products

### Step 1: Access Admin Panel
1. Open your browser and go to: `http://localhost:3000/admin/products` (or your deployed URL)
2. Login with your admin credentials
3. Click **"Add New Product"** button

### Step 2: Fill Product Information

**Required Fields:**
- **Name**: Product name (e.g., "Kanjivaram Pure Silk Saree")
- **Base Price**: Selling price (e.g., `9999.00`)

**Optional but Recommended:**
- **Description**: Short product description
- **Long Description**: Detailed product information (supports HTML)
- **SKU**: Unique product code (e.g., `KAN-PURE-001`)
- **Compare At Price**: Original/MRP price (e.g., `12999.00`)
- **Collections**: Select one or more collections
- **Categories**: Select one or more categories
- **Types**: Select one or more types/fabrics
- **Primary Image URL**: Main product image URL
- **Image URLs**: Additional product images (one per line)
- **Tags**: Comma-separated tags (e.g., `silk,bridal,wedding`)
- **Is Featured**: Check if product should be featured
- **Is Active**: Check to make product visible to customers

### Step 3: Add Variants (Colors/Sizes)
After creating the product, you can add variants:
1. Go to the product's detail/edit page
2. Click **"Add Variant"**
3. Fill in:
   - **Name**: Variant name (e.g., "Maroon with Blouse")
   - **SKU**: Variant SKU (e.g., `KAN-PURE-MAR-001`)
   - **Price**: Variant price (optional, defaults to product price)
   - **Color**: Color name (e.g., "Maroon")
   - **Stock Quantity**: Available quantity
   - **Has Blouse**: Check if variant includes blouse
   - **Blouse Included**: Check if blouse is included in price
   - **Image URL**: Variant-specific image

### Step 4: Save
Click **"Save"** or **"Create Product"** button

---

## Method 2: CSV Bulk Import (Recommended) ⭐ Best for Many Products

This is the fastest way to add multiple products at once!

### Step 1: Prepare Your CSV File

Create a CSV file with your product data. Download the template or create one with these columns:

#### Products CSV Template

```csv
name,base_price,sku,description,collection_id,category_id,type_id,compare_at_price,primary_image_url,image_urls,tags,is_featured
Kanjivaram Pure Silk,9999.00,KAN-001,Beautiful traditional saree,uuid-here,uuid-here,uuid-here,12999.00,https://example.com/image1.jpg,"https://example.com/img1.jpg,https://example.com/img2.jpg","silk,bridal",true
Banarasi Silk,8999.00,BAN-001,Elegant Banarasi design,uuid-here,uuid-here,uuid-here,11999.00,https://example.com/image2.jpg,"https://example.com/img3.jpg","silk,festive",false
Cotton Handloom,2500.00,COT-001,Comfortable cotton saree,uuid-here,uuid-here,uuid-here,3000.00,https://example.com/image3.jpg,"https://example.com/img4.jpg","cotton,daily-wear",false
```

**Column Descriptions:**
- `name` ⚠️ **Required**: Product name
- `base_price` ⚠️ **Required**: Selling price (number)
- `sku`: Product SKU code (unique identifier)
- `description`: Short description
- `collection_id`: Collection UUID (see [Getting IDs](#getting-ids))
- `category_id`: Category UUID
- `type_id`: Type UUID
- `compare_at_price`: Original/MRP price
- `primary_image_url`: Main image URL
- `image_urls`: Multiple image URLs separated by commas (wrap in quotes)
- `tags`: Comma-separated tags
- `is_featured`: `true`/`false` or `1`/`0`

#### Variants CSV Template (Add After Products)

```csv
product_sku,name,sku,price,color,has_blouse,blouse_included,stock_quantity,image_url
KAN-001,Maroon with Blouse,KAN-001-MAR,9999.00,Maroon,true,true,15,https://example.com/variant1.jpg
KAN-001,Red with Blouse,KAN-001-RED,9999.00,Red,true,true,10,https://example.com/variant2.jpg
KAN-001,Blue without Blouse,KAN-001-BLU,8999.00,Blue,false,false,20,https://example.com/variant3.jpg
BAN-001,Green with Blouse,BAN-001-GRN,8999.00,Green,true,true,12,https://example.com/variant4.jpg
```

**Column Descriptions:**
- `product_sku` ⚠️ **Required**: Product SKU (links variant to product)
- `name` ⚠️ **Required**: Variant name
- `sku`: Variant SKU (unique)
- `price`: Variant price (optional, defaults to product price)
- `color`: Color name
- `has_blouse`: `true`/`false` or `1`/`0`
- `blouse_included`: `true`/`false` or `1`/`0`
- `stock_quantity`: Available quantity (number)
- `image_url`: Variant image URL

### Step 2: Get Collection/Category/Type IDs

You need UUIDs for `collection_id`, `category_id`, and `type_id`. Use one of these methods:

**Option A: Using Admin Panel**
1. Go to `http://localhost:3000/admin/collections` (or categories/types)
2. View source or use browser inspector to see IDs

**Option B: Using API**
```bash
# Get all collections
curl http://localhost:5001/api/collections

# Get all categories
curl http://localhost:5001/api/categories

# Get all types
curl http://localhost:5001/api/types
```

**Option C: Using Database (Supabase SQL Editor)**
```sql
-- Get collections with IDs
SELECT id, name, slug FROM collections;

-- Get categories with IDs
SELECT id, name, slug FROM categories;

-- Get types with IDs
SELECT id, name, slug FROM types;
```

### Step 3: Upload CSV File

1. Go to Admin Panel: `http://localhost:3000/admin/import`
2. Select **"Products"** tab
3. Click **"Choose File"** and select your CSV file
4. Click **"Upload and Import"**
5. Wait for processing - you'll see a report showing:
   - ✅ How many products were created/updated
   - ❌ Any errors with row numbers
   - 📊 Success rate

### Step 4: Upload Variants (If Needed)

1. Stay on the same import page
2. Select **"Variants"** tab
3. Upload your variants CSV file
4. Review the import report

### Step 5: Review and Fix Errors

If there are errors:
1. Download the error report CSV
2. Fix the errors (usually missing required fields or invalid UUIDs)
3. Re-upload the fixed CSV

---

## Method 3: Using API (For Developers) 🔧

If you want to programmatically add products, use the API:

### Create Product Endpoint

```bash
POST /api/products
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Kanjivaram Pure Silk",
  "description": "Beautiful traditional saree",
  "base_price": 9999.00,
  "compare_at_price": 12999.00,
  "sku": "KAN-001",
  "collection_ids": ["collection-uuid-1", "collection-uuid-2"],
  "category_ids": ["category-uuid-1"],
  "type_ids": ["type-uuid-1"],
  "primary_image_url": "https://example.com/image.jpg",
  "image_urls": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "tags": ["silk", "bridal", "wedding"],
  "is_featured": true,
  "is_active": true
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Kanjivaram Pure Silk",
    "base_price": 9999.00,
    "sku": "KAN-001",
    "collection_ids": ["uuid-here"],
    "category_ids": ["uuid-here"],
    "type_ids": ["uuid-here"]
  }'
```

### Add Variant Endpoint

```bash
POST /api/products/:product_id/variants
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Maroon with Blouse",
  "sku": "KAN-001-MAR",
  "price": 9999.00,
  "color": "Maroon",
  "has_blouse": true,
  "blouse_included": true,
  "stock_quantity": 15,
  "image_url": "https://example.com/variant.jpg"
}
```

---

## Getting Collection/Category/Type IDs {#getting-ids}

You need UUIDs (like `550e8400-e29b-41d4-a716-446655440000`) to link products to collections, categories, and types.

### Method 1: Admin Panel UI
1. Navigate to:
   - Collections: `/admin/collections`
   - Categories: `/admin/categories`
   - Types: `/admin/types`
2. Open browser developer tools (F12)
3. View page source or network requests to find IDs

### Method 2: API Calls
```bash
# Get all collections
curl http://localhost:5001/api/collections | jq

# Get all categories
curl http://localhost:5001/api/categories | jq

# Get all types
curl http://localhost:5001/api/types | jq
```

### Method 3: Database Query
If you have access to Supabase:
```sql
-- Collections
SELECT id, name, slug FROM collections WHERE is_active = true;

-- Categories
SELECT id, name, slug FROM categories WHERE is_active = true;

-- Types
SELECT id, name, slug FROM types WHERE is_active = true;
```

---

## Product Structure Explained {#product-structure}

### Products vs Variants

**Product** = The main item (e.g., "Kanjivaram Pure Silk Saree")
- Has base price, description, images
- Belongs to collections, categories, types
- Can be featured

**Variant** = Specific version of the product (e.g., "Maroon with Blouse", "Red without Blouse")
- Has color, size, price (optional)
- Has stock quantity
- Has variant-specific image

### Example Structure:
```
Product: Kanjivaram Pure Silk Saree
├── Variant 1: Maroon with Blouse (15 in stock)
├── Variant 2: Red with Blouse (10 in stock)
└── Variant 3: Blue without Blouse (20 in stock)
```

### Important Fields:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Product name |
| `base_price` | ✅ Yes | Selling price |
| `sku` | ❌ No | Unique product code (recommended) |
| `description` | ❌ No | Short description |
| `collection_ids` | ❌ No | Array of collection UUIDs |
| `category_ids` | ❌ No | Array of category UUIDs |
| `type_ids` | ❌ No | Array of type UUIDs |
| `is_featured` | ❌ No | Show on homepage (true/false) |
| `is_active` | ❌ No | Visible to customers (true/false, default: true) |

---

## 📝 Quick Tips

1. **Start Small**: Test with 1-2 products first
2. **Use CSV for Bulk**: If you have 10+ products, CSV import is much faster
3. **Get IDs First**: Before creating CSV, get all collection/category/type IDs
4. **Check Errors**: CSV import shows detailed error reports - fix and re-upload
5. **Add Variants**: Products without variants won't have stock - add variants for inventory tracking
6. **Image URLs**: Make sure image URLs are publicly accessible
7. **SKU Format**: Use consistent SKU format (e.g., `KAN-001`, `BAN-001`)

---

## 🆘 Troubleshooting

### CSV Import Errors

**Error: "Collection ID not found"**
- Check that the UUID exists in the collections table
- Make sure UUID format is correct (36 characters with hyphens)

**Error: "Base price must be a number"**
- Ensure price columns contain only numbers (e.g., `9999.00`, not `₹9,999`)

**Error: "Product name is required"**
- Check that `name` column exists and has no empty rows

**Error: "Invalid UUID format"**
- UUIDs must be in format: `550e8400-e29b-41d4-a716-446655440000`
- Make sure there are no extra spaces

### Admin Panel Issues

**Can't see "Add Product" button**
- Make sure you're logged in as admin
- Check URL: `/admin/products` not `/admin/product`

**Images not showing**
- Verify image URLs are publicly accessible
- Check URL format (must start with `http://` or `https://`)

---

## 📚 Additional Resources

- **CSV Templates**: See `backend/docs/CSV_TEMPLATES.md`
- **Full CSV Guide**: See `backend/docs/CSV_IMPORT_GUIDE.md`
- **API Documentation**: See `backend/API_DOCUMENTATION.md`
- **Product Update Guide**: See `HOW_PRODUCTS_UPDATE.md`

---

## ✅ Next Steps

After adding products:
1. ✅ Verify products appear in admin panel
2. ✅ Check products show on frontend
3. ✅ Add product images
4. ✅ Set featured products for homepage
5. ✅ Add variants with stock quantities
6. ✅ Test product pages on frontend

---

**Need Help?** Check the error messages in the CSV import report or admin panel - they usually tell you exactly what's wrong!


