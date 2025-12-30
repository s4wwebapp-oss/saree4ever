-- Fix RLS policies for Supabase Storage buckets
-- Run this in Supabase SQL Editor

-- First, ensure the 'products' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure 'hero-slides' bucket exists and is public  
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure 'general' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('general', 'general', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure 'videos' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access on products" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to products" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on products" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access on hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to hero-slides" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to hero-slides" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access on general" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to general" ON storage.objects;

DROP POLICY IF EXISTS "Allow public read access on videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to videos" ON storage.objects;

-- =====================================================
-- PRODUCTS BUCKET POLICIES
-- =====================================================

-- Allow anyone to read/view product images
CREATE POLICY "Allow public read access on products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users (admins) to upload to products bucket
CREATE POLICY "Allow authenticated uploads to products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to update products bucket
CREATE POLICY "Allow authenticated update on products"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to delete from products bucket
CREATE POLICY "Allow authenticated delete on products"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- HERO-SLIDES BUCKET POLICIES
-- =====================================================

CREATE POLICY "Allow public read access on hero-slides"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-slides');

CREATE POLICY "Allow authenticated uploads to hero-slides"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-slides'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated update on hero-slides"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-slides'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated delete on hero-slides"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-slides'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- GENERAL BUCKET POLICIES
-- =====================================================

CREATE POLICY "Allow public read access on general"
ON storage.objects FOR SELECT
USING (bucket_id = 'general');

CREATE POLICY "Allow authenticated uploads to general"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'general'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated update on general"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'general'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated delete on general"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'general'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- VIDEOS BUCKET POLICIES
-- =====================================================

CREATE POLICY "Allow public read access on videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Allow authenticated uploads to videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated update on videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated delete on videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);
