# Image Upload Feature - Implementation Guide

## ✅ Implementation Complete

Image upload functionality has been added to the admin panel for products and collections.

---

## Features Added

### 1. **Backend Upload Endpoint**
- **Route**: `POST /api/upload/image`
- **Location**: `backend/src/routes/upload.ts`
- **Features**:
  - Accepts single image uploads
  - Validates file types (jpeg, jpg, png, gif, webp)
  - 10MB file size limit
  - Stores files in `backend/public/uploads/`
  - Returns URL to access uploaded image
  - Requires admin authentication

### 2. **Product Image Upload**
- **Component**: `MultiImageUpload`
- **Location**: `nextjs-saree4sure/components/MultiImageUpload.js`
- **Features**:
  - Upload multiple images per product
  - Enter image URLs manually OR upload files
  - Preview images before saving
  - Add/remove image fields dynamically
  - Shows upload progress

### 3. **Collection Banner Upload**
- **Component**: `ImageUpload`
- **Location**: `nextjs-saree4sure/components/ImageUpload.js`
- **Features**:
  - Upload single banner image
  - Enter image URL manually OR upload file
  - Preview image before saving
  - Shows upload progress

---

## How to Use

### Uploading Product Images

1. Go to **Admin Panel** → **Products** → **Add Product** (or edit existing)
2. Scroll to **"Product Images"** section
3. For each image:
   - **Option 1**: Enter image URL in the text field
   - **Option 2**: Click **"Upload"** button and select a file
4. Click **"+ Add Image"** to add more images
5. Click **"Remove"** to delete an image field
6. Images are previewed automatically
7. Click **"Save Product"** when done

### Uploading Collection Banner

1. Go to **Admin Panel** → **Collections** → **Add Collection** (or edit existing)
2. Scroll to **"Banner Image"** section
3. **Option 1**: Enter image URL in the text field
4. **Option 2**: Click **"Upload"** button and select a file
5. Image is previewed automatically
6. Click **"Save Collection"** when done

---

## Technical Details

### File Storage
- **Location**: `backend/public/uploads/`
- **Naming**: `image-{timestamp}-{random}.{ext}`
- **Access**: Files are served at `http://localhost:3000/uploads/{filename}`

### Supported Formats
- JPEG / JPG
- PNG
- GIF
- WebP

### File Size Limit
- Maximum: 10MB per file

### Authentication
- All upload endpoints require admin authentication
- Uses JWT token from localStorage

---

## API Endpoints

### Upload Single Image
```bash
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
  image: <file>
```

**Response:**
```json
{
  "success": true,
  "url": "/uploads/image-1234567890-123456789.jpg",
  "filename": "image-1234567890-123456789.jpg",
  "size": 123456
}
```

### Upload Multiple Images
```bash
POST /api/upload/images
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
  images: <file1>, <file2>, ...
```

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "url": "/uploads/image-1234567890-123456789.jpg",
      "filename": "image-1234567890-123456789.jpg",
      "size": 123456
    }
  ]
}
```

---

## Components

### ImageUpload Component
Single image upload component with URL input and file upload.

**Props:**
- `value`: Current image URL (string)
- `onChange`: Callback function (url: string) => void
- `label`: Label text (string, optional)
- `accept`: File types to accept (string, default: 'image/*')
- `multiple`: Allow multiple files (boolean, default: false)

**Usage:**
```jsx
<ImageUpload
  value={bannerUrl}
  onChange={(url) => setBannerUrl(url)}
  label="Banner Image"
/>
```

### MultiImageUpload Component
Multiple image upload component with URL inputs and file uploads.

**Props:**
- `value`: Array of image URLs (string[])
- `onChange`: Callback function (urls: string[]) => void
- `label`: Label text (string, optional, default: 'Images')

**Usage:**
```jsx
<MultiImageUpload
  value={imageUrls}
  onChange={setImageUrls}
  label="Product Images"
/>
```

---

## File Structure

```
backend/
├── src/
│   └── routes/
│       └── upload.ts          # Upload endpoints
├── public/
│   └── uploads/              # Uploaded images storage
└── server.ts                 # Static file serving

nextjs-saree4sure/
├── components/
│   ├── ImageUpload.js        # Single image upload component
│   └── MultiImageUpload.js   # Multiple images upload component
└── pages/
    ├── admin/
    │   ├── products/[id].js  # Uses MultiImageUpload
    │   └── collections/[id].js # Uses ImageUpload
    └── api/
        └── upload/
            └── image.js      # Upload API route (optional)
```

---

## Environment Variables

### Backend
No additional environment variables needed.

### Frontend
Optional: Set `NEXT_PUBLIC_BACKEND_URL` if backend is on a different domain:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

---

## Production Considerations

### Current Implementation
- Files are stored locally on the server
- Files are served directly by Express
- No CDN integration
- No image optimization

### Recommended for Production

1. **Use Cloud Storage** (AWS S3, DigitalOcean Spaces, Supabase Storage)
   - Update `backend/src/routes/upload.ts` to upload to cloud storage
   - Return cloud storage URLs instead of local paths

2. **Image Optimization**
   - Resize images on upload
   - Generate thumbnails
   - Use WebP format
   - Consider using Sharp library

3. **CDN Integration**
   - Serve images through CDN (Cloudflare, CloudFront)
   - Better performance and global distribution

4. **File Management**
   - Implement image deletion when products/collections are deleted
   - Clean up orphaned files periodically

---

## Testing

### Test Upload Endpoint
```bash
# Get admin token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@saree4ever.com","password":"admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")

# Upload image
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Test in Admin Panel
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd nextjs-saree4sure && npm run dev`
3. Login as admin
4. Try uploading images in product/collection forms

---

## Troubleshooting

### Upload Fails
- Check backend is running on port 3000
- Verify admin authentication token is valid
- Check file size (must be < 10MB)
- Verify file type is supported

### Images Not Displaying
- Check `backend/public/uploads/` directory exists
- Verify backend static file serving is configured
- Check image URL format (should be `http://localhost:3000/uploads/...`)

### CORS Errors
- Ensure backend CORS is configured to allow frontend origin
- Check `backend/src/server.ts` has `app.use(cors())`

---

## Summary

✅ **Backend upload endpoint** - Complete  
✅ **Product image upload** - Complete  
✅ **Collection banner upload** - Complete  
✅ **Reusable components** - Complete  
✅ **File storage** - Complete (local storage)  
✅ **Authentication** - Complete  
✅ **Error handling** - Complete  

**Status**: ✅ **Ready to use!**

You can now upload images directly from the admin panel for products and collections, in addition to using image URLs.

