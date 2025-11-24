# Environment Variables Setup Guide

## Required Keys

Your backend `.env` file needs these keys to communicate with the database and external services.

## 1. JWT Secret

**Purpose**: Used to sign and verify JWT tokens for authentication.

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to `.env`:**
```env
JWT_SECRET=your_generated_hex_string_here
```

⚠️ **Important**: 
- Use a long, random string (at least 32 characters)
- Never commit this to git
- Use different secrets for development and production

## 2. Payment Gateway Keys

### Stripe (International Payments)

1. **Sign up**: https://stripe.com
2. **Get API keys**: Dashboard → Developers → API keys
3. **Add to `.env`:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Razorpay (Indian Payments)

1. **Sign up**: https://razorpay.com
2. **Get API keys**: Dashboard → Settings → API Keys
3. **Add to `.env`:**
   ```env
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_secret_here
   ```

## 3. Email Configuration

**For Gmail:**
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. **Add to `.env`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

## Complete .env Template

```env
# Server
PORT=5001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://vjgxuamvrnmulvdajvid.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# JWT
JWT_SECRET=your_generated_secret_here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Security Best Practices

1. ✅ **Never commit `.env` to git** (already in `.gitignore`)
2. ✅ **Use different keys for development and production**
3. ✅ **Rotate secrets regularly**
4. ✅ **Use environment-specific values**
5. ✅ **Keep service role keys secret** (never expose to frontend)

## Testing Your Configuration

After setting up keys, test the connection:

```bash
cd backend
npm run dev
```

Check the console for:
- ✅ Supabase connection successful
- ✅ Prisma connection successful

## Next Steps

1. Generate JWT secret
2. Set up Stripe account (optional)
3. Set up Razorpay account (optional)
4. Configure email (optional)
5. Test the backend server

---

**Status**: Update your `.env` file with actual keys before deploying!

