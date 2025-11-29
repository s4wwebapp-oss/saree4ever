# Deploy Backend to Render - Complete Guide

## 🚀 Step-by-Step Deployment

### Step 1: Sign Up / Sign In to Render
1. Go to **https://render.com**
2. Sign up with your GitHub account (or sign in if you already have one)
3. Authorize Render to access your GitHub repositories

### Step 2: Create a New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repositories
4. Find and click on **"s4wwebapp-oss/saree4ever"**

### Step 3: Configure Your Service

#### Basic Settings:
- **Name:** `saree4ever-backend` (or your preferred name)
- **Region:** Choose closest to your users (e.g., `Oregon`, `Frankfurt`, `Singapore`)
- **Branch:** `main` (or your default branch)

#### Build & Deploy Settings:

**Root Directory:** 
```
Saree4ever-24th-Nov-25/saree4ever/backend
```

**Runtime:** `Node`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment:** `Node` (auto-detected)

### Step 4: Add Environment Variables

**⚠️ CRITICAL:** Add these environment variables before deploying:

Click **"Environment"** tab and add:

#### Required Environment Variables:

| Variable Name | Description | Where to Find |
|--------------|-------------|---------------|
| `PORT` | Server port (Render sets this automatically, but you can set it) | Usually `10000` or leave Render's default |
| `NODE_ENV` | Environment | Set to `production` |
| `DATABASE_URL` | PostgreSQL connection string | Your Supabase database URL or Render Postgres URL |
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API → service_role key |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API → anon/public key |
| `JWT_SECRET` | Secret key for JWT tokens | Generate a random string (e.g., `openssl rand -hex 32`) |
| `FRONTEND_URL` | Your frontend URL | `https://your-frontend.vercel.app` |

#### Optional Environment Variables:

| Variable Name | Description |
|--------------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (if using Stripe) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `RAZORPAY_KEY_ID` | Razorpay key ID (if using Razorpay) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `EMAIL_HOST` | SMTP host for emails |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your service
3. Wait for deployment to complete (usually 3-5 minutes)
4. Your API will be live at: `https://your-service-name.onrender.com`

### Step 6: Verify Deployment

1. Visit your service URL
2. Test the health endpoint: `https://your-service-name.onrender.com/health`
3. Test the API info: `https://your-service-name.onrender.com/api`

---

## 📋 Where to Find Your Values

### Supabase Credentials:
1. Go to **https://supabase.com/dashboard**
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)
   - **anon/public key** → `SUPABASE_ANON_KEY`

### Database URL:
**Option 1: Use Supabase Database**
- Go to Supabase Dashboard → Settings → Database
- Copy the connection string under "Connection string" → "URI"
- Format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

**Option 2: Use Render Postgres (Recommended for production)**
1. Create a new Postgres database on Render
2. Copy the Internal Database URL from Render dashboard
3. Use that as your `DATABASE_URL`

### JWT Secret:
Generate a secure random string:
```bash
openssl rand -hex 32
```
Or use an online generator: https://randomkeygen.com/

### Frontend URL:
Use your Vercel deployment URL:
- Example: `https://frontend-jfe9i7mtx-abhisheks-projects-1d6bf3cc.vercel.app`

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings
After deployment, update your frontend's `NEXT_PUBLIC_API_URL` to point to your Render backend:
```
NEXT_PUBLIC_API_URL=https://your-service-name.onrender.com/api
```

### 2. Run Database Migrations
If using Prisma, you may need to run migrations:
```bash
# In Render, you can use the Shell feature or add a build command:
npx prisma migrate deploy
```

### 3. Set Up Auto-Deploy
- Auto-deploy is enabled by default
- Every push to `main` branch will trigger a new deployment

---

## 🗄️ Setting Up Render Postgres (Optional but Recommended)

### Create Postgres Database:
1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name: `saree4ever-db`
3. Plan: Choose based on your needs (Free tier available)
4. Region: Same as your web service
5. Click **"Create Database"**
6. Copy the **Internal Database URL** and use it as `DATABASE_URL`

### Connect to Database:
- Use the **Internal Database URL** for your web service
- Use the **External Database URL** for local development

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use Render's environment variables** for all secrets
3. **Rotate secrets regularly**
4. **Use service role key only on backend** (never expose to frontend)
5. **Enable HTTPS** (automatic on Render)

---

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Render Dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (Render uses Node 18.x by default)

### Service Won't Start
- Check logs in Render Dashboard → Logs tab
- Verify `PORT` environment variable (Render sets this automatically)
- Ensure `npm start` command works locally

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check database is running and accessible
- Ensure database credentials are correct

### CORS Errors
- Update `FRONTEND_URL` environment variable
- Check CORS configuration in `server.js`
- Verify frontend URL matches exactly (including https://)

### Environment Variables Not Working
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)
- Verify variables are set for the correct environment

---

## 📊 Monitoring

### View Logs:
- Go to your service → **Logs** tab
- View real-time logs and errors

### Metrics:
- Monitor CPU, Memory, and Response times
- Set up alerts for errors

---

## ✅ Deployment Checklist

- [ ] Signed in to Render
- [ ] Created Web Service
- [ ] Set Root Directory to `Saree4ever-24th-Nov-25/saree4ever/backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Added `DATABASE_URL`
- [ ] Added `SUPABASE_URL`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added `SUPABASE_ANON_KEY`
- [ ] Added `JWT_SECRET`
- [ ] Added `FRONTEND_URL`
- [ ] Added `NODE_ENV=production`
- [ ] Deployed successfully
- [ ] Tested `/health` endpoint
- [ ] Updated frontend `NEXT_PUBLIC_API_URL`

---

## 🔗 Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **Your Services:** https://dashboard.render.com/web
- **Documentation:** https://render.com/docs

---

**Your backend will be live on Render! 🎉**

After deployment, don't forget to:
1. Update your frontend's `NEXT_PUBLIC_API_URL` environment variable
2. Redeploy your frontend on Vercel




