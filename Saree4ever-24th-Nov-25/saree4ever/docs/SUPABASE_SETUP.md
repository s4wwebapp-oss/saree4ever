# Supabase Setup Guide

This project uses Supabase for authentication and database services.

## Getting Started

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be set up

### 2. Get Your Supabase Credentials

1. Go to your project settings
2. Navigate to **API** section
3. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`) - Keep this secret!

### 3. Configure Frontend

1. Navigate to `frontend/` directory
2. Create a `.env.local` file:
```bash
cd frontend
cp .env.example .env.local
```

3. Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Configure Backend

1. Navigate to `backend/` directory
2. Create a `.env` file:
```bash
cd backend
cp .env.example .env
```

3. Add your Supabase credentials:
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Usage

### Frontend

```typescript
import { supabase } from '@/lib/supabase';

// Example: Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Example: Query data
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

### Backend

```typescript
import { supabase } from './lib/supabase';

// Example: Query with service role (admin access)
const { data, error } = await supabase
  .from('your_table')
  .select('*');
```

## Security Notes

- **Never commit** `.env` or `.env.local` files
- **Never expose** your `service_role` key in frontend code
- Use `anon` key for frontend, `service_role` key only in backend
- The `service_role` key bypasses Row Level Security (RLS)

## Testing Connection

### Frontend
Visit the homepage - there's a Supabase connection test component.

### Backend
```bash
curl http://localhost:5001/api/auth/health
```

## Next Steps

1. Set up your database schema in Supabase
2. Configure Row Level Security (RLS) policies
3. Set up authentication providers (email, OAuth, etc.)
4. Create your tables and relationships

