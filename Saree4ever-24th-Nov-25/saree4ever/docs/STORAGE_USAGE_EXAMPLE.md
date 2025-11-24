# Storage Upload Usage Examples

Complete examples showing how to use the storage upload functions in your application.

## Hero Slide Image Upload Example

### Complete Component Example

```typescript
'use client';

import { useState } from 'react';
import { uploadHeroSlideImage, validateImageFile } from '@/lib/storage';
import { api } from '@/lib/api';

export default function HeroSlideForm({ slideId, onSuccess }: { slideId?: string; onSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Supabase Storage
      const url = await uploadHeroSlideImage(file, slideId);
      setImageUrl(url);
      
      // If slideId exists, update the slide in database
      if (slideId) {
        await api.heroSlides.update(slideId, { image_url: url });
      }

      // Call success callback
      onSuccess?.();
      
      alert('Image uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Hero Slide Image
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-black file:text-white
            hover:file:bg-gray-800"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border"
          />
        </div>
      )}

      {imageUrl && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-2">
            Uploaded Image URL:
          </p>
          <p className="text-xs text-green-700 break-all">{imageUrl}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
}
```

### Simple Usage Example

```typescript
'use client';

import { useState } from 'react';
import { uploadHeroSlideImage, validateImageFile } from '@/lib/storage';

export default function SimpleUpload() {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploading(true);
    try {
      // Upload image (slideId is optional)
      const url = await uploadHeroSlideImage(file, 'slide-123');
      console.log('Uploaded URL:', url);
      
      // Use the URL to save in your database
      // await saveHeroSlide({ image_url: url });
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleFileUpload}
      disabled={uploading}
    />
  );
}
```

## Collection Image Upload Example

```typescript
import { uploadCollectionImage } from '@/lib/storage';

// In your collection form component
const handleCollectionImageUpload = async (file: File, collectionId: string) => {
  try {
    const imageUrl = await uploadCollectionImage(file, collectionId);
    
    // Update collection in database
    await api.collections.update(collectionId, { image_url: imageUrl });
    
    return imageUrl;
  } catch (error) {
    console.error('Failed to upload collection image:', error);
    throw error;
  }
};
```

## Testimonial Image Upload Example

```typescript
import { uploadTestimonialImage } from '@/lib/storage';

// In your testimonial form component
const handleTestimonialImageUpload = async (file: File, testimonialId: string) => {
  try {
    const imageUrl = await uploadTestimonialImage(file, testimonialId);
    
    // Update testimonial in database
    await api.testimonials.update(testimonialId, { image_url: imageUrl });
    
    return imageUrl;
  } catch (error) {
    console.error('Failed to upload testimonial image:', error);
    throw error;
  }
};
```

## Blog Image Upload Example

```typescript
import { uploadBlogImage } from '@/lib/storage';

// In your blog article form component
const handleBlogImageUpload = async (file: File, articleId: string) => {
  try {
    const imageUrl = await uploadBlogImage(file, articleId);
    
    // Update blog article in database
    await api.blog.update(articleId, { featured_image_url: imageUrl });
    
    return imageUrl;
  } catch (error) {
    console.error('Failed to upload blog image:', error);
    throw error;
  }
};
```

## Product Image Upload Example

```typescript
import { uploadProductImage } from '@/lib/storage';

// In your product form component
const handleProductImageUpload = async (file: File, productId: string) => {
  try {
    const imageUrl = await uploadProductImage(file, productId);
    
    // Update product in database
    await api.products.update(productId, { 
      primary_image_url: imageUrl 
    });
    
    return imageUrl;
  } catch (error) {
    console.error('Failed to upload product image:', error);
    throw error;
  }
};
```

## Error Handling Best Practices

```typescript
import { uploadHeroSlideImage, validateImageFile } from '@/lib/storage';

const uploadWithErrorHandling = async (file: File, slideId?: string) => {
  try {
    // 1. Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Upload with progress tracking (if needed)
    const url = await uploadHeroSlideImage(file, slideId);
    
    // 3. Verify URL is valid
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL returned from upload');
    }

    return url;
  } catch (error: any) {
    // Handle specific error types
    if (error.message.includes('Failed to upload')) {
      // Network or storage error
      console.error('Storage error:', error);
      throw new Error('Failed to upload to storage. Please try again.');
    } else if (error.message.includes('Invalid file type')) {
      // Validation error
      throw new Error('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
    } else if (error.message.includes('File size exceeds')) {
      // Size error
      throw new Error('Image is too large. Maximum size is 5MB.');
    } else {
      // Unknown error
      console.error('Unknown upload error:', error);
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
```

## TypeScript Types

All upload functions return `Promise<string>` (the public URL):

```typescript
// Function signatures
uploadHeroSlideImage(file: File, slideId?: string): Promise<string>
uploadCollectionImage(file: File, collectionId: string): Promise<string>
uploadTestimonialImage(file: File, testimonialId: string): Promise<string>
uploadBlogImage(file: File, articleId: string): Promise<string>
uploadProductImage(file: File, productId: string): Promise<string>
```

## Notes

1. **File Validation**: Always validate files before uploading using `validateImageFile()`
2. **Error Handling**: Wrap uploads in try-catch blocks
3. **Loading States**: Show loading indicators during upload
4. **Preview**: Show image preview before upload
5. **Database Update**: After upload, update the database record with the returned URL
6. **File Size**: Maximum file size is 5MB (configurable in validation function)
7. **File Types**: Allowed types: JPEG, PNG, WebP, GIF


