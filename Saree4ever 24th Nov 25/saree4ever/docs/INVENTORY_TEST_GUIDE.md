# Inventory Update Test Guide

## Testing Inventory Updates and Store Visibility

This guide walks through testing the inventory update functionality and verifying that changes are visible in the storefront using Chrome DevTools.

## Prerequisites

1. Both servers running:
   - Backend: `http://localhost:5001`
   - Frontend: `http://localhost:3000`

2. Admin access (logged in as admin user)

3. At least one product with variants in the database

## Test Steps

### Step 1: Get a Product and Variant ID

1. Open the storefront: `http://localhost:3000`
2. Navigate to any product page
3. Open Chrome DevTools (F12)
4. Go to **Network** tab
5. Select a variant (color/blouse option)
6. Look for API call: `GET /api/inventory/available/{variantId}`
7. Note the `variantId` from the request URL
8. Also note the current `available_stock` value from the response

### Step 2: Update Inventory via Admin Panel

1. Open admin panel: `http://localhost:3000/admin/inventory`
2. Find the product/variant you want to test
3. Click **Adjust** button
4. Enter a quantity change (e.g., `+5` or `-3`)
5. Select a reason (e.g., "Manual Adjustment")
6. Add optional notes
7. Click **Save Adjustment**
8. Verify the stock level updates in the table

### Step 3: Verify Update in Storefront

1. Go back to the product page in the storefront
2. Open Chrome DevTools → **Network** tab
3. Clear the network log (🚫 icon)
4. Select the same variant again (or refresh the page)
5. Look for the API call: `GET /api/inventory/available/{variantId}`
6. Click on the request to view details
7. In the **Response** tab, verify:
   - `available_stock` has updated to the new value
   - `total_stock` reflects the change
   - `reserved_stock` shows any reserved quantities

### Step 4: Verify UI Updates

1. On the product page, check the stock status display:
   - **"Out of Stock"** (red) - when `available_stock === 0`
   - **"Only X left in stock"** (orange) - when `0 < available_stock < 5`
   - **"In Stock"** (green) - when `available_stock >= 5`

2. Verify the quantity selector:
   - Maximum quantity should be limited to `available_stock`
   - "+" button should be disabled when quantity reaches available stock

3. Verify the "Add to Cart" button:
   - Disabled when out of stock
   - Enabled when stock is available

## Testing Different Scenarios

### Scenario 1: Increase Stock
1. Admin: Adjust stock +10
2. Storefront: Should show "In Stock" or updated "Only X left"
3. Quantity selector: Max should increase

### Scenario 2: Decrease Stock to Low
1. Admin: Adjust stock to 3
2. Storefront: Should show "Only 3 left in stock" (orange)
3. Quantity selector: Max should be 3

### Scenario 3: Set Stock to Zero
1. Admin: Adjust stock to 0 (or negative enough to reach 0)
2. Storefront: Should show "Out of Stock" (red)
3. "Add to Cart" button: Should be disabled

### Scenario 4: Real-time Update Test
1. Open product page in two browser tabs
2. In Tab 1: Keep DevTools Network tab open
3. In Tab 2: Go to admin panel and adjust stock
4. In Tab 1: Refresh the product page
5. Verify the new stock value appears in the Network response

## Chrome DevTools Tips

### Network Tab Filters
- Filter by: `inventory` to see only inventory-related requests
- Filter by: `available` to see stock availability checks

### Response Inspection
- Click on a request → **Response** tab
- Look for JSON structure:
  ```json
  {
    "available_stock": 15,
    "total_stock": 20,
    "reserved_stock": 5
  }
  ```

### Console Tab
- Check for any JavaScript errors
- Look for console logs from `ProductVariantSelector` component

## Expected API Endpoints

### Admin Inventory
- `GET /api/inventory/stock-levels` - List all stock levels
- `POST /api/inventory/adjust` - Adjust stock (admin only)
- `GET /api/inventory/adjustments` - Get adjustment history

### Public/Storefront
- `GET /api/inventory/available/:variantId` - Get available stock for a variant

## Troubleshooting

### Stock Not Updating in Storefront
1. Check if the variant ID matches
2. Verify the API response in Network tab
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### API Returns Old Stock Value
1. Check backend logs for errors
2. Verify database was updated (check `variants.stock_quantity`)
3. Check if inventory adjustment was successful in admin panel

### UI Not Reflecting Stock Changes
1. Check if `ProductVariantSelector` component is re-fetching stock
2. Verify the API response format matches expected structure
3. Check React component state updates

## Database Verification

To verify stock changes directly in the database:

```sql
-- Check variant stock
SELECT id, name, stock_quantity, track_inventory 
FROM variants 
WHERE id = 'your-variant-id';

-- Check inventory adjustment history
SELECT * 
FROM inventory 
WHERE variant_id = 'your-variant-id' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Success Criteria

✅ Inventory adjustment saves successfully in admin panel
✅ Stock level updates in admin inventory table
✅ API returns updated `available_stock` value
✅ Storefront displays correct stock status
✅ Quantity selector respects available stock limit
✅ "Add to Cart" button state matches stock availability


