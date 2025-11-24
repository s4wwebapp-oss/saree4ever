# Debug: "No token provided" Error

## 🔍 Quick Diagnosis

This error means you're trying to access admin pages without being authenticated.

---

## ✅ Step-by-Step Fix

### Step 1: Check if you're logged in

Open Browser DevTools (F12) → Console, and run:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));
console.log('Admin Token:', localStorage.getItem('admin_token'));
console.log('Admin Auth:', localStorage.getItem('admin_auth'));
```

**Expected:**
- `token` or `admin_token` should have a JWT string
- `admin_auth` should be `"true"`

**If empty:** You need to login first.

---

### Step 2: Login at Admin Panel

1. **Go to:** `http://localhost:3000/admin`
2. **Enter password** (from `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local`)
3. **Click Login**
4. **Check for errors** in the console

---

### Step 3: Verify Backend is Running

**Check backend health:**
```bash
curl http://localhost:5001/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

**If error:** Backend isn't running. Start it:
```bash
cd backend
npm run dev
```

---

### Step 4: Test Admin Login Endpoint

**Test the login API directly:**

```bash
curl -X POST http://localhost:5001/api/auth/admin/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@saree4ever.com",
    "password": "your-password"
  }'
```

**Expected response:**
```json
{
  "message": "Admin sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@saree4ever.com",
    "role": "admin"
  }
}
```

**If error:** Check:
- Backend `.env` has `JWT_SECRET` set
- Backend `.env` has `ADMIN_EMAILS` with your email
- User exists in Supabase with matching email
- Password is correct

---

### Step 5: Check Environment Variables

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_ADMIN_EMAIL=admin@saree4ever.com
NEXT_PUBLIC_ADMIN_PASSWORD=your-password-here
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**Backend `.env`:**
```env
JWT_SECRET=your-generated-secret-here
ADMIN_EMAILS=admin@saree4ever.com
SUPABASE_URL=https://vjgxuamvrnmulvdajvid.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "No token provided" after login

**Cause:** Login succeeded but token wasn't stored

**Solution:**
1. Open DevTools → Application → Local Storage
2. Check if `token` or `admin_token` exists
3. If not, check console for login errors
4. Try logging out and logging in again

### Issue 2: "Invalid credentials"

**Cause:** Email/password mismatch

**Solution:**
1. Verify email in Supabase Authentication
2. Verify password matches
3. Check `ADMIN_EMAILS` in backend `.env` includes your email
4. Restart backend after changing `.env`

### Issue 3: "Admin access denied"

**Cause:** Email not in `ADMIN_EMAILS` list

**Solution:**
1. Add your email to `ADMIN_EMAILS` in backend `.env`
2. Format: `ADMIN_EMAILS=email1@example.com,email2@example.com`
3. Restart backend server

### Issue 4: Backend not responding

**Cause:** Backend server not running or wrong port

**Solution:**
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill process if needed
kill -9 <PID>

# Start backend
cd backend
npm run dev
```

### Issue 5: CORS errors

**Cause:** Frontend URL not allowed in backend CORS

**Solution:**
Check `backend/server.js` or `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

---

## 🔧 Manual Token Test

If login isn't working, test token manually:

```javascript
// In browser console (after login)
const token = localStorage.getItem('token');

// Test API call
fetch('http://localhost:5001/api/hero-slides', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Expected:** Should return hero slides data

**If error:** Token is invalid or expired

---

## ✅ Complete Checklist

- [ ] Backend server running on port 5001
- [ ] Frontend server running on port 3000
- [ ] Backend `.env` has `JWT_SECRET`
- [ ] Backend `.env` has `ADMIN_EMAILS` with your email
- [ ] User exists in Supabase with matching email
- [ ] Frontend `.env.local` has `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] Frontend `.env.local` has `NEXT_PUBLIC_ADMIN_PASSWORD`
- [ ] Can access `http://localhost:5001/health`
- [ ] Can login at `http://localhost:3000/admin`
- [ ] Token stored in localStorage after login
- [ ] API calls include `Authorization: Bearer <token>` header

---

## 🎯 Quick Fix Commands

```bash
# 1. Check backend is running
curl http://localhost:5001/health

# 2. Check frontend is running
curl http://localhost:3000

# 3. Test admin login
curl -X POST http://localhost:5001/api/auth/admin/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saree4ever.com","password":"your-password"}'

# 4. Clear localStorage and try again
# In browser console:
localStorage.clear();
# Then go to /admin and login again
```

---

## 📞 Still Not Working?

Share these details:

1. **Backend health check response:**
   ```bash
   curl http://localhost:5001/health
   ```

2. **Admin login API response:**
   ```bash
   curl -X POST http://localhost:5001/api/auth/admin/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@saree4ever.com","password":"your-password"}'
   ```

3. **Browser console errors** (F12 → Console)

4. **localStorage contents:**
   ```javascript
   console.log({
     token: localStorage.getItem('token'),
     admin_token: localStorage.getItem('admin_token'),
     admin_auth: localStorage.getItem('admin_auth')
   });
   ```

---

**Last Updated:** November 24, 2025


