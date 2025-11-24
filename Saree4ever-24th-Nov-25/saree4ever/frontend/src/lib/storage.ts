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
 * Generic function to upload an image to any bucket
 */
const uploadImage = async (
  file: File,
  bucketName: BucketName,
  fileName: string
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
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
 * Upload a product image to Supabase Storage
 * @param file - The image file to upload
 * @param productId - The product ID to associate with the image
 * @returns The public URL of the uploaded image
 */
export const uploadProductImage = async (
  file: File,
  productId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `products/${productId}-${timestamp}-${randomString}.${fileExt}`;

  return uploadImage(file, BUCKETS.PRODUCT_MEDIA, fileName);
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
 * List all images for a product
 * @param productId - The product ID
 * @returns Array of file paths
 */
export const listProductImages = async (
  productId: string
): Promise<string[]> => {
  const { data, error } = await supabase.storage
    .from(BUCKETS.PRODUCT_MEDIA)
    .list('products', {
      search: productId,
    });

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  return data?.map((file) => file.name) || [];
};

// ============================================
// HERO SLIDE IMAGE FUNCTIONS
// ============================================

/**
 * Upload a hero slide image to Supabase Storage
 * @param file - The image file to upload
 * @param slideId - Optional slide ID to associate with the image
 * @returns The public URL of the uploaded image
 */
export const uploadHeroSlideImage = async (
  file: File,
  slideId?: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const prefix = slideId ? `slides/${slideId}` : 'slides';
  const fileName = `${prefix}-${timestamp}-${randomString}.${fileExt}`;

  return uploadImage(file, BUCKETS.HERO_SLIDES, fileName);
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
 * Upload a collection image to Supabase Storage
 * @param file - The image file to upload
 * @param collectionId - The collection ID to associate with the image
 * @returns The public URL of the uploaded image
 */
export const uploadCollectionImage = async (
  file: File,
  collectionId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `collections/${collectionId}-${timestamp}-${randomString}.${fileExt}`;

  return uploadImage(file, BUCKETS.COLLECTIONS, fileName);
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
 * Upload a testimonial image to Supabase Storage
 * @param file - The image file to upload
 * @param testimonialId - The testimonial ID to associate with the image
 * @returns The public URL of the uploaded image
 */
export const uploadTestimonialImage = async (
  file: File,
  testimonialId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `testimonials/${testimonialId}-${timestamp}-${randomString}.${fileExt}`;

  return uploadImage(file, BUCKETS.TESTIMONIALS, fileName);
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
 * Upload a blog article image to Supabase Storage
 * @param file - The image file to upload
 * @param articleId - The article ID to associate with the image
 * @returns The public URL of the uploaded image
 */
export const uploadBlogImage = async (
  file: File,
  articleId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `articles/${articleId}-${timestamp}-${randomString}.${fileExt}`;

  return uploadImage(file, BUCKETS.BLOG_MEDIA, fileName);
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

// ============================================
// VALIDATION
// ============================================

/**
 * Validate image file
 * @param file - The file to validate
 * @returns Validation result
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
};
