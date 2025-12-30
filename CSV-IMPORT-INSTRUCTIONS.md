# CSV Import Instructions for Saree4ever

## Quick Start Guide

I've created sample CSV files for you to import products and variants into your store.

### Files Created:

1. **sample-products-import.csv** - 15 saree products with realistic data
2. **sample-variants-import.csv** - 37 variants (different colors for each product)

---

## Step-by-Step Import Process

### Step 1: Access Admin Panel

1. Go to your website: `http://localhost:3000` (or your production URL)
2. Navigate to **Admin** section
3. Click on **CSV Import** in the sidebar (or go to `/admin/import`)

### Step 2: Import Products First

**IMPORTANT: Always import products before variants!**

1. In the CSV Import page, select the **"Import Products"** tab
2. Click **"Choose File"**
3. Select the `sample-products-import.csv` file
4. Click **"Upload"**
5. Wait for the upload to complete
6. Review the results:
   - ✅ Success count
   - ❌ Any errors (if any)
   - 📊 Summary statistics

### Step 3: Import Variants

**After products are imported successfully:**

1. Select the **"Import Variants"** tab
2. Click **"Choose File"**
3. Select the `sample-variants-import.csv` file
4. Click **"Upload"**
5. Review the results

### Step 4: Verify Import

1. Go to **Admin > Products** page
2. You should see all 15 products listed
3. Click on any product to view its variants
4. Each product should have 2-3 color variants

---

## What's Included in Sample Data

## 🎯 SKU Auto-Generation

**Good News:** SKU codes are **completely optional**! If you leave the SKU field blank:

- **Products:** Auto-generates SKU like `CHF-RED-001`, `BAN-BLU-002`
  - Format: `[TYPE]-[COLOR]-[NUMBER]`
  - Based on product type and color

- **Variants:** Auto-generates SKU like `KAN-SILK-001-V1`, `KAN-SILK-001-V2`
  - Format: `[PRODUCT_SKU]-V[NUMBER]`
  - Increments automatically for each variant

You can:
- ✅ Leave SKU blank for auto-generation
- ✅ Provide your own custom SKU codes
- ✅ Mix both approaches (some auto, some custom)

---

### Products (15 total):
1. **Kanjivaram Pure Silk Wedding Saree** - ₹12,999 (Featured)
2. **Banarasi Silk Festive Saree** - ₹9,999 (Featured)
3. **Tussar Silk Ethnic Saree** - ₹6,999
4. **Cotton Handloom Casual Saree** - ₹2,499
5. **Georgette Party Wear Saree** - ₹4,999 (Featured)
6. **Chiffon Printed Designer Saree** - ₹3,999
7. **Patola Silk Traditional Saree** - ₹14,999 (Featured)
8. **Mysore Silk Classic Saree** - ₹8,999
9. **Linen Cotton Eco-Friendly Saree** - ₹3,499
10. **Kanjeevaram Temple Saree** - ₹15,999 (Featured)
11. **Net Embroidered Wedding Saree** - ₹8,499 (Featured)
12. **Chanderi Cotton Silk Saree** - ₹5,499
13. **Organza Floral Print Saree** - ₹4,499
14. **Bandhani Tie-Dye Saree** - ₹6,499
15. **Art Silk Budget Friendly Saree** - ₹1,999

### Variants (37 total):
- Each product has 2-4 color variants
- Stock quantities included (ranging from 2 to 25 units)
- Blouse included for premium sarees
- Realistic pricing and colors

---

## Customizing the CSV Files

### Before Importing, You Can Modify:

1. **Add/Update Categories & Collections:**
   - First, create categories/collections via Admin panel
   - Get their UUIDs from the API or database
   - Add `collection_id`, `category_id`, `type_id` columns to products CSV

   Example:
   ```csv
   name,base_price,collection_id,category_id
   My Saree,9999,a7bc5b74-5cdf-457a-acf4-79e0682b23ac,c32f1b22-6f53-437d-97e5-154df05606ef
   ```

