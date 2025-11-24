import { supabase } from './supabase';

// Storage bucket names
export const BUCKETS = {
  PRODUCT_MEDIA: 'product-media',
  HERO_SLIDES: 'hero-slides',
  COLLECTIONS: 'collections',
  TESTIMONIALS: 'testimonials',
  BLOG_MEDIA: 'blog-media',
} as const;

type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Generic function to upload an image to any bucket (Backend)
 */
const uploadImage = async (
  fileBuffer: Buffer,
  bucketName: BucketName,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: false,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
};

/**
 * Generic function to delete an image from any bucket
 */
const deleteImage = async (
  bucketName: BucketName,
  filePath: string
): Promise<void> => {
  // Extract filename from full URL if needed
  const fileName = filePath.includes('/') 
    ? filePath.split('/').pop() || filePath
    : filePath;

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([fileName]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Generic function to get public URL for an image
 */
const getImageUrl = (bucketName: BucketName, filePath: string): string => {
  // If already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Extract filename from path if needed
  const fileName = filePath.includes('/') 
    ? filePath.split('/').pop() || filePath
    : filePath;

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
};

// ============================================
// PRODUCT IMAGE FUNCTIONS
// ============================================

/**
 * Upload a product image to Supabase Storage (Backend)
 * @param fileBuffer - The image file buffer
 * @param fileName - The name for the file
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded image
 */
export const uploadProductImage = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  return uploadImage(fileBuffer, BUCKETS.PRODUCT_MEDIA, fileName, contentType);
};

/**
 * Delete a product image from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export const deleteProductImage = async (filePath: string): Promise<void> => {
  return deleteImage(BUCKETS.PRODUCT_MEDIA, filePath);
};

/**
 * Get the public URL for a product image
 * @param filePath - The path of the file
 * @returns The public URL
 */
export const getProductImageUrl = (filePath: string): string => {
  return getImageUrl(BUCKETS.PRODUCT_MEDIA, filePath);
};

/**
 * List all images in the product-media bucket (with optional prefix filter)
 * @param prefix - Optional prefix to filter files (e.g., product ID)
 * @returns Array of file objects
 */
export const listProductImages = async (prefix?: string) => {
  const { data, error } = await supabase.storage
    .from(BUCKETS.PRODUCT_MEDIA)
    .list(prefix || '', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  return data || [];
};

// ============================================
// HERO SLIDE IMAGE FUNCTIONS
// ============================================

/**
 * Upload a hero slide image to Supabase Storage (Backend)
 * @param fileBuffer - The image file buffer
 * @param fileName - The name for the file
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded image
 */
export const uploadHeroSlideImage = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  return uploadImage(fileBuffer, BUCKETS.HERO_SLIDES, fileName, contentType);
};

/**
 * Delete a hero slide image from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export const deleteHeroSlideImage = async (filePath: string): Promise<void> => {
  return deleteImage(BUCKETS.HERO_SLIDES, filePath);
};

/**
 * Get the public URL for a hero slide image
 * @param filePath - The path of the file
 * @returns The public URL
 */
export const getHeroSlideImageUrl = (filePath: string): string => {
  return getImageUrl(BUCKETS.HERO_SLIDES, filePath);
};

// ============================================
// COLLECTION IMAGE FUNCTIONS
// ============================================

/**
 * Upload a collection image to Supabase Storage (Backend)
 * @param fileBuffer - The image file buffer
 * @param fileName - The name for the file
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded image
 */
export const uploadCollectionImage = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  return uploadImage(fileBuffer, BUCKETS.COLLECTIONS, fileName, contentType);
};

/**
 * Delete a collection image from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export const deleteCollectionImage = async (filePath: string): Promise<void> => {
  return deleteImage(BUCKETS.COLLECTIONS, filePath);
};

/**
 * Get the public URL for a collection image
 * @param filePath - The path of the file
 * @returns The public URL
 */
export const getCollectionImageUrl = (filePath: string): string => {
  return getImageUrl(BUCKETS.COLLECTIONS, filePath);
};

// ============================================
// TESTIMONIAL IMAGE FUNCTIONS
// ============================================

/**
 * Upload a testimonial image to Supabase Storage (Backend)
 * @param fileBuffer - The image file buffer
 * @param fileName - The name for the file
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded image
 */
export const uploadTestimonialImage = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  return uploadImage(fileBuffer, BUCKETS.TESTIMONIALS, fileName, contentType);
};

/**
 * Delete a testimonial image from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export const deleteTestimonialImage = async (filePath: string): Promise<void> => {
  return deleteImage(BUCKETS.TESTIMONIALS, filePath);
};

/**
 * Get the public URL for a testimonial image
 * @param filePath - The path of the file
 * @returns The public URL
 */
export const getTestimonialImageUrl = (filePath: string): string => {
  return getImageUrl(BUCKETS.TESTIMONIALS, filePath);
};

// ============================================
// BLOG MEDIA FUNCTIONS
// ============================================

/**
 * Upload a blog article image to Supabase Storage (Backend)
 * @param fileBuffer - The image file buffer
 * @param fileName - The name for the file
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded image
 */
export const uploadBlogImage = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  return uploadImage(fileBuffer, BUCKETS.BLOG_MEDIA, fileName, contentType);
};

/**
 * Delete a blog article image from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export const deleteBlogImage = async (filePath: string): Promise<void> => {
  return deleteImage(BUCKETS.BLOG_MEDIA, filePath);
};

/**
 * Get the public URL for a blog article image
 * @param filePath - The path of the file
 * @returns The public URL
 */
export const getBlogImageUrl = (filePath: string): string => {
  return getImageUrl(BUCKETS.BLOG_MEDIA, filePath);
};
