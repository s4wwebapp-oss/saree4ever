# CSV Import Templates

Download these templates and fill them with your data.

## Products Template

**File:** `products-template.csv`

```csv
name,base_price,sku,description,collection_id,category_id,type_id,compare_at_price,primary_image_url,image_urls,tags,is_featured,meta_title,meta_description
Kanjivaram Pure Silk,9999.00,P1,Beautiful traditional saree,uuid,uuid,uuid,12999.00,https://...,"https://...,https://...","silk,bridal",true,SEO Title,SEO Description
Banarasi Silk,8999.00,P2,Elegant Banarasi design,uuid,uuid,uuid,11999.00,https://...,"https://...","silk,festive",false,SEO Title,SEO Description
```

**Notes:**
- `collection_id`, `category_id`, `type_id` - Get UUIDs from database
- `image_urls` - Comma-separated URLs (no spaces)
- `tags` - Comma-separated tags
- `is_featured` - Use `true`/`false` or `1`/`0`

## Variants Template

**File:** `variants-template.csv`

```csv
product_sku,name,sku,price,color,has_blouse,blouse_included,stock_quantity,image_url
P1,Maroon with Blouse,V1,9999.00,Maroon,true,true,5,https://...
P1,Red with Blouse,V2,9999.00,Red,true,true,3,https://...
P1,Blue without Blouse,V3,8999.00,Blue,false,false,10,https://...
P2,Green with Blouse,V4,8999.00,Green,true,true,7,https://...
```

**Notes:**
- Use `product_sku` to link to product (or `product_id` or `product_slug`)
- `has_blouse` and `blouse_included` - Use `true`/`false` or `1`/`0`
- `stock_quantity` - Must be a number

## Stock Update Template

**File:** `stock-template.csv`

```csv
sku,stock_quantity,current_stock,update_method
V1,10,5,set
V2,8,3,adjust
V3,15,,set
```

**Notes:**
- `update_method`: 
  - `set` - Set absolute value (ignores current_stock)
  - `adjust` - Adjust from current_stock
- Leave `current_stock` empty if using `set` method

## Getting UUIDs

To get collection/category/type UUIDs:

```sql
-- Get collections
SELECT id, name FROM collections;

-- Get categories
SELECT id, name FROM categories;

-- Get types
SELECT id, name FROM types;
```

Or use the API:
```bash
curl http://localhost:5001/api/collections
curl http://localhost:5001/api/categories
curl http://localhost:5001/api/types
```

---

**Download these templates and customize for your data!**

