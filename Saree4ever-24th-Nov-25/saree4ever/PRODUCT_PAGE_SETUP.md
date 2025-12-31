# Product Page Setup Guide
## For: kanjivaram-pure-silk

This guide will help you set up the product page at `/product/kanjivaram-pure-silk` with all necessary data.

---

## Current Issues

Based on the page at https://saree4ever.vercel.app/product/kanjivaram-pure-silk, the following are missing:

1. ❌ **No images available** - Product needs primary image or image URLs
2. ❌ **Price not available** - Product needs base_price or variants with prices
3. ❌ **Please select a color to continue** - Product needs variants with colors

---

## Step-by-Step Setup

### Step 1: Access Admin Panel

1. Go to: https://saree4ever.vercel.app/admin
2. Login with your admin credentials
3. Navigate to **Products** → **List Products**

### Step 2: Find the Product

1. Search for "kanjivaram-pure-silk" or "Kanjivaram Pure Silk"
2. Click on the product to edit it
3. Or go directly to: `/admin/products/[product-id]/edit`

### Step 3: Add Product Image

#### Option A: Upload Image (Recommended)

1. In the **Product Photo** section, click **"Upload Product Photo"**
2. Select an image file (JPEG, PNG, WebP, GIF - Max 10MB)
3. Wait for upload to complete
4. The image URL will be automatically filled

#### Option B: Enter Image URL

1. Scroll to **"Enter Image URL"** field
2. Paste a publicly accessible image URL
3. Example: Supabase Storage URL or external image URL

**Recommended Image Specifications:**
- Format: JPEG, PNG, WebP
- Size: 800x800px or larger (square aspect ratio)
- Max file size: 10MB

### Step 4: Set Product Price

1. In **Basic Information** section, find **"Base Price (₹)"**
2. Enter the product price (e.g., `25000` for ₹25,000)
3. Optionally set **"Compare At Price"** for showing discounts
4. Optionally set **"MRP"** (Maximum Retail Price)

**Example:**
- Base Price: `25000`
- Compare At Price: `30000` (shows ₹30,000 struck through)
- MRP: `35000` (if different from compare at price)

### Step 5: Create Product Variants

Variants are required for color selection and proper pricing display.

#### Create Variants:

1. Go to **Admin Panel** → **Variants**
2. Click **"Create New Variant"** or **"Add Variant"**
3. Select the product: "Kanjivaram Pure Silk"
4. Fill in variant details:

**Variant 1 Example:**
- **Name**: "Kanjivaram Pure Silk - Red"
- **Color**: "Red"
- **Price**: `25000` (or leave null to use product base_price)
- **Compare At Price**: `30000` (optional)
- **SKU**: "KAN-PURE-RED-001"
- **Stock Quantity**: `10` (or your available stock)
- **Track Inventory**: ✓ (checked)
- **Blouse Included**: ✓ (if applicable)
- **Image URL**: (optional - variant-specific image)

**Variant 2 Example:**
- **Name**: "Kanjivaram Pure Silk - Blue"
- **Color**: "Blue"
- **Price**: `25000`
- **Compare At Price**: `30000`
- **SKU**: "KAN-PURE-BLUE-001"
- **Stock Quantity**: `10`
- **Track Inventory**: ✓
- **Blouse Included**: ✓

**Repeat for all color variants you want to offer.**

### Step 6: Add Product Details

In the product edit page, fill in:

1. **Description**: Short product description
   - Example: "Exquisite handwoven Kanjivaram pure silk saree with traditional zari work"

2. **Long Description**: Detailed product information (HTML supported)
   - Example: 
     ```html
     <p>This beautiful Kanjivaram pure silk saree features:</p>
     <ul>
       <li>100% Pure Silk</li>
       <li>Traditional Zari Work</li>
       <li>Handwoven Design</li>
       <li>Blouse Included</li>
     </ul>
     ```

3. **Product Attributes**:
   - **Weave**: "Kanjivaram"
   - **Length (meters)**: `6.0` (or your standard length)
   - **Color**: Leave blank (colors come from variants)
   - **Blouse Included**: ✓ (if applicable)

4. **Subcategories**: 
   - Enter: "Pure Silk, Handloom, Traditional" (comma-separated)

### Step 7: Assign Collections/Categories/Types

1. **Collections**: Check the appropriate collection (e.g., "Kanjivaram Collection")
2. **Categories**: Check the appropriate category (e.g., "Silk Sarees")
3. **Types**: Check the appropriate type (e.g., "Kanjivaram")

### Step 8: Set Product Status

1. **Featured Product**: ✓ (if you want it on homepage)
2. **Active**: ✓ (must be checked for product to show)

### Step 9: Save and Verify

1. Click **"Save Changes"**
2. Wait for success message
3. Visit: https://saree4ever.vercel.app/product/kanjivaram-pure-silk
4. Verify:
   - ✅ Image displays correctly
   - ✅ Price shows
   - ✅ Color options appear
   - ✅ Add to cart works

---

## Quick Setup Checklist

- [ ] Product image uploaded or URL added
- [ ] Base price set (₹)
- [ ] At least one variant created with color
- [ ] Variant has price (or inherits from product)
- [ ] Variant has stock quantity
- [ ] Product description added
- [ ] Product is marked as "Active"
- [ ] Product assigned to collection/category/type

---

## Troubleshooting

### Image Not Showing

1. Check if image URL is publicly accessible
2. Verify image URL is correct (no typos)
3. Check browser console for image loading errors
4. Try uploading a new image

### Price Not Showing

1. Ensure product has `base_price` set
2. Or ensure at least one variant has `price` set
3. Check that variant is properly linked to product
4. Verify product/variant is active

### Color Selection Not Working

1. Ensure variants exist for the product
2. Check that variants have `color` field filled
3. Verify variants are active
4. Check that variants have stock quantity > 0

### "Please select a color to continue" Message

This appears when:
- Product has variants but no color is selected
- Solution: Create variants with color attributes

---

## API Endpoints for Direct Setup

If you prefer to set up via API:

### Get Product by Slug
```bash
GET https://saree4ever.onrender.com/api/products/kanjivaram-pure-silk
```

### Update Product
```bash
PUT https://saree4ever.onrender.com/api/products/{product-id}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "primary_image_url": "https://your-image-url.com/image.jpg",
  "base_price": 25000,
  "compare_at_price": 30000,
  "description": "Product description",
  "is_active": true
}
```

### Create Variant
```bash
POST https://saree4ever.onrender.com/api/variants
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "product_id": "{product-id}",
  "name": "Kanjivaram Pure Silk - Red",
  "color": "Red",
  "price": 25000,
  "compare_at_price": 30000,
  "sku": "KAN-PURE-RED-001",
  "stock_quantity": 10,
  "track_inventory": true,
  "blouse_included": true
}
```

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify backend is running: https://saree4ever.onrender.com/health
3. Check product data in Supabase dashboard
4. Verify environment variables are set correctly

---

**Last Updated**: After product page enhancement
**Product Slug**: `kanjivaram-pure-silk`




