# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in (or create an account)

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)
   - Or drag and drop the `frontend` folder

3. **Configure the project:**
   - **Root Directory:** Set to `frontend` (if deploying from monorepo)
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_API_URL=your_backend_api_url
     ```
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts to link your project
   - When asked about environment variables, you can add them now or later in the dashboard

5. **For production deployment:**
   ```bash
   vercel --prod
   ```

## Environment Variables

Make sure to set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `NEXT_PUBLIC_API_URL` | Your backend API URL (e.g., `https://api.yourdomain.com/api`) | Recommended |

## Post-Deployment

1. **Verify deployment:**
   - Visit your Vercel URL
   - Check that the site loads correctly
   - Test key functionality (product browsing, cart, etc.)

2. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Monitor:**
   - Check Vercel Dashboard for build logs
   - Monitor function logs for any errors
   - Set up error tracking (Sentry, etc.)

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables
- Check that variables are set for the correct environment (Production/Preview)

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Ensure backend CORS allows your Vercel domain
- Check backend is deployed and accessible

## Next Steps

- Set up automatic deployments from Git (enabled by default)
- Configure preview deployments for pull requests
- Set up monitoring and analytics
- Configure custom domain and SSL

---

**Your frontend is now live on Vercel! 🚀**

