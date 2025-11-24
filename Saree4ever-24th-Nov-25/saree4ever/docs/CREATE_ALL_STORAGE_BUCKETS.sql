-- Create all storage buckets for Saree4ever
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. PRODUCT MEDIA BUCKET (already exists, but included for completeness)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- 2. HERO SLIDES BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- 3. COLLECTIONS BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('collections', 'collections', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- 4. TESTIMONIALS BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonials', 'testimonials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- 5. BLOG MEDIA BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- DROP EXISTING POLICIES (for idempotency)
-- ============================================
DROP POLICY IF EXISTS "Public Access - Read Product Media" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Read Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Read Collections" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Read Testimonials" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Read Blog Media" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload Product Media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload Collections" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload Testimonials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload Blog Media" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can update Product Media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update Collections" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update Testimonials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update Blog Media" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can delete Product Media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete Hero Slides" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete Collections" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete Testimonials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete Blog Media" ON storage.objects;

-- ============================================
-- STORAGE POLICIES - PUBLIC READ ACCESS
-- ============================================

-- Product Media - Public Read
CREATE POLICY "Public Access - Read Product Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-media');

-- Hero Slides - Public Read
CREATE POLICY "Public Access - Read Hero Slides"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-slides');

-- Collections - Public Read
CREATE POLICY "Public Access - Read Collections"
ON storage.objects FOR SELECT
USING (bucket_id = 'collections');

-- Testimonials - Public Read
CREATE POLICY "Public Access - Read Testimonials"
ON storage.objects FOR SELECT
USING (bucket_id = 'testimonials');

-- Blog Media - Public Read
CREATE POLICY "Public Access - Read Blog Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-media');

-- ============================================
-- STORAGE POLICIES - AUTHENTICATED UPLOAD
-- ============================================

-- Product Media - Authenticated Upload
CREATE POLICY "Authenticated users can upload Product Media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' 
  AND auth.role() = 'authenticated'
);

-- Hero Slides - Authenticated Upload
CREATE POLICY "Authenticated users can upload Hero Slides"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hero-slides' 
  AND auth.role() = 'authenticated'
);

-- Collections - Authenticated Upload
CREATE POLICY "Authenticated users can upload Collections"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'collections' 
  AND auth.role() = 'authenticated'
);

-- Testimonials - Authenticated Upload
CREATE POLICY "Authenticated users can upload Testimonials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- Blog Media - Authenticated Upload
CREATE POLICY "Authenticated users can upload Blog Media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-media' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- STORAGE POLICIES - AUTHENTICATED UPDATE
-- ============================================

-- Product Media - Authenticated Update
CREATE POLICY "Authenticated users can update Product Media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-media' 
  AND auth.role() = 'authenticated'
);

-- Hero Slides - Authenticated Update
CREATE POLICY "Authenticated users can update Hero Slides"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hero-slides' 
  AND auth.role() = 'authenticated'
);

-- Collections - Authenticated Update
CREATE POLICY "Authenticated users can update Collections"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'collections' 
  AND auth.role() = 'authenticated'
);

-- Testimonials - Authenticated Update
CREATE POLICY "Authenticated users can update Testimonials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- Blog Media - Authenticated Update
CREATE POLICY "Authenticated users can update Blog Media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-media' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- STORAGE POLICIES - AUTHENTICATED DELETE
-- ============================================

-- Product Media - Authenticated Delete
CREATE POLICY "Authenticated users can delete Product Media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-media' 
  AND auth.role() = 'authenticated'
);

-- Hero Slides - Authenticated Delete
CREATE POLICY "Authenticated users can delete Hero Slides"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hero-slides' 
  AND auth.role() = 'authenticated'
);

-- Collections - Authenticated Delete
CREATE POLICY "Authenticated users can delete Collections"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'collections' 
  AND auth.role() = 'authenticated'
);

-- Testimonials - Authenticated Delete
CREATE POLICY "Authenticated users can delete Testimonials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- Blog Media - Authenticated Delete
CREATE POLICY "Authenticated users can delete Blog Media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-media' 
  AND auth.role() = 'authenticated'
);


