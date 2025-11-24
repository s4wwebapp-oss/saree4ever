# Complete Storage Buckets Setup Guide

This guide covers all storage buckets for the Saree4ever application.

## Storage Buckets Overview

The application uses **5 Supabase Storage buckets** to organize different types of media:

| Bucket Name | Purpose | Database Fields |
|------------|---------|----------------|
| `product-media` | Product images | `products.primary_image_url`, `products.image_urls[]` |
| `hero-slides` | Hero carousel images | `hero_slides.image_url` |
| `collections` | Collection cover images | `collections.image_url` |
| `testimonials` | Customer testimonial photos | `testimonials.image_url` |
| `blog-media` | Blog article featured images | `blog_articles.featured_image_url` |

## Setup Instructions

### Method 1: Via Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar
   - Click **"New query"**

2. **Run the SQL Script**
   - Open the file: `docs/CREATE_ALL_STORAGE_BUCKETS.sql`
   - Copy and paste the entire contents into the SQL Editor
   - Click **"Run"** to execute

3. **Verify the Buckets**
   - Go to **Storage** in the Supabase dashboard
   - You should see all 5 buckets listed:
     - ✅ `product-media`
     - ✅ `hero-slides`
     - ✅ `collections`
     - ✅ `testimonials`
     - ✅ `blog-media`
   - Verify each bucket is marked as **"Public"**

### Method 2: Via Supabase Dashboard (Manual)

For each bucket, follow these steps:

1. **Go to Storage**
   - Open your Supabase project dashboard
   - Navigate to **Storage** in the left sidebar
   - Click **"New bucket"** or **"Create bucket"**

2. **Configure Each Bucket**
   - **Name**: Use one of the bucket names above
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 5MB (recommended for images)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`

3. **Repeat for All Buckets**
   - Create all 5 buckets listed above

## Storage URL Format

Once uploaded, images will be accessible at:

```
https://{your-project-id}.supabase.co/storage/v1/object/public/{bucket-name}/{file-path}
```

Example:
```
https://vjgxuamvrnmulvdajvid.supabase.co/storage/v1/object/public/product-media/products/abc123-1234567890-xyz.jpg
```

## Usage in Your Application

### Frontend (Next.js)

```typescript
import {
  uploadProductImage,
  uploadHeroSlideImage,
  uploadCollectionImage,
  uploadTestimonialImage,
  uploadBlogImage,
} from '@/lib/storage';

// Upload product image
const productImageUrl = await uploadProductImage(file, productId);

// Upload hero slide image
const heroImageUrl = await uploadHeroSlideImage(file, slideId);

// Upload collection image
const collectionImageUrl = await uploadCollectionImage(file, collectionId);

// Upload testimonial image
const testimonialImageUrl = await uploadTestimonialImage(file, testimonialId);

// Upload blog image
const blogImageUrl = await uploadBlogImage(file, articleId);
```

### Backend (Express/Node.js)

```typescript
import {
  uploadProductImage,
  uploadHeroSlideImage,
  uploadCollectionImage,
  uploadTestimonialImage,
  uploadBlogImage,
} from './src/lib/storage';

// Upload product image (from multer or similar)
const productImageUrl = await uploadProductImage(
  fileBuffer,
  fileName,
  contentType
);

// Upload hero slide image
const heroImageUrl = await uploadHeroSlideImage(
  fileBuffer,
  fileName,
  contentType
);

// Upload collection image
const collectionImageUrl = await uploadCollectionImage(
  fileBuffer,
  fileName,
  contentType
);

// Upload testimonial image
const testimonialImageUrl = await uploadTestimonialImage(
  fileBuffer,
  fileName,
  contentType
);

// Upload blog image
const blogImageUrl = await uploadBlogImage(
  fileBuffer,
  fileName,
  contentType
);
```

## File Organization

Files are organized within each bucket using prefixes:

- **Product Media**: `products/{productId}-{timestamp}-{random}.{ext}`
- **Hero Slides**: `slides/{slideId}-{timestamp}-{random}.{ext}`
- **Collections**: `collections/{collectionId}-{timestamp}-{random}.{ext}`
- **Testimonials**: `testimonials/{testimonialId}-{timestamp}-{random}.{ext}`
- **Blog Media**: `articles/{articleId}-{timestamp}-{random}.{ext}`

## Storage Policies

All buckets have the following policies configured:

1. **Public Read Access**: Anyone can view images (for public website)
2. **Authenticated Upload**: Only authenticated users can upload
3. **Authenticated Update**: Only authenticated users can update
4. **Authenticated Delete**: Only authenticated users can delete

## Best Practices

1. **File Naming**: Use unique names with timestamps and random strings
2. **File Size**: Compress images before uploading (recommended: < 1MB)
3. **File Types**: Only allow image types (JPEG, PNG, WebP, GIF)
4. **Organization**: Use prefixes to organize files within buckets
5. **Cleanup**: Delete old images when content is removed
6. **CDN**: Consider using a CDN in front of Supabase Storage for better performance

## Migration from External URLs

If you're currently using external URLs (like Unsplash) in your database:

1. Upload images to the appropriate Supabase Storage bucket
2. Get the public URL from the upload function
3. Update the database record with the new Supabase Storage URL

Example migration:
```typescript
// Old: External URL
const oldUrl = 'https://images.unsplash.com/photo-123...';

// New: Supabase Storage URL
const newUrl = await uploadProductImage(file, productId);

// Update database
await updateProduct(productId, { primary_image_url: newUrl });
```

## Troubleshooting

### Bucket Not Found
- Verify the bucket exists in Supabase Dashboard → Storage
- Check the bucket name matches exactly (case-sensitive)

### Upload Permission Denied
- Verify you're authenticated (logged in)
- Check storage policies are correctly configured
- Ensure the bucket is set to "Public" for read access

### Image Not Displaying
- Verify the URL is correct
- Check the bucket is public
- Ensure the file path in the URL matches the uploaded file path

## Next Steps

1. ✅ Run the SQL script to create all buckets
2. ✅ Verify buckets in Supabase Dashboard
3. ✅ Test uploading an image using the storage utilities
4. ✅ Update admin panel to use new storage functions
5. ✅ Migrate existing external URLs to Supabase Storage (optional)

---

**Last Updated**: 2025-01-XX
**Status**: ✅ Complete


