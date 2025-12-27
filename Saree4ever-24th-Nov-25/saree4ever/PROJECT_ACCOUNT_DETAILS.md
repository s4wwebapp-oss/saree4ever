# Saree4ever - Project Account Details

This document contains all account and service information for the Saree4ever project.

---

## 🔗 GitHub Repository

**Repository URL:**  
`https://github.com/s4wwebapp-oss/saree4ever`

**Remote Configuration:**
- **Origin:** `https://github.com/s4wwebapp-oss/saree4ever.git`
- **Organization/User:** `s4wwebapp-oss`
- **Repository Name:** `saree4ever`
- **Default Branch:** `main`

**Access:**
- Repository is connected via HTTPS
- Requires GitHub authentication to push/pull

---

## 🗄️ Database - Supabase

**Project URL:**  
`https://vjgxuamvrnmulvdajvid.supabase.co`

**Dashboard Access:**
- **Dashboard URL:** `https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid`
- **Project Reference ID:** `vjgxuamvrnmulvdajvid`

**Database Connection:**
- **Host:** `db.vjgxuamvrnmulvdajvid.supabase.co`
- **Port:** `5432` (Direct) or `6543` (Connection Pooling)
- **Database Name:** `postgres`
- **User:** `postgres`
- **Connection String Format:**
  ```
  postgresql://postgres:[PASSWORD]@db.vjgxuamvrnmulvdajvid.supabase.co:5432/postgres
  ```

**API Keys:**
- **Anon Key:** Configured in environment variables (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
- **Service Role Key:** Configured in backend environment (keep secret!)
- **API Keys Location:** Supabase Dashboard → Settings → API

**Storage:**
- Supabase Storage is used for file uploads (images, media)
- Buckets configured for product media, blog images, etc.

---

## 🚀 Hosting Accounts

### Frontend - Vercel

**Platform:** Vercel  
**Framework:** Next.js 16  
**Deployment Method:** GitHub integration (automatic deployments)

**Configuration:**
- **Root Directory:** `frontend/` (or `Saree4ever-24th-Nov-25/saree4ever/frontend` in monorepo)
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

**Environment Variables (Required):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_API_URL` - Backend API URL

**Access:**
- Dashboard: `https://vercel.com`
- Sign in with GitHub account
- Project linked to: `s4wwebapp-oss/saree4ever`

**Deployment URL Format:**
- Production: `your-project.vercel.app`
- Preview: Auto-generated for each branch/PR

---

### Backend - Render

**Platform:** Render  
**Service Type:** Web Service  
**Runtime:** Node.js  
**Deployment Method:** GitHub integration

**Configuration:**
- **Root Directory:** `backend/` (or `Saree4ever-24th-Nov-25/saree4ever/backend` in monorepo)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** Auto-assigned by Render (typically `10000`)

**Environment Variables (Required):**
- `PORT` - Server port (auto-set by Render)
- `NODE_ENV` - Set to `production`
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `JWT_SECRET` - JWT token secret
- `FRONTEND_URL` - Frontend deployment URL

**Access:**
- Dashboard: `https://render.com`
- Sign in with GitHub account
- Repository: `s4wwebapp-oss/saree4ever`

**Service URL Format:**
- `https://your-service-name.onrender.com`

---

## 💳 Payment Providers

### Stripe
**Status:** Configured (optional)  
**Environment Variables:**
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with `sk_live_` or `sk_test_`)
- `STRIPE_WEBHOOK_SECRET` - Webhook secret (starts with `whsec_`)

**Dashboard:** `https://dashboard.stripe.com`  
**Usage:** Payment processing for orders

---

### Razorpay
**Status:** Configured (optional)  
**Environment Variables:**
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `RAZORPAY_WEBHOOK_SECRET` - Webhook secret

**Dashboard:** `https://dashboard.razorpay.com`  
**Usage:** Payment processing for orders (India-focused)

---

## 📧 Email Service

**Provider:** Gmail SMTP (via Nodemailer)  
**Configuration:**
- **SMTP Host:** `smtp.gmail.com`
- **SMTP Port:** `587`
- **SMTP User:** Configured in environment variables
- **SMTP Pass:** Gmail App Password (not regular password)

**Environment Variables:**
- `SMTP_HOST` - `smtp.gmail.com`
- `SMTP_PORT` - `587`
- `SMTP_USER` - Your Gmail address
- `SMTP_PASS` - Gmail App Password
- `EMAIL_ENABLED` - `true` or `false`
- `FROM_EMAIL` - `noreply@saree4ever.com`
- `FROM_NAME` - `Saree4Ever`

**Setup:**
1. Enable 2-factor authentication on Gmail
2. Generate App Password: `https://myaccount.google.com/apppasswords`
3. Use App Password in `SMTP_PASS`

---

## 🔐 Authentication & Security

**JWT Configuration:**
- **JWT Secret:** Configured in environment variables
- **Generation Command:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

**Admin Access:**
- **Admin Emails:** Configured via `ADMIN_EMAILS` environment variable
- **Default:** `admin@saree4ever.com`

---

## 📁 Environment Files Location

**Backend:**
- **File:** `backend/.env`
- **Status:** ⚠️ Not committed to Git (in `.gitignore`)

**Frontend:**
- **File:** `frontend/.env.local`
- **Status:** ⚠️ Not committed to Git (in `.gitignore`)

---

## 🔍 Quick Access Links

### Dashboards
- **GitHub:** `https://github.com/s4wwebapp-oss/saree4ever`
- **Supabase:** `https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid`
- **Vercel:** `https://vercel.com` (sign in with GitHub)
- **Render:** `https://render.com` (sign in with GitHub)
- **Stripe:** `https://dashboard.stripe.com`
- **Razorpay:** `https://dashboard.razorpay.com`

### Project-Specific URLs
- **Supabase Project:** `https://vjgxuamvrnmulvdajvid.supabase.co`
- **Supabase Database Settings:** `https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid/settings/database`
- **Supabase API Settings:** `https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid/settings/api`

---

## 📝 Notes

1. **Credentials Security:**
   - Never commit `.env` or `.env.local` files
   - All sensitive keys are stored in environment variables
   - Service role keys should never be exposed in frontend code

2. **Database Access:**
   - Use Supabase Dashboard for database management
   - Connection strings require database password (not API keys)
   - Use connection pooling for Prisma/ORM connections

3. **Deployment:**
   - Frontend auto-deploys on push to `main` branch (Vercel)
   - Backend auto-deploys on push to `main` branch (Render)
   - Environment variables must be set in hosting dashboards

4. **Payment Providers:**
   - Both Stripe and Razorpay are configured but optional
   - Use test keys for development, live keys for production
   - Webhook endpoints must be configured for payment callbacks

---

## 🔄 Update Instructions

To update any account details:

1. **GitHub:** Update remote URL if repository changes
   ```bash
   git remote set-url origin <new-url>
   ```

2. **Supabase:** Update environment variables in:
   - `backend/.env`
   - `frontend/.env.local`
   - Vercel Dashboard (Environment Variables)
   - Render Dashboard (Environment Variables)

3. **Hosting:** Update environment variables in respective dashboards:
   - Vercel: Project Settings → Environment Variables
   - Render: Service Settings → Environment

---

**Last Updated:** Generated from project configuration files  
**Project:** Saree4ever E-commerce Platform







