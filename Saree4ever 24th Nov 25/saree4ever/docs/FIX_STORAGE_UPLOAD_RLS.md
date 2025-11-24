# Fix Storage Upload RLS Error

## Error
```
Failed to upload image: new row violates row-level security policy
```

## Problem
The Supabase storage bucket has RLS policies that require authentication, but the frontend Supabase client is not authenticated with a Supabase session.

## Solution Options

### Option 1: Create Backend Upload Endpoint (Recommended)
Create a backend API endpoint that handles uploads using the service role key, which bypasses RLS.

### Option 2: Authenticate Supabase Client
Set up Supabase authentication for admin users and use their session token.

### Option 3: Update RLS Policies
Modify RLS policies to allow uploads without authentication (less secure).

## Quick Fix: Run Storage Bucket Setup SQL

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `docs/CREATE_ALL_STORAGE_BUCKETS.sql`
3. This will create the `hero-slides` bucket and set up proper RLS policies

## Recommended: Create Backend Upload Endpoint

The best solution is to create a backend endpoint that handles uploads using the service role key.


