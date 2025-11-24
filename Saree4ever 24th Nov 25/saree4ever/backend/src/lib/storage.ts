import { supabase } from './supabase';

const BUCKET_NAME = 'product-media';

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
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
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
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

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
 * List all images in the bucket (with optional prefix filter)
 * @param prefix - Optional prefix to filter files (e.g., product ID)
 * @returns Array of file objects
 */
export const listProductImages = async (prefix?: string) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
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


