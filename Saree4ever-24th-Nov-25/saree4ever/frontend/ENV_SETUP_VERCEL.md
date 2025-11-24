# Environment Variables Setup for Vercel

## ⚠️ IMPORTANT: Add These Environment Variables

Your deployment succeeded, but you need to add environment variables for the app to work properly.

## Steps to Add Environment Variables:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/abhisheks-projects-1d6bf3cc/frontend/settings/environment-variables

2. **Add the following variables:**

   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Get this from your Supabase dashboard |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Get this from your Supabase dashboard |
   | `NEXT_PUBLIC_API_URL` | Your backend API URL | e.g., `https://api.yourdomain.com/api` or your backend URL |

3. **Apply to all environments:**
   - Check ✅ Production
   - Check ✅ Preview  
   - Check ✅ Development

4. **Redeploy:**
   - After adding variables, go to Deployments tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

## Where to Find Your Values:

### Supabase Credentials:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend API URL:
- If your backend is deployed, use that URL (e.g., `https://your-backend.vercel.app/api`)
- If backend is on a different platform, use that URL
- For local development, use `http://localhost:5001/api`

## After Adding Variables:

Once you've added the environment variables and redeployed, your site should work correctly!

**Current Deployment URL:** https://frontend-rj0yhjbe5-abhisheks-projects-1d6bf3cc.vercel.app

