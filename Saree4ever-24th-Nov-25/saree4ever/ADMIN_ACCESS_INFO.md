# Admin Access Information

## 🔐 Admin Panel URL

### Production (Vercel):
```
https://saree4ever.vercel.app/admin
```

### Local Development:
```
http://localhost:3000/admin
```

---

## 📧 Admin Credentials

### Default Admin Email:
```
admin@saree4ever.com
```

### Admin Password:
The password is the one you set when creating the admin user in **Supabase**.

**⚠️ Important:** The password is NOT stored in code - it's the password you created in Supabase Authentication.

---

## 🔑 How to Find/Set Admin Password

### Option 1: Check Supabase Dashboard

1. Go to **https://supabase.com/dashboard**
2. Select your project
3. Go to **Authentication** → **Users**
4. Find user with email: `admin@saree4ever.com`
5. Click on the user to see details
6. **Note:** Supabase doesn't show passwords (they're hashed), but you can reset it

### Option 2: Reset Admin Password

If you forgot the password:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find `admin@saree4ever.com`
3. Click **"..."** → **"Reset Password"**
4. A password reset email will be sent
5. Or manually set a new password

### Option 3: Create New Admin User

If admin user doesn't exist:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email:** `admin@saree4ever.com`
   - **Password:** (choose a strong password)
   - **Email Confirm:** ✅ (check this)
4. Click **"Create user"**
5. **Remember this password!** - you'll need it to login

---

## ✅ Required Setup

### Backend Environment Variables (Render)

Make sure these are set in Render:

1. `ADMIN_EMAILS` = `admin@saree4ever.com`
   - This tells the backend which emails have admin access

2. `JWT_SECRET` = (your secret key)
   - Used to sign admin tokens

### Frontend Environment Variables (Vercel)

Make sure these are set in Vercel:

1. `NEXT_PUBLIC_ADMIN_EMAIL` = `admin@saree4ever.com`
   - Default admin email

2. `NEXT_PUBLIC_ADMIN_PASSWORD` = (optional, for dev only)
   - ⚠️ **Note:** In production, users enter password manually
   - This is only used for automatic login in development

---

## 🚀 How to Login

### Step 1: Go to Admin URL
Visit: **https://saree4ever.vercel.app/admin**

### Step 2: Enter Password
- You'll see a login form
- Enter the password you set in Supabase for `admin@saree4ever.com`
- Click **"Login"**

### Step 3: Access Dashboard
- If password is correct, you'll see the admin dashboard
- You can now manage products, orders, collections, etc.

---

## 🔍 Troubleshooting

### "Invalid email or password"
**Cause:** Password doesn't match Supabase user

**Solution:**
1. Verify user exists in Supabase
2. Check email is exactly: `admin@saree4ever.com`
3. Reset password in Supabase if needed
4. Make sure email is confirmed in Supabase

### "Admin access denied"
**Cause:** Email not in `ADMIN_EMAILS` list

**Solution:**
1. Go to Render Dashboard → Backend service → Environment
2. Check `ADMIN_EMAILS` includes: `admin@saree4ever.com`
3. Redeploy backend after changing

### Can't access `/admin` page
**Cause:** Frontend not deployed or route not found

**Solution:**
1. Verify frontend is deployed on Vercel
2. Check URL is correct: `https://saree4ever.vercel.app/admin`
3. Try clearing browser cache

---

## 📋 Quick Checklist

- [ ] Admin user exists in Supabase with email `admin@saree4ever.com`
- [ ] You know the password for that Supabase user
- [ ] `ADMIN_EMAILS` is set in Render backend environment
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL` is set in Vercel frontend environment
- [ ] Backend is deployed and running
- [ ] Frontend is deployed and running

---

## 🔐 Security Notes

1. **Never share admin password** publicly
2. **Use strong password** (12+ characters, mixed case, numbers, symbols)
3. **Change default password** if using `admin123`
4. **Limit admin access** - only add trusted emails to `ADMIN_EMAILS`
5. **Use HTTPS** - always access admin panel via HTTPS

---

## 📍 Admin Panel Features

Once logged in, you can access:
- ✅ Products Management
- ✅ Collections Management
- ✅ Categories & Types
- ✅ Orders Management
- ✅ Inventory Management
- ✅ Blog Management
- ✅ Hero Slides
- ✅ Announcement Bar
- ✅ Customer Management
- ✅ Analytics
- ✅ CSV Import
- ✅ Audit Logs

---

**Admin URL:** https://saree4ever.vercel.app/admin  
**Admin Email:** admin@saree4ever.com  
**Password:** (The one you set in Supabase)




