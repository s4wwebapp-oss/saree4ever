# Many-to-Many Product Relationships

This document explains how products can now appear in multiple collections, categories, and types without duplication.

## Overview

Products can now belong to multiple:
- **Collections** (e.g., "Bridal", "Diwali 2025", "Under ₹10,000")
- **Categories** (e.g., "Silk", "Cotton", "Designer")
- **Types** (e.g., "Kanjivaram", "Banarasi", "Traditional")

This allows better product discoverability and marketing flexibility.

## Database Structure

### Junction Tables

Three junction tables were created to support many-to-many relationships:

1. **`product_collections`** - Links products to collections
2. **`product_categories`** - Links products to categories
3. **`product_types`** - Links products to types

Each junction table has:
- `product_id` - Reference to the product
- `collection_id` / `category_id` / `type_id` - Reference to the related entity
- `display_order` - For ordering within the relationship
- Unique constraint on `(product_id, collection_id)` etc. to prevent duplicates

### Migration

Run the migration SQL file to set up the junction tables:

```bash
# In Supabase SQL Editor, run:
backend/migrations/create_product_junction_tables.sql
```

This migration:
1. Creates the three junction tables
2. Migrates existing data from single foreign keys to junction tables
3. Keeps old columns for backward compatibility

## Backend API

### Creating Products

When creating a product, you can now pass arrays of IDs:

```javascript
{
  name: "Bridal Kanjivaram Saree",
  base_price: 15000,
  collection_ids: ["collection-uuid-1", "collection-uuid-2"], // Multiple collections
  category_ids: ["category-uuid-1"],
  type_ids: ["type-uuid-1", "type-uuid-2"], // Multiple types
  // ... other fields
}
```

**Backward Compatibility**: The old single `collection_id`, `category_id`, `type_id` fields still work.

### Updating Products

To update relationships, pass arrays:

```javascript
{
  collection_ids: ["new-collection-1", "new-collection-2"], // Replaces all existing
  // ... other fields
}
```

### Filtering Products

The filtering logic automatically uses junction tables:

```javascript
// Get products in a specific collection
GET /api/products?collection=bridal-edit

// Get products in multiple categories (AND logic)
GET /api/products?category=silk&type=kanjivaram
```

### Response Format

Products now return arrays of related entities:

```json
{
  "id": "product-uuid",
  "name": "Bridal Kanjivaram Saree",
  "collections": [
    { "id": "...", "name": "Bridal", "slug": "bridal" },
    { "id": "...", "name": "Kanjivaram", "slug": "kanjivaram" }
  ],
  "categories": [...],
  "types": [...],
  // Backward compatibility - single collection/category/type still available
  "collection": { "name": "Bridal" },
  "category": { "name": "Silk" },
  "type": { "name": "Traditional" }
}
```

## Frontend

### Admin UI

The admin product form (`/admin/products`) now includes:

- **Multi-select checkboxes** for Collections, Categories, and Types
- Check/uncheck multiple options
- Scrollable lists for large option sets

### Product Cards

Product cards now display:

- **Collection badges** - Shows up to 2 collection names as badges
- **Multiple collections indicator** - Shows "X Collections" badge if product is in 3+ collections
- **"Also in" hint** - Displays "+X more" if there are additional collections

### Product Pages

Product detail pages can show:
- All collections the product belongs to (as links)
- All categories and types
- Breadcrumbs showing the navigation path

## SEO & Canonical URLs

- **One canonical URL per product**: `/product/{slug}`
- Products appear in multiple collection pages but link to the same canonical URL
- Collection pages have unique marketing copy to avoid duplicate content issues
- Breadcrumbs show the navigation path (e.g., Home → Bridal → Kanjivaram → Product)

## Inventory & Stock

- **Stock is tracked per variant** (not per collection)
- A variant sold through any collection reduces the same stock
- No duplication of inventory
- Reservation and commit flows use variant IDs (independent of collection)

## Best Practices

### Admin Workflow

1. **Create product** with basic info
2. **Select multiple collections** - e.g., "Bridal", "Featured", "Under ₹10k"
3. **Select multiple categories** - e.g., "Silk", "Designer"
4. **Select multiple types** - e.g., "Kanjivaram", "Traditional"
5. **Add variants** with stock (one set of variants for all collections)

### Marketing

- Use collections for **seasonal campaigns** (e.g., "Diwali 2025")
- Use collections for **price ranges** (e.g., "Under ₹10,000")
- Use collections for **occasions** (e.g., "Bridal", "Festive")
- Same product can appear in multiple collections simultaneously

### Product Organization

- **Categories** = Material/Fabric (Silk, Cotton, Georgette)
- **Types** = Style/Pattern (Kanjivaram, Banarasi, Designer)
- **Collections** = Marketing groupings (Bridal, Featured, Seasonal)

## Migration Guide

### For Existing Products

Existing products with single `collection_id`, `category_id`, `type_id` are automatically migrated:

1. Run the migration SQL
2. Existing relationships are copied to junction tables
3. Old columns remain for backward compatibility
4. Gradually update products to use multiple relationships

### For New Products

Always use the new array format:

```javascript
{
  collection_ids: ["uuid1", "uuid2"], // ✅ New way
  // NOT: collection_id: "uuid1"      // ❌ Old way (still works but not recommended)
}
```

## API Examples

### Create Product with Multiple Collections

```bash
POST /api/products
{
  "name": "Bridal Kanjivaram Saree",
  "base_price": 15000,
  "collection_ids": [
    "bridal-collection-uuid",
    "kanjivaram-collection-uuid",
    "under-10k-collection-uuid"
  ],
  "category_ids": ["silk-category-uuid"],
  "type_ids": ["kanjivaram-type-uuid", "traditional-type-uuid"]
}
```

### Filter Products by Collection

```bash
GET /api/products?collection=bridal-edit
# Returns all products in "bridal-edit" collection
```

### Get Product with All Relationships

```bash
GET /api/products/{slug}
# Returns product with collections[], categories[], types[] arrays
```

## Troubleshooting

### Products Not Showing in Collections

1. Check junction table entries: `SELECT * FROM product_collections WHERE product_id = '...'`
2. Verify collection is active: `SELECT * FROM collections WHERE slug = '...' AND is_active = true`
3. Check product is active: `SELECT * FROM products WHERE id = '...' AND is_active = true`

### Duplicate Products

- Junction tables have unique constraints - duplicates are prevented automatically
- If you see duplicates, check for multiple product records (not junction table issues)

### Performance

- Junction tables are indexed on `product_id` and `collection_id`/`category_id`/`type_id`
- Filtering uses these indexes for fast queries
- For large catalogs, consider pagination

## Future Enhancements

- [ ] Bulk edit products to add/remove from collections
- [ ] Collection-specific pricing (override base price per collection)
- [ ] Collection-specific images
- [ ] Collection landing pages with custom layouts
- [ ] Search faceting by collections/categories/types



