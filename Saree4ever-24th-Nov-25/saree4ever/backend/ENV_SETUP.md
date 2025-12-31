# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the backend directory with the following:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://vjgxuamvrnmulvdajvid.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database URL (for Prisma)
# Get this from Supabase Dashboard → Settings → Database → Connection String
# Use the "Connection pooling" URI for Prisma
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.vjgxuamvrnmulvdajvid.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
ADMIN_EMAILS=admin@saree4ever.com

# Email Configuration (for nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
EMAIL_ENABLED=true
FROM_EMAIL=noreply@saree4ever.com
FROM_NAME=Saree4Ever

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Payments (optional - configure the providers you use)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## How to Get Supabase Credentials

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid

2. **Get API Keys**
   - Settings → API
   - Copy `anon` key and `service_role` key

3. **Get Database URL**
   - Settings → Database
   - Under "Connection string", select "Connection pooling"
   - Copy the URI and replace `[YOUR-PASSWORD]` with your database password

## Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Email Setup (Gmail)

1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASS`

