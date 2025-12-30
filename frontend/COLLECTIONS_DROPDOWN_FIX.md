# Fix Collections Dropdown Not Showing

## Problem
The Collections dropdown is empty/not showing any items.

## Root Causes

### 1. Missing API URL Environment Variable
The frontend defaults to `http://localhost:5001/api` if `NEXT_PUBLIC_API_URL` is not set.

### 2. Backend Not Connected
The frontend can't reach the backend API.

### 3. No Collections in Database
The database might not have any collections yet.

---

## Solution Steps

### Step 1: Check Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify `NEXT_PUBLIC_API_URL` is set to your Render backend URL:
   ```
   https://your-backend-service.onrender.com/api
   ```
3. Make sure it's set for **Production**, **Preview**, and **Development**
4. **Redeploy** your frontend after adding/updating the variable

### Step 2: Verify Backend is Running

1. Test your backend health endpoint:
   ```
   https://your-backend-service.onrender.com/health
   ```
2. Test collections endpoint:
   ```
   https://your-backend-service.onrender.com/api/collections
   ```
3. Should return JSON with collections array

### Step 3: Check Browser Console

1. Open your website: `https://saree4ever.vercel.app`
2. Open Browser DevTools (F12)
3. Go to **Console** tab
4. Look for errors like:
   - `Failed to fetch`
   - `Network error`
   - `CORS error`
   - `404 Not Found`

### Step 4: Add Collections to Database

If backend is working but no collections exist:

1. Go to Admin Panel: `https://saree4ever.vercel.app/admin`
2. Navigate to **Collections** page
3. Create some collections (e.g., "Wedding Collection", "Festive Collection", etc.)
4. Refresh the homepage - dropdown should now show collections

---

## Quick Fix Checklist

- [ ] `NEXT_PUBLIC_API_URL` is set in Vercel environment variables
- [ ] Backend is deployed and accessible on Render
- [ ] Backend `/api/collections` endpoint returns data
- [ ] Frontend has been redeployed after setting environment variables
- [ ] Collections exist in the database
- [ ] No CORS errors in browser console
- [ ] Backend CORS allows your Vercel domain

---

## Testing the API

### Test Collections Endpoint:
```bash
curl https://your-backend-service.onrender.com/api/collections
```

Should return:
```json
{
  "collections": [
    {
      "id": "...",
      "name": "Collection Name",
      "slug": "collection-slug"
    }
  ]
}
```

### Test from Browser Console:
```javascript
fetch('https://your-backend-service.onrender.com/api/collections')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## Common Issues

### Issue: "Failed to fetch" Error
**Solution:** 
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS settings in backend

### Issue: Empty Array Returned
**Solution:**
- Collections table is empty
- Add collections via admin panel or database

### Issue: CORS Error
**Solution:**
- Update backend `FRONTEND_URL` environment variable to include your Vercel domain
- Backend should allow: `https://saree4ever.vercel.app`

### Issue: 404 Not Found
**Solution:**
- Check API URL format: should end with `/api`
- Verify backend routes are correct

---

## Debug Code Location

The Collections dropdown code is in:
- `frontend/src/components/Header.tsx` (line 623-701)
- Collections are fetched in `useEffect` (line 57-94)
- API call: `api.collections.getAll()` (line 61)

---

**After fixing, the Collections dropdown should show your collections! 🎉**




