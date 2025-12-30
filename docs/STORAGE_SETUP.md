# Supabase Storage Setup for Product Images

## Create Storage Bucket

### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Storage**
   - Open your Supabase project dashboard
   - Navigate to **Storage** in the left sidebar
   - Click **"New bucket"** or **"Create bucket"**

2. **Configure the Bucket**
   - **Name**: `product-media`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: Set as needed (e.g., 5MB for images)
   - **Allowed MIME types**: (optional) `image/jpeg,image/png,image/webp,image/gif`

3. **Create the Bucket**
   - Click **"Create bucket"** or **"Save"**

### Method 2: Via Supabase SQL Editor

1. **Open SQL Editor**
   - Go to **SQL Editor** in your Supabase dashboard
   - Click **"New query"**

2. **Run the SQL**
   - Copy and paste the contents of `docs/CREATE_PRODUCT_MEDIA_BUCKET.sql`
   - Or use the SQL below:
   ```sql
   -- Create the storage bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('product-media', 'product-media', true)
   ON CONFLICT (id) DO UPDATE SET public = true;

   -- Drop existing policies if they exist
   DROP POLICY IF EXISTS "Public Access - Read" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

   -- Set up Storage Policies
   CREATE POLICY "Public Access - Read"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'product-media');

   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'product-media' 
     AND auth.role() = 'authenticated'
   );

   CREATE POLICY "Authenticated users can update"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'product-media' 
     AND auth.role() = 'authenticated'
   );

   CREATE POLICY "Authenticated users can delete"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'product-media' 
     AND auth.role() = 'authenticated'
   );
   ```

3. **Click "Run"** to execute the SQL

## Verify the Bucket

1. Go back to **Storage** in the dashboard
2. You should see `product-media` in the list
3. Click on it to verify it's set to **Public**

## Usage in Your Application

### Frontend (Next.js)

```typescript
import { supabase } from '@/lib/supabase';

// Upload an image
const uploadImage = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-media')
    .getPublicUrl(filePath);

  return publicUrl;
};

// Delete an image
const deleteImage = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('product-media')
    .remove([filePath]);

  if (error) {
    throw error;
  }
};

// Get public URL
const getImageUrl = (filePath: string) => {
  const { data: { publicUrl } } = supabase.storage
    .from('product-media')
    .getPublicUrl(filePath);
  
  return publicUrl;
};
```

### Backend (Express)

```typescript
import { supabase } from './lib/supabase';

// Upload image (using service role for admin access)
const uploadProductImage = async (file: Buffer, fileName: string) => {
  const { data, error } = await supabase.storage
    .from('product-media')
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-media')
    .getPublicUrl(fileName);

  return publicUrl;
};
```

## Storage URL Format

Once uploaded, images will be accessible at:
```
https://vjgxuamvrnmulvdajvid.supabase.co/storage/v1/object/public/product-media/{file-path}
```

## Best Practices

1. **File Naming**: Use unique names (e.g., `product-{id}-{timestamp}.jpg`)
2. **File Size**: Compress images before uploading
3. **File Types**: Only allow image types (JPEG, PNG, WebP)
4. **Organization**: Consider organizing by product ID or category
5. **Cleanup**: Delete old images when products are removed

## Next Steps

1. Create the bucket using one of the methods above
2. Test uploading an image
3. Verify the public URL works
4. Integrate into your product management system

