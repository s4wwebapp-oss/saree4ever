# How to Get DATABASE_URL for Prisma

## Current Status

The `DATABASE_URL` in `.env` is currently set to the Supabase API URL, but **Prisma requires the actual PostgreSQL connection string**.

## Steps to Get the Correct DATABASE_URL

### Method 1: From Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/vjgxuamvrnmulvdajvid/settings/database

2. **Find Connection String**
   - Scroll to "Connection string" section
   - Select **"Connection pooling"** tab (recommended for Prisma)
   - Or use **"URI"** format

3. **Copy the Connection String**
   
   **Option A: Connection Pooling (Recommended)**
   ```
   postgresql://postgres.vjgxuamvrnmulvdajvid:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
   
   **Option B: Direct Connection (URI)**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.vjgxuamvrnmulvdajvid.supabase.co:5432/postgres
   ```

4. **Replace [YOUR-PASSWORD]**
   - Use your database password (not the API keys)
   - If you forgot it, reset it in Supabase Dashboard

5. **Update backend/.env**
   ```env
   DATABASE_URL=postgresql://postgres:S$WWEBAPP123!@#@db.vjgxuamvrnmulvdajvid.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```

### Method 2: Using Supabase Client (Alternative)

If you prefer to use Supabase client instead of Prisma, you can skip DATABASE_URL and use:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (already configured)

The backend is already set up to use Supabase client, so Prisma is optional.

## Test the Connection

After updating DATABASE_URL:

```bash
cd backend
npx prisma db pull  # Pull schema from database
npx prisma generate # Generate Prisma client
```

## Current Configuration

✅ **Supabase Client** - Already configured and working
- Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- All API routes use Supabase client

⚠️ **Prisma** - Needs DATABASE_URL update
- Only needed if you want to use Prisma ORM
- Can skip if using Supabase client only

## Recommendation

Since you're already using Supabase client in all routes, you can:
1. **Option A**: Update DATABASE_URL for Prisma (if you want both)
2. **Option B**: Continue using Supabase client only (simpler, already working)

Both approaches work! Supabase client is already integrated and working.

