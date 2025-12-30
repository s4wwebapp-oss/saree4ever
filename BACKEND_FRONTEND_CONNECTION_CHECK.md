# How to Check Backend is Running and Supporting Frontend

## 🔍 Quick Health Check

### 1. Test Backend Health Endpoint

Open in browser or use curl:
```
https://saree4ever.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

✅ **If you see this:** Backend is running!

---

## 🧪 Test All Frontend-Required Endpoints

### 2. Test Collections Endpoint
```
https://saree4ever.onrender.com/api/collections
```

**Expected:** JSON array with collections
```json
{
  "collections": [
    {
      "id": "...",
      "name": "New Arrivals",
      "slug": "new-arrivals",
      ...
    }
  ]
}
```

### 3. Test Categories Endpoint
```
https://saree4ever.onrender.com/api/categories
```

### 4. Test Types Endpoint
```
https://saree4ever.onrender.com/api/types
```

### 5. Test Products Endpoint
```
https://saree4ever.onrender.com/api/products
```

### 6. Test API Info
```
https://saree4ever.onrender.com/api
```

**Expected:** List of all available endpoints

---

## 🌐 Check CORS Configuration

### 7. Test CORS from Browser Console

1. Open your frontend: https://saree4ever.vercel.app
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Run this command:

```javascript
fetch('https://saree4ever.onrender.com/api/collections', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('✅ Status:', response.status);
    console.log('✅ CORS Headers:', response.headers.get('access-control-allow-origin'));
    return response.json();
  })
  .then(data => {
    console.log('✅ Data received:', data);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
```

**Expected:**
- ✅ Status: 200
- ✅ CORS Headers: Should show your frontend domain or `*`
- ✅ Data received: Collections array

**If you see CORS error:**
- Backend needs to allow your frontend domain
- Update `FRONTEND_URL` in Render environment variables

---

## 🔧 Check Backend Environment Variables

### 8. Verify Backend CORS Settings

In Render Dashboard:
1. Go to your backend service
2. Click **Environment** tab
3. Check `FRONTEND_URL` is set to:
   ```
   https://saree4ever.vercel.app
   ```
   Or allow all origins:
   ```
   *
   ```

### 9. Verify Required Backend Variables

Check these are set in Render:
- ✅ `DATABASE_URL` - Database connection
- ✅ `SUPABASE_URL` - Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- ✅ `SUPABASE_ANON_KEY` - Supabase anonymous key
- ✅ `JWT_SECRET` - JWT token secret
- ✅ `FRONTEND_URL` - Your Vercel frontend URL
- ✅ `NODE_ENV` - Set to `production`

---

## 🖥️ Check Frontend Environment Variables

### 10. Verify Frontend API URL

In Vercel Dashboard:
1. Go to your frontend project
2. Click **Settings** → **Environment Variables**
3. Check `NEXT_PUBLIC_API_URL` is set to:
   ```
   https://saree4ever.onrender.com/api
   ```

### 11. Test Frontend API Connection

Open browser console on your frontend site and run:

```javascript
// Check if API URL is configured
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'Not set!');

// Test API call
fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/collections`)
  .then(r => r.json())
  .then(data => {
    console.log('✅ Frontend can reach backend:', data);
  })
  .catch(err => {
    console.error('❌ Frontend cannot reach backend:', err);
  });
```

---

## 📋 Complete Connection Checklist

### Backend Checks:
- [ ] Backend is deployed on Render
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Collections endpoint returns data
- [ ] Categories endpoint returns data
- [ ] Types endpoint returns data
- [ ] Products endpoint returns data
- [ ] CORS allows frontend domain
- [ ] `FRONTEND_URL` environment variable is set

### Frontend Checks:
- [ ] Frontend is deployed on Vercel
- [ ] `NEXT_PUBLIC_API_URL` is set correctly
- [ ] Environment variable includes `/api` at the end
- [ ] Frontend has been redeployed after setting env vars
- [ ] No CORS errors in browser console
- [ ] Collections dropdown shows data

### Integration Checks:
- [ ] Frontend can fetch from backend (test in console)
- [ ] No network errors in browser DevTools
- [ ] API responses are received correctly
- [ ] Data displays on frontend pages

---

## 🛠️ Quick Test Script

Save this as `test-backend-connection.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Backend Connection Test</title>
</head>
<body>
    <h1>Backend Connection Test</h1>
    <button onclick="testBackend()">Test Backend</button>
    <div id="results"></div>

    <script>
        async function testBackend() {
            const backendUrl = 'https://saree4ever.onrender.com';
            const results = document.getElementById('results');
            results.innerHTML = '<p>Testing...</p>';

            const tests = [
                { name: 'Health Check', url: `${backendUrl}/health` },
                { name: 'Collections', url: `${backendUrl}/api/collections` },
                { name: 'Categories', url: `${backendUrl}/api/categories` },
                { name: 'Types', url: `${backendUrl}/api/types` },
                { name: 'Products', url: `${backendUrl}/api/products?limit=5` }
            ];

            let html = '<h2>Test Results:</h2><ul>';

            for (const test of tests) {
                try {
                    const response = await fetch(test.url);
                    const data = await response.json();
                    html += `<li>✅ ${test.name}: Working (Status: ${response.status})</li>`;
                } catch (error) {
                    html += `<li>❌ ${test.name}: Failed - ${error.message}</li>`;
                }
            }

            html += '</ul>';
            results.innerHTML = html;
        }
    </script>
</body>
</html>
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Update backend `FRONTEND_URL` in Render to include your Vercel domain
2. Or set to `*` to allow all origins (less secure)
3. Redeploy backend

### Issue: 404 Not Found
**Error:** `404 Not Found` when calling API

**Solution:**
- Check API URL includes `/api` at the end
- Verify endpoint path is correct
- Check backend routes are configured

### Issue: Network Error
**Error:** `Failed to fetch` or `Network request failed`

**Solution:**
- Verify backend is running (check health endpoint)
- Check backend URL is correct
- Verify no firewall blocking requests

### Issue: Empty Data
**Error:** API returns empty array `[]`

**Solution:**
- Check database has data
- Verify database connection in backend
- Check backend logs in Render dashboard

---

## 📊 Monitoring

### Check Backend Logs in Render:
1. Go to Render Dashboard
2. Click your backend service
3. Click **Logs** tab
4. Look for errors or warnings

### Check Frontend Logs in Vercel:
1. Go to Vercel Dashboard
2. Click your frontend project
3. Go to **Deployments**
4. Click on a deployment
5. View **Build Logs** and **Function Logs**

---

## ✅ Success Indicators

Your backend is properly supporting frontend if:

1. ✅ Health endpoint returns `{"status":"ok"}`
2. ✅ All API endpoints return data (not errors)
3. ✅ CORS headers are present in responses
4. ✅ Frontend can fetch data without errors
5. ✅ Collections dropdown shows items
6. ✅ Products load on frontend pages
7. ✅ No console errors in browser
8. ✅ Network tab shows successful API calls

---

**Use this guide to verify your backend is running and properly connected to your frontend! 🎉**




