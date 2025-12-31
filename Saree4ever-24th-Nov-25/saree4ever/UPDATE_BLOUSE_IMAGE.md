# How to Update Blouses Category with Your Custom Image

## Step 1: Upload Your Image

You have two options:

### Option A: Upload to Supabase Storage (Recommended)

1. Go to your Supabase Dashboard → Storage
2. Select or create a bucket (e.g., `general` or `category-images`)
3. Upload your blouse image
4. Make sure the file is **public**
5. Copy the public URL (will look like):
   ```
   https://{your-project-id}.supabase.co/storage/v1/object/public/{bucket-name}/{filename}
   ```

### Option B: Use Any Image Hosting Service

Upload your image to any hosting service (Imgur, Cloudinary, etc.) and get the public URL.

## Step 2: Update the Database

Once you have the image URL, run:

```bash
cd backend
BLOUSE_IMAGE_URL="your-image-url-here" node update-blouses-custom-image.js
```

Or edit the script `backend/update-blouses-custom-image.js` and set the `CUSTOM_BLOUSE_IMAGE_URL` variable directly.

## Example

```bash
cd backend
BLOUSE_IMAGE_URL="https://vjgxuamvrnmulvdajvid.supabase.co/storage/v1/object/public/general/blouse-pink-embroidered.jpg" node update-blouses-custom-image.js
```

## What Gets Updated

- ✅ "Blouses" category icon (homepage quick section)
- ✅ "Readymade Blouses" category image
- ✅ All blouse products (optional, if they exist)

After running the script, refresh your browser to see the updated image!


