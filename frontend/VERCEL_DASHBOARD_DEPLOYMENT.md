# Deploy to Vercel via Dashboard - Step by Step Guide

## 🚀 Quick Deployment Steps

### Step 1: Go to Vercel Dashboard
1. Visit **https://vercel.com**
2. Sign in with your GitHub account (or create an account if you don't have one)

### Step 2: Import Your Project
1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. You'll see a list of your GitHub repositories
4. Find and click on **"s4wwebapp-oss/saree4ever"**

### Step 3: Configure Project Settings
Vercel will auto-detect Next.js, but verify these settings:

**Framework Preset:** Next.js (auto-detected)  
**Root Directory:** Click "Edit" and set to: `Saree4ever-24th-Nov-25/saree4ever/frontend`

**Build Settings:**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default, auto-detected)
- **Install Command:** `npm install` (default)

### Step 4: Add Environment Variables
**⚠️ IMPORTANT:** Add these before deploying:

Click **"Environment Variables"** section and add:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_url` | Get from Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Get from Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_API_URL` | `your_backend_url/api` | Your backend API URL |

**Make sure to:**
- ✅ Check "Production"
- ✅ Check "Preview"  
- ✅ Check "Development"

### Step 5: Deploy
1. Click **"Deploy"** button
2. Wait for the build to complete (usually 1-3 minutes)
3. Your site will be live at: `your-project.vercel.app`

### Step 6: Verify Deployment
1. Visit your deployment URL
2. Check that the site loads correctly
3. Test key pages (homepage, products, etc.)

---

## 📋 Where to Find Your Values

### Supabase Credentials:
1. Go to **https://supabase.com/dashboard**
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend API URL:
- If backend is deployed: Use that URL + `/api`
- Example: `https://your-backend.vercel.app/api`
- Or: `https://your-backend.railway.app/api`

---

## 🔧 Post-Deployment

### Custom Domain (Optional)
1. Go to **Project Settings → Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### Monitor Deployments
- View build logs in the **Deployments** tab
- Check function logs for errors
- Monitor performance metrics

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (Vercel uses 18.x by default)

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new variables
- Check that variables are set for the correct environment

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend CORS allows your Vercel domain
- Check backend is deployed and accessible

---

## ✅ Quick Checklist

- [ ] Signed in to Vercel
- [ ] Imported repository from GitHub
- [ ] Set Root Directory to `Saree4ever-24th-Nov-25/saree4ever/frontend`
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `NEXT_PUBLIC_API_URL`
- [ ] Clicked Deploy
- [ ] Verified site is live

---

**Your frontend will be live on Vercel! 🎉**




