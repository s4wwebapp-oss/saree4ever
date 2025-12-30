# SKU Auto-Generation Guide

## ✨ Good News: SKU Codes are Optional!

Your Saree4ever platform includes smart SKU auto-generation. You can leave the SKU field blank when:
- Adding products manually in the admin panel
- Bulk uploading via CSV import

## How It Works

### For Products

When you leave SKU blank, the system automatically generates codes based on:
- Product Type (e.g., Kanjivaram → KAN, Chiffon → CHF)
- Color (if provided)
- Sequential numbering

**Format:** `[TYPE]-[COLOR]-[NUMBER]`

**Examples:**
- Kanjivaram Silk + Red → `KAN-RED-001`
- Chiffon Saree + Blue → `CHF-BLU-001`
- Banarasi Silk + Green → `BAN-GRE-001`
- Cotton Handloom (no color) → `COT-GEN-001`

### For Variants

Variants get SKUs based on their parent product:

**Format:** `[PRODUCT_SKU]-V[NUMBER]`

**Examples:**
- Product: `KAN-RED-001`
  - Variant 1: `KAN-RED-001-V1`
  - Variant 2: `KAN-RED-001-V2`
  - Variant 3: `KAN-RED-001-V3`

## Usage Options

You have full flexibility:

✅ **Option 1: Full Auto-Generation (Recommended)**
- Leave ALL SKU fields blank
- System generates consistent codes automatically
- No manual tracking needed

✅ **Option 2: Custom SKU Codes**
- Provide your own SKU codes
- Full control over naming
- Great if you have existing inventory system

✅ **Option 3: Mixed Approach**
- Auto-generate for new products
- Use custom codes for specific items
- Best of both worlds

## CSV Import Examples

### Products CSV (SKU Blank)
```csv
name,base_price,type_id,color,sku,description
Kanjivaram Silk Saree,12999,uuid-here,Red,,Beautiful traditional saree
Banarasi Silk,9999,uuid-here,Blue,,Elegant festive wear
Cotton Handloom,2499,uuid-here,,,Daily wear comfort
```

**Result:**
- Product 1: Auto-generated SKU like `KAN-RED-001`
- Product 2: Auto-generated SKU like `BAN-BLU-001`
- Product 3: Auto-generated SKU like `COT-GEN-001`

### Variants CSV (SKU Blank)
```csv
product_sku,name,sku,price,color,stock_quantity
KAN-RED-001,Kanjivaram - Maroon,,12999,Maroon,5
KAN-RED-001,Kanjivaram - Crimson,,12999,Crimson,3
```

**Result:**
- Variant 1: Auto-generated SKU `KAN-RED-001-V1`
- Variant 2: Auto-generated SKU `KAN-RED-001-V2`

## Admin Panel Usage

When adding products manually:

1. Go to Admin → Products → New Product
2. Fill in product details
3. **Leave SKU field blank** (or empty)
4. Save product
5. SKU is automatically generated!

## Benefits

✅ **Consistent Naming** - All SKUs follow same pattern
✅ **No Duplicates** - System prevents SKU conflicts
✅ **Time Saving** - No manual SKU creation needed
✅ **Professional** - Clean, organized product codes
✅ **Scalable** - Works for 10 or 10,000 products

## FAQs

**Q: Can I change the auto-generated SKU later?**
A: Yes! Edit the product and update the SKU field manually.

**Q: What if I don't have a product type assigned?**
A: System uses a generic prefix like `PRD-GEN-001`.

**Q: Will old products with existing SKUs be affected?**
A: No. Auto-generation only applies when SKU is blank or null.

**Q: Can I customize the SKU format?**
A: The format is fixed for consistency, but you can always provide custom SKUs when needed.

**Q: What happens if I upload same product twice?**
A: CSV import matches by SKU or slug. If product exists, it updates instead of creating duplicate.

---

**TIP:** For best results, provide the `type_id` and `color` fields when creating products. This gives you meaningful SKU codes like `KAN-RED-001` instead of generic ones.
