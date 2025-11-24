# CSV Import Guide

## Overview

The CSV import system allows admins to bulk upload products, variants, and stock updates. It validates each row, processes valid data, and provides detailed error reports for failed rows.

## Process Flow

### Step 1: Read CSV
- CSV file is uploaded via API
- File is parsed row by row
- Headers are automatically detected

### Step 2: Validate Each Row
- Each row is validated against business rules
- Validation errors are collected
- Invalid rows are skipped (not processed)

### Step 3: Add or Update Products/Variants
- If item exists (by SKU/slug), it's **updated**
- If item doesn't exist, it's **created**
- Stock is updated if applicable

### Step 4: Send Back Report
- Success count (imported/updated)
- Failure count
- List of errors with row numbers
- Success rate percentage

### Step 5: Save Errors for Re-upload
- Error report CSV is generated
- Contains original data + error messages
- Admin can download, fix, and re-upload

## CSV Formats

### Products CSV

**Required Columns:**
- `name` or `title` - Product name
- `base_price` - Base price (number)

**Optional Columns:**
- `sku` - Product SKU (for update matching)
- `description` - Short description
- `long_description` - Long description
- `collection_id` - Collection UUID
- `category_id` - Category UUID
- `type_id` - Type UUID
- `compare_at_price` - Compare at price
- `primary_image_url` - Main image URL
- `image_urls` - Comma-separated image URLs
- `tags` - Comma-separated tags
- `is_featured` - true/false or 1/0
- `meta_title` - SEO title
- `meta_description` - SEO description

**Example:**
```csv
name,base_price,sku,collection_id,category_id,type_id,description
Kanjivaram Pure Silk,9999.00,P1,uuid,uuid,uuid,Beautiful traditional saree
Banarasi Silk,8999.00,P2,uuid,uuid,uuid,Elegant Banarasi design
```

### Variants CSV

**Required Columns:**
- `product_id` or `product_sku` or `product_slug` - Product identifier
- `name` - Variant name

**Optional Columns:**
- `sku` - Variant SKU (for update matching)
- `price` - Variant price
- `compare_at_price` - Compare at price
- `color` - Color name
- `has_blouse` - true/false or 1/0
- `blouse_included` - true/false or 1/0
- `size` - Size
- `image_url` - Variant image
- `stock_quantity` - Stock quantity (number)
- `track_inventory` - true/false or 1/0

**Example:**
```csv
product_sku,name,sku,price,color,has_blouse,stock_quantity
P1,Maroon with Blouse,V1,9999.00,Maroon,true,5
P1,Red with Blouse,V2,9999.00,Red,true,3
P2,Blue without Blouse,V3,8999.00,Blue,false,10
```

### Stock CSV

**Required Columns:**
- `variant_id` or `sku` - Variant identifier
- `stock_quantity` - New stock quantity

**Optional Columns:**
- `current_stock` - Current stock (for adjustment calculation)
- `update_method` - "set" (absolute) or "adjust" (relative)

**Example:**
```csv
sku,stock_quantity,current_stock,update_method
V1,10,5,set
V2,8,3,adjust
V3,15,,set
```

## API Endpoints

### Import Products
```http
POST /api/csv-import/products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Request:**
- Form field: `file` (CSV file)

**Response:**
```json
{
  "message": "Product import completed",
  "summary": {
    "total_rows": 100,
    "imported": 85,
    "updated": 10,
    "failed": 5,
    "success_rate": "95.0%"
  },
  "successes": [
    {
      "row": 2,
      "product_id": "uuid",
      "product_name": "Kanjivaram Pure Silk",
      "action": "created"
    }
  ],
  "errors": [
    {
      "row": 15,
      "data": {
        "name": "Product Name",
        "base_price": "invalid"
      },
      "errors": ["Base price must be a number"],
      "type": "validation"
    }
  ],
  "error_report_url": "/uploads/product-import-errors-1234567890.csv",
  "has_more_errors": false,
  "has_more_successes": true
}
```

### Import Variants
```http
POST /api/csv-import/variants
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Import Stock
```http
POST /api/csv-import/stock
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Import Offers
```http
POST /api/csv-import/offers
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

## Error Report

When errors occur, a CSV file is generated with:
- All original columns
- `error_message` column (all errors for that row)
- `error_type` column (validation/processing)

**Admin can:**
1. Download the error report
2. Fix the errors in the CSV
3. Re-upload the fixed CSV

## Validation Rules

### Products
- ✅ Name/title required
- ✅ Base price required and must be number
- ✅ Collection/Category/Type IDs must be valid UUIDs
- ✅ SKU must be unique (if provided)

### Variants
- ✅ Product identifier required (id/sku/slug)
- ✅ Variant name required
- ✅ Price must be number (if provided)
- ✅ Stock quantity must be number (if provided)
- ✅ Product must exist

### Stock
- ✅ Variant identifier required (id/sku)
- ✅ Stock quantity required and must be number
- ✅ Variant must exist

## Best Practices

1. **Test with small CSV first** (10-20 rows)
2. **Check error report** before fixing and re-uploading
3. **Use SKU for updates** - More reliable than names
4. **Validate UUIDs** before uploading
5. **Backup database** before large imports
6. **Process in batches** for very large files (1000+ rows)

## Example Workflow

```bash
# 1. Upload products CSV
curl -X POST http://localhost:5001/api/csv-import/products \
  -H "Authorization: Bearer <token>" \
  -F "file=@products.csv"

# 2. Check response for errors
# Response shows: 95 imported, 5 failed

# 3. Download error report
curl http://localhost:5001/uploads/product-import-errors-1234567890.csv

# 4. Fix errors in CSV
# Edit the downloaded CSV file

# 5. Re-upload fixed CSV
curl -X POST http://localhost:5001/api/csv-import/products \
  -H "Authorization: Bearer <token>" \
  -F "file=@products-fixed.csv"
```

## Error Types

### Validation Errors
- Missing required fields
- Invalid data types
- Invalid UUIDs
- Business rule violations

### Processing Errors
- Database errors
- Foreign key violations
- Duplicate constraints
- Network/timeout errors

## Tips for Large Catalogs

1. **Split into smaller files** (500 rows each)
2. **Import products first**, then variants
3. **Use SKUs consistently** for reliable matching
4. **Validate data offline** before uploading
5. **Monitor import progress** via response

---

**Status**: ✅ CSV import system with validation and error reporting

