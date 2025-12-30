# Product Page Troubleshooting Guide

## Issue: Product page not displaying images/price

### Quick Checks

1. **Check Backend API**
   ```bash
   curl https://saree4ever.onrender.com/api/products/kanjivaram-pure-silk
   ```
   Should return product data with `primary_image_url` and `base_price`.

2. **Check Vercel Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `NEXT_PUBLIC_API_URL` is set to: `https://saree4ever.onrender.com/api`
   - If missing, add it and redeploy

3. **Clear Vercel Cache**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click "..." on latest deployment → "Redeploy"
   - Or use: "Redeploy" button

4. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls

### Common Issues & Solutions

#### Issue 1: API URL Not Set
**Symptom**: Product page shows "No images available" and "Price not available"

**Solution**:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` = `https://saree4ever.onrender.com/api`
4. Redeploy

#### Issue 2: CORS Error
**Symptom**: Browser console shows CORS errors

**Solution**: Already fixed in backend, but verify:
- Backend `FRONTEND_URL` includes `https://saree4ever.vercel.app`
- No trailing slash issues

#### Issue 3: Stale Cache
**Symptom**: Old data showing even after updates

**Solution**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Redeploy on Vercel

#### Issue 4: Product Not Found
**Symptom**: 404 error or "Product not found"

**Solution**:
1. Verify product exists in database
2. Check product slug matches URL
3. Verify product is `is_active: true`

### Manual Verification Steps

1. **Test API Directly**:
   ```bash
   curl https://saree4ever.onrender.com/api/products/kanjivaram-pure-silk
   ```
   Should return JSON with product data.

2. **Check Product Data**:
   - Verify `primary_image_url` is not null
   - Verify `base_price` is set (e.g., 25000)
   - Verify `variants` array has items

3. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors during page load
   - Check server-side logs

4. **Check Browser Network Tab**:
   - Open DevTools → Network
   - Reload page
   - Find request to `/api/products/kanjivaram-pure-silk`
   - Check response status and data

### Debugging Code Added

The product page now includes console logging:
- Product fetch status
- API response data
- Image array
- Price information
- Variant count

Check Vercel function logs or browser console for these messages.

### Force Refresh

If nothing works:

1. **Redeploy on Vercel**:
   - Go to Deployments
   - Click "Redeploy" on latest deployment
   - Wait for completion

2. **Clear All Caches**:
   - Vercel cache (via redeploy)
   - Browser cache (hard refresh)
   - CDN cache (may take a few minutes)

3. **Verify Environment Variables**:
   ```bash
   # In Vercel Dashboard, verify these are set:
   NEXT_PUBLIC_API_URL=https://saree4ever.onrender.com/api
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
   ```

### Expected Product Data Structure

The API should return:
```json
{
  "product": {
    "id": "...",
    "name": "Kanjivaram Pure Silk Saree",
    "slug": "kanjivaram-pure-silk",
    "base_price": 25000,
    "compare_at_price": 32000,
    "primary_image_url": "https://images.unsplash.com/...",
    "image_urls": ["..."],
    "variants": [
      {
        "id": "...",
        "name": "Kanjivaram Pure Silk - Maroon",
        "color": "Maroon",
        "price": 25000,
        "stock_quantity": 15
      }
    ]
  }
}
```

### Still Not Working?

1. Check Vercel function logs for errors
2. Verify backend is running: https://saree4ever.onrender.com/health
3. Test API directly with curl
4. Check browser console for JavaScript errors
5. Verify all environment variables are set in Vercel




