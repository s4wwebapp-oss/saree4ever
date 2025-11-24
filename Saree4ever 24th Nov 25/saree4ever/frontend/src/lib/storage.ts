import { supabase } from './supabase';

const BUCKET_NAME = 'product-media';

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
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `${productId}-${timestamp}-${randomString}.${fileExt}`;
  const filePath = fileName;

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Delete a product image from Supabase Storage
 * @param filePath - The path of the file to delete
 */
export const deleteProductImage = async (filePath: string): Promise<void> => {
  // Extract filename from full URL if needed
  const fileName = filePath.includes('/') 
    ? filePath.split('/').pop() || filePath
    : filePath;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([fileName]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Get the public URL for a product image
 * @param filePath - The path of the file
 * @returns The public URL
 */
export const getProductImageUrl = (filePath: string): string => {
  // If already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Extract filename from path if needed
  const fileName = filePath.includes('/') 
    ? filePath.split('/').pop() || filePath
    : filePath;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl;
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
    .from(BUCKET_NAME)
    .list('', {
      search: productId,
    });

  if (error) {
    throw new Error(`Failed to list images: ${error.message}`);
  }

  return data?.map((file) => file.name) || [];
};

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

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    };
  }

  return { valid: true };
};


