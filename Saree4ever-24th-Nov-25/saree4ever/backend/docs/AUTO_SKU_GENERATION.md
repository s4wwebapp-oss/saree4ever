# Auto SKU Generation

## Overview

SKUs (Stock Keeping Units) are now automatically generated for products and variants based on their details. This eliminates the need to manually create SKUs.

## How It Works

### Product SKU Format
```
[TYPE_ABBR]-[COLOR_ABBR]-[NUMBER]
```

**Examples:**
- `CHF-RED-001` - Chiffon saree, Red color, Product #001
- `COT-MAROON-002` - Cotton saree, Maroon color, Product #002
- `DSG-GOLD-003` - Designer saree, Gold color, Product #003

### Variant SKU Format
```
[PRODUCT_SKU]-V[NUMBER]
```

**Examples:**
- `CHF-RED-001-V1` - Variant 1 of Chiffon Red product
- `CHF-RED-001-V2` - Variant 2 of Chiffon Red product

## Implementation

### 1. Application Level (JavaScript Services)

**Files Modified:**
- `backend/utils/helpers.js` - Added SKU generation functions
- `backend/services/productService.js` - Auto-generates SKU on product creation
- `backend/services/variantService.js` - Auto-generates SKU on variant creation

**How it works:**
- When creating a product/variant via API, if SKU is not provided, it's automatically generated
- Uses product name, type, and color to create unique SKU
- Sequential numbering ensures uniqueness

### 2. Database Level (PostgreSQL Triggers)

**File:** `backend/migrations/add_auto_sku_generation.sql`

**Functions Created:**
- `generate_product_sku()` - Generates product SKU
- `generate_variant_sku()` - Generates variant SKU
- `auto_generate_product_sku()` - Trigger function for products
- `auto_generate_variant_sku()` - Trigger function for variants

**How it works:**
- Database triggers automatically generate SKU before INSERT
- Works for direct SQL inserts (bypassing API)
- Ensures SKU is always present, even if not provided

## Usage

### Creating Products via API

```javascript
// SKU will be auto-generated
const product = await productService.createProduct({
  name: "Elegant Red Chiffon Saree",
  type_id: "type-uuid",
  color: "Red",
  base_price: 2999.00
});
// Result: SKU = "CHF-RED-001" (or next available number)
```

### Creating Variants via API

```javascript
// SKU will be auto-generated
const variant = await variantService.createVariant({
  product_id: "product-uuid",
  name: "Red Chiffon Saree",
  color: "Red",
  stock_quantity: 10
});
// Result: SKU = "CHF-RED-001-V1" (or next available number)
```

### Manual SKU Override

You can still provide a manual SKU if needed:

```javascript
// Manual SKU will be used instead of auto-generation
const product = await productService.createProduct({
  name: "Custom Product",
  sku: "CUSTOM-001", // Manual SKU
  base_price: 2999.00
});
```

## SKU Abbreviation Rules

### Type Abbreviation
- Takes first 3-4 characters from type slug
- Removes "-saree" suffix
- Converts to uppercase
- Example: "chiffon-saree" → "CHF"

### Color Abbreviation
- Takes first 3-4 characters from color name
- Converts to uppercase
- Example: "Red" → "RED", "Navy Blue" → "NAV"

### Sequential Numbering
- Products: 3-digit zero-padded (001, 002, 003...)
- Variants: Sequential number (V1, V2, V3...)
- Automatically finds next available number

## Migration Order

1. **First:** Run `add_auto_sku_generation.sql` to create functions and triggers
2. **Then:** Run other migrations that create products/variants

The triggers will automatically generate SKUs for any products/variants created via SQL.

## Benefits

1. **No Manual Work** - SKUs are generated automatically
2. **Consistent Format** - All SKUs follow the same pattern
3. **Unique** - Sequential numbering ensures uniqueness
4. **Flexible** - Can still override with manual SKU if needed
5. **Database-Level** - Works even for direct SQL inserts

## Troubleshooting

### SKU Already Exists Error
- The auto-generation checks for existing SKUs
- If you get a conflict, the number will auto-increment
- Check for duplicate manual SKUs in your data

### SKU Not Generated
- Ensure `add_auto_sku_generation.sql` migration has been run
- Check that triggers are enabled in database
- Verify functions exist: `SELECT * FROM pg_proc WHERE proname LIKE 'generate%sku%';`

### Custom SKU Format Needed
- Modify `generateSKUAbbreviation()` in `helpers.js` for different abbreviation rules
- Update database functions in `add_auto_sku_generation.sql` for different format





