# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Set all required environment variables
- [ ] Use production API keys (Stripe, database, etc.)
- [ ] Remove any test/development keys
- [ ] Verify all secrets are secure

### 2. Database Setup
- [ ] Create production PostgreSQL database
- [ ] Run migrations: `npm run migrate`
- [ ] Seed initial data if needed: `npm run seed`
- [ ] Test database connection

### 3. Stripe Configuration
- [ ] Switch to production Stripe keys
- [ ] Set up webhook endpoint
- [ ] Configure webhook events
- [ ] Test payment flow

### 4. Shipping Provider
- [ ] Set up EasyPost/Shiprocket account
- [ ] Configure API credentials
- [ ] Test shipment creation
- [ ] Set up webhook for tracking updates

### 5. Image Storage
- [ ] Set up S3/DigitalOcean Spaces
- [ ] Configure CORS
- [ ] Update image URLs in database
- [ ] Test image uploads

## Deployment Options

### Frontend - Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd nextjs-saree4sure
vercel
```

3. **Set Environment Variables:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add all variables from `.env.example`

4. **Configure:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Frontend - Netlify

1. **Build:**
```bash
cd nextjs-saree4sure
npm run build
```

2. **Deploy:**
- Connect GitHub repository
- Build command: `npm run build`
- Publish directory: `.next`
- Add environment variables

### Backend - Vercel Functions

1. **Structure:**
```
backend/
├── api/
│   ├── auth/
│   ├── products/
│   └── ...
└── vercel.json
```

2. **vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

### Backend - AWS Lambda

1. **Use Serverless Framework:**
```bash
npm install -g serverless
serverless create --template aws-nodejs-typescript
```

2. **Configure serverless.yml:**
```yaml
service: saree4ever-backend
provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
functions:
  api:
    handler: src/server.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

### Database - Supabase (Recommended)

1. **Create Project:**
- Go to supabase.com
- Create new project
- Copy connection string

2. **Run Migrations:**
```bash
cd backend
DATABASE_URL=your_supabase_url npm run migrate
```

3. **Update Environment:**
- Add Supabase URL to backend `.env`

## Post-Deployment

### 1. Testing
- [ ] Test homepage loads
- [ ] Test product browsing
- [ ] Test search functionality
- [ ] Test cart and checkout
- [ ] Test payment flow
- [ ] Test order tracking
- [ ] Test admin panel
- [ ] Test on mobile devices

### 2. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Google Analytics)
- [ ] Monitor API response times
- [ ] Set up uptime monitoring

### 3. Security
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Review API rate limiting
- [ ] Enable security headers
- [ ] Set up firewall rules

### 4. Performance
- [ ] Enable CDN (Cloudflare)
- [ ] Optimize images
- [ ] Enable caching
- [ ] Monitor bundle sizes

## Environment-Specific Configs

### Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:pass@prod_host:5432/saree4ever
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL=postgresql://staging_user:pass@staging_host:5432/saree4ever
STRIPE_SECRET_KEY=sk_test_...
```

## Rollback Plan

1. **Keep previous deployment:**
   - Vercel: Previous deployments available in dashboard
   - Netlify: Deploy history with rollback option

2. **Database backups:**
   - Regular automated backups
   - Manual backup before major changes

3. **Version control:**
   - Tag releases
   - Keep release notes

## Troubleshooting

### Common Issues

**Frontend not loading:**
- Check environment variables
- Verify build succeeded
- Check browser console for errors

**API errors:**
- Verify backend is running
- Check CORS configuration
- Verify API routes are correct

**Database connection:**
- Check connection string
- Verify database is accessible
- Check firewall rules

**Payment issues:**
- Verify Stripe keys are correct
- Check webhook configuration
- Review Stripe dashboard logs

---

**Ready for production deployment!** 🚀
