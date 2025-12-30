# Add Test Product - Quick Guide

## Method 1: Using Supabase SQL Editor (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid
   - Navigate to **SQL Editor** in the left sidebar

2. **Open the SQL File**
   - Open `docs/QUICK_INSERT_TEST_PRODUCT.sql` in your project
   - Copy the entire SQL script

3. **Run the SQL**
   - Paste into the SQL Editor
   - Click **"Run"** or press `Cmd/Ctrl + Enter`

4. **Verify the Result**
   - The query will show the inserted product and variant
   - You should see:
     - Product: "Kanjivaram Pure Silk"
     - Type: "Kanjivaram"
     - Category: "Bridal"
     - Variant: "Maroon with Blouse" (Stock: 5, Price: ₹9999)

## Method 2: Using Table Editor (Manual)

### Step 1: Create Type
1. Go to **Table Editor** → **types**
2. Click **"Insert row"**
3. Fill in:
   - Name: `Kanjivaram`
   - Slug: `kanjivaram`
   - Description: `Traditional Kanjivaram silk sarees`
   - Is Active: ✅
4. Click **"Save"**

### Step 2: Create Category
1. Go to **Table Editor** → **categories**
2. Click **"Insert row"**
3. Fill in:
   - Name: `Bridal`
   - Slug: `bridal`
   - Description: `Bridal collection sarees`
   - Is Active: ✅
4. Click **"Save"**

### Step 3: Create Product
1. Go to **Table Editor** → **products**
2. Click **"Insert row"**
3. Fill in:
   - Name: `Kanjivaram Pure Silk`
   - Slug: `kanjivaram-pure-silk`
   - Description: `Beautiful traditional Kanjivaram pure silk saree`
   - Type: Select "Kanjivaram" (from dropdown)
   - Category: Select "Bridal" (from dropdown)
   - Base Price: `9999`
   - Compare At Price: `12999`
   - SKU: `P1`
   - Is Active: ✅
   - Is Featured: ✅
4. Click **"Save"**

### Step 4: Create Variant
1. Go to **Table Editor** → **variants**
2. Click **"Insert row"**
3. Fill in:
   - Product: Select "Kanjivaram Pure Silk" (from dropdown)
   - Name: `Maroon with Blouse`
   - SKU: `V1`
   - Price: `9999`
   - Color: `Maroon`
   - Has Blouse: ✅
   - Blouse Included: ✅
   - Stock Quantity: `5`
   - Track Inventory: ✅
   - Is Active: ✅
4. Click **"Save"**

## Verify the Data

Run this query in SQL Editor to see the complete product:

```sql
SELECT 
  p.id,
  p.name as product_name,
  p.sku as product_sku,
  p.base_price,
  t.name as type,
  c.name as category,
  v.name as variant_name,
  v.color,
  v.has_blouse,
  v.blouse_included,
  v.price as variant_price,
  v.stock_quantity
FROM products p
LEFT JOIN types t ON p.type_id = t.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN variants v ON v.product_id = p.id
WHERE p.slug = 'kanjivaram-pure-silk';
```

## Expected Result

You should see:
- **Product**: Kanjivaram Pure Silk (SKU: P1)
- **Type**: Kanjivaram
- **Category**: Bridal
- **Variant**: Maroon with Blouse (SKU: V1)
- **Price**: ₹9,999
- **Stock**: 5 units
- **Blouse**: Included ✅

## Next Steps

Once the test product is added:
1. View it in the Table Editor
2. Test querying it via API
3. Add product images to the `product-media` storage bucket
4. Test the frontend product display