2. **SKU Codes (Optional):**
   - **Leave blank** for auto-generation (recommended for new products)
   - Or provide custom SKU codes

   Auto-generated example:
   ```csv
   name,base_price,type_id,color,sku
   Kanjivaram Silk,,a7bc5b74...,Red,
   ```
   Will generate: `KAN-RED-001`

3. **Add Product Images:**
   - Upload images to Supabase Storage first
   - Get the public URLs
   - Add URLs to `primary_image_url` column

   Example:
   ```csv
   name,base_price,primary_image_url
   My Saree,9999,https://vyrsqtolsisgwfbiairv.supabase.co/storage/v1/object/public/products/image.jpg
   ```

4. **Adjust Prices:**
   - Modify `base_price` and `compare_at_price` as needed
   - All prices should be numbers (no currency symbols)

5. **Update Stock Quantities:**
   - Modify `stock_quantity` in variants CSV
   - Set to 0 for out-of-stock items

### SKU Auto-Generation Examples

**Products:**
- `Chiffon Saree` + Red color → `CHF-RED-001`
- `Banarasi Silk` + Blue → `BAN-BLU-001`
- `Cotton Handloom` + (no color) → `COT-GEN-001`

**Variants:**
- Product SKU `KAN-RED-001` → Variant: `KAN-RED-001-V1`, `KAN-RED-001-V2`, etc.

Leave SKU blank in your CSV and the system handles it automatically!

---

## Troubleshooting

### Common Upload Errors:

1. **"Upload Failed" or Network Error**
   - **Check admin login:** Go to `/admin/login` and ensure you're logged in
   - **Check backend:** Ensure backend is running and accessible
   - **Try again:** Refresh the page and try uploading again
   - **File size:** Keep CSV files under 5MB (split large files into smaller batches)

2. **"Authentication Error" or "Unauthorized"**
   - You must be logged in as admin to upload CSV files
   - Go to `/admin/login` and log in with admin credentials
   - The backend checks for admin role on CSV import routes

3. **CSV Format Errors:**
   - The system will show specific errors for each failed row
   - Common issues:
     - Invalid price format (use numbers only: 9999, not ₹9,999)
     - Invalid UUID for collection/category/type
     - Missing required fields (name, base_price)
     - Product not found (when importing variants)
     - Malformed CSV (check for extra commas, unescaped quotes)

4. **Download Error Report:**
   - Click "Download Error Report" button
   - Fix the errors in the CSV
   - Re-upload only the failed rows

5. **Common Fixes:**
   - Remove currency symbols (₹, $)
   - Remove commas from numbers (use 12999 not 12,999)
   - Ensure product_sku matches exactly (case-sensitive)
   - Check that products are imported before variants
   - Use UTF-8 encoding for CSV files (especially if you have special characters)
   - Escape commas in text fields by wrapping in quotes: "Text with, comma"

---

## Tips for Large Imports

1. **Start Small:**
   - Test with 5-10 products first
   - Verify they appear correctly
   - Then import the rest

2. **Use SKUs Consistently:**
   - SKUs are used to match products with variants
   - Keep them simple: `KAN-001`, `BAN-002`, etc.

3. **Batch Imports:**
   - For 100+ products, split into multiple CSV files
   - Import 50-100 products at a time

4. **Backup First:**
   - Before large imports, backup your database
   - This allows you to restore if something goes wrong

---

## Next Steps After Import

1. **Add Images:**
   - Edit each product in Admin panel
   - Upload high-quality images

2. **Assign Categories:**
   - Go to Admin > Products
   - Edit products to assign categories/collections

3. **Set Featured Products:**
   - Mark your best sellers as featured
   - They'll appear on the homepage

4. **Review & Publish:**
   - Check product pages
   - Ensure all details are correct
   - Products are active by default

---

## Need to Update Existing Products?

The CSV import system automatically:
- **Creates** new products (if SKU doesn't exist)
- **Updates** existing products (if SKU matches)

So you can:
1. Export your current products
2. Make changes in the CSV
3. Re-import to update prices, descriptions, etc.

---

## Support

If you encounter issues:
1. Check the error report for specific problems
2. Verify CSV format matches the templates
3. Test with a small sample first
4. Check the browser console for any errors

Happy importing! 🎉
