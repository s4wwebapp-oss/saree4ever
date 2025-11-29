# How to Change Product Image - Royal Kanjivaram Saree

## 🖼️ Method 1: Through Admin Panel (Recommended)

### Step 1: Find the Product
1. Go to **Admin Panel**: https://saree4ever.vercel.app/admin
2. Click **"Products"** in the left sidebar
3. Click **"List Products"** or go to: https://saree4ever.vercel.app/admin/products/list
4. Search for **"Royal Kanjivaram"** or scroll to find it
5. Click on the product name or **"Edit"** button

### Step 2: Update the Image
1. In the product edit page, look for **"Primary Image URL"** field
2. You can either:
   - **Option A:** Upload a new image (if upload feature is available)
   - **Option B:** Enter a new image URL directly

### Step 3: Save Changes
1. Click **"Save"** or **"Update Product"** button
2. The new image will appear on the product listing

---

## 🔧 Method 2: Direct API Update

If you have the product ID, you can update it via API:

### Find Product ID
1. Go to admin products list
2. Click on the product
3. Check the URL: `/admin/products/[id]/edit`
4. Copy the `[id]` from the URL

### Update via API
```bash
curl -X PUT https://saree4ever.onrender.com/api/products/[PRODUCT_ID] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "primary_image_url": "https://your-new-image-url.com/image.jpg"
  }'
```

---

## 📸 Method 3: Upload New Image First

### Step 1: Upload Image to Supabase
1. Go to admin panel
2. Use the upload feature (if available)
3. Or upload directly to Supabase Storage:
   - Go to Supabase Dashboard
   - Storage → `product-media` bucket
   - Upload your image
   - Copy the public URL

### Step 2: Update Product with New URL
1. Go to product edit page
2. Paste the new image URL in **"Primary Image URL"** field
3. Save

---

## 🎯 Quick Steps Summary

1. **Login to Admin**: https://saree4ever.vercel.app/admin
2. **Navigate**: Products → List Products
3. **Find**: "Royal Kanjivaram Silk Saree"
4. **Edit**: Click on the product
5. **Update**: Change the image URL or upload new image
6. **Save**: Click Save button

---

## 📋 Product Image Requirements

- **Format**: JPEG, PNG, WebP, GIF
- **Max Size**: 10MB
- **Recommended**: 800x800px or larger (square aspect ratio)
- **URL**: Must be publicly accessible (Supabase Storage URL recommended)

---

## 🔍 Finding the Current Image

To see the current image URL:
1. Go to product edit page
2. Look for **"Primary Image URL"** field
3. Or check the product in the database

---

**Need help?** Let me know if you want me to:
- Find the product ID for you
- Help upload a new image
- Update it directly via API




