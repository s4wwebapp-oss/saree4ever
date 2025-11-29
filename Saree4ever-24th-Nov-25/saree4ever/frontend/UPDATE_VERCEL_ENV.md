# Update Vercel Environment Variable - Quick Guide

## ✅ Backend Status
Your backend is working perfectly!
- **Backend URL:** https://saree4ever.onrender.com
- **Health Check:** ✅ Working
- **Collections Endpoint:** ✅ Returning 10 collections

## 🔧 Fix Collections Dropdown

### Step 1: Go to Vercel Environment Variables

1. Visit: **https://vercel.com/abhisheks-projects-1d6bf3cc/frontend/settings/environment-variables**
2. Or navigate: Vercel Dashboard → Your Project → Settings → Environment Variables

### Step 2: Add/Update NEXT_PUBLIC_API_URL

1. Click **"Add New"** or find existing `NEXT_PUBLIC_API_URL`
2. Set the value to:
   ```
   https://saree4ever.onrender.com/api
   ```
   ⚠️ **Important:** Include `/api` at the end!

3. Check all three environments:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**

4. Click **"Save"**

### Step 3: Redeploy

After saving the environment variable:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots)
4. Click **"Redeploy"**
5. Wait for deployment to complete (1-2 minutes)

### Step 4: Verify

1. Visit: https://saree4ever.vercel.app
2. Click on **"Collections"** in the navigation
3. The dropdown should now show:
   - New Arrivals
   - Kanjivaram
   - Banarasi
   - Festive Specials
   - Designer
   - Office / Formal Edit
   - Handloom Heritage
   - Bridal Edit
   - Summer Lightweight
   - Pure Silk Classics

---

## 🎯 Quick Checklist

- [ ] Added `NEXT_PUBLIC_API_URL` = `https://saree4ever.onrender.com/api`
- [ ] Checked Production, Preview, and Development
- [ ] Saved the environment variable
- [ ] Redeployed the frontend
- [ ] Tested Collections dropdown

---

## 🔍 Troubleshooting

### If dropdown still empty after redeploy:

1. **Clear browser cache** or use Incognito mode
2. **Check browser console** (F12) for errors
3. **Verify environment variable** is set correctly
4. **Wait 2-3 minutes** for deployment to fully propagate

### Test API Connection:

Open browser console (F12) and run:
```javascript
fetch('https://saree4ever.onrender.com/api/collections')
  .then(r => r.json())
  .then(data => console.log('Collections:', data))
  .catch(err => console.error('Error:', err))
```

Should return your 10 collections!

---

**After updating, your Collections dropdown will work! 🎉**




