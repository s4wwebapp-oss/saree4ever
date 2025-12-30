# Hero Slide Image Upload Guide

## How to Upload Images to Hero Slides

### Step 1: Access Admin Panel
1. Go to `http://localhost:3000/admin`
2. Login with your admin credentials
3. Navigate to **Hero Slides** in the sidebar

### Step 2: Create New Hero Slide
1. Click the **"+ New Slide"** button
2. You'll see the form with image upload options

### Step 3: Upload Your Images

#### Option A: Upload from Computer (Recommended)
1. Click **"Choose File"** button
2. Select your image file from your computer
3. The image will automatically upload to Supabase
4. Wait for "Uploading..." to complete
5. You'll see a preview of the uploaded image
6. The Image URL field will be automatically filled

#### Option B: Enter Image URL
1. If you have images hosted elsewhere, paste the URL in the "Enter Image URL" field
2. The preview will appear automatically

### Step 4: Fill in Slide Details

For the **Blue Saree Palace Image**:
- **Title**: "Traditional Elegance"
- **Subtitle**: "Discover our collection of handcrafted silk sarees with intricate gold embroidery"
- **Button Text**: "Shop Collection"
- **Button Link**: "/collections"
- **Button Target**: Same Window
- **Display Order**: 1
- **Activate this slide**: ✅ Checked

For the **Mint Green Garden Image**:
- **Title**: "Ethereal Beauty"
- **Subtitle**: "Experience the grace of traditional Indian sarees in modern settings"
- **Button Text**: "Explore Styles"
- **Button Link**: "/products"
- **Button Target**: Same Window
- **Display Order**: 2
- **Activate this slide**: ✅ Checked

### Step 5: Save
1. Click **"Create"** or **"Update"** button
2. Your hero slide will be saved and appear in the list

## Image Requirements

- **Format**: JPEG, PNG, WebP, or GIF
- **Size**: Maximum 10MB
- **Recommended Dimensions**: 1920 × 1080 pixels (16:9 aspect ratio)
- **Aspect Ratio**: 16:9 landscape works best

## Tips

1. **Upload Multiple Slides**: You can create up to 3 active slides that will rotate on the homepage
2. **Display Order**: Lower numbers appear first (0, 1, 2...)
3. **Preview**: Check the "Active Slides Preview" section to see how they'll look
4. **Test**: Visit the homepage to see your hero slides in action

## Troubleshooting

### Upload Fails
- Make sure backend server is running (`npm run dev` in backend folder)
- Check that you're logged in as admin
- Verify file size is under 10MB
- Ensure file format is supported (JPEG, PNG, WebP, GIF)

### Image Not Showing
- Check that the image URL is valid
- Verify the Supabase bucket exists (run `CREATE_ALL_STORAGE_BUCKETS.sql`)
- Make sure the slide is marked as "Active"


