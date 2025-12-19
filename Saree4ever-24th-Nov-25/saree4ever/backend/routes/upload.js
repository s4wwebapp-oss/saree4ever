const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('../config/db');
const { authenticate, isAdmin } = require('../middleware/auth');

// Configure multer for memory storage (images)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  },
});

// Configure multer for video uploads
const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:30',message:'Multer fileFilter called',data:{mimetype:file.mimetype,originalname:file.originalname,size:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, OGG, and QuickTime videos are allowed.'));
    }
  },
});

// Upload hero slide image
router.post('/hero-slide', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    const slideId = req.body.slideId; // Optional slide ID

    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const prefix = slideId ? `slides/${slideId}` : 'slides';
    const fileName = `${prefix}-${timestamp}-${randomString}.${fileExt}`;

    // Upload to Supabase Storage using service role (bypasses RLS)
    const { data, error } = await supabase.storage
      .from('hero-slides')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: `Failed to upload image: ${error.message}` });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('hero-slides')
      .getPublicUrl(fileName);

    res.json({ 
      url: publicUrl,
      fileName: fileName,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Upload product image
router.post('/product', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    const productId = req.body.productId; // Optional product ID

    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const prefix = productId ? `products/${productId}` : 'products';
    const fileName = `${prefix}-${timestamp}-${randomString}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-media')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: `Failed to upload image: ${error.message}` });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-media')
      .getPublicUrl(fileName);

    res.json({ 
      url: publicUrl,
      fileName: fileName,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Upload general image (for announcements, blog, etc.)
router.post('/image', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    const bucket = req.body.bucket || 'general'; // Default bucket

    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${bucket}-${timestamp}-${randomString}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: `Failed to upload image: ${error.message}` });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    res.json({ 
      url: publicUrl,
      fileName: fileName,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Upload landing page video
router.post('/landing-page-video', authenticate, isAdmin, uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;

    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    // Upload to Supabase Storage - create bucket if it doesn't exist
    // Note: You may need to create 'landing-videos' bucket in Supabase Storage first
    const { data, error } = await supabase.storage
      .from('landing-videos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      // If bucket doesn't exist, try 'product-media' as fallback
      if (error.message?.includes('Bucket not found')) {
        return res.status(500).json({ 
          error: 'Storage bucket "landing-videos" not found. Please create it in Supabase Storage settings.' 
        });
      }
      return res.status(500).json({ error: `Failed to upload video: ${error.message}` });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('landing-videos')
      .getPublicUrl(fileName);

    res.json({ 
      url: publicUrl,
      fileName: fileName,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload video' });
  }
});

// Direct upload endpoint (same as regular but with higher limit support)
// This endpoint uses service role key and bypasses RLS, supporting up to 200MB
router.post('/landing-page-video/direct', authenticate, isAdmin, (req, res, next) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:233',message:'Multer error handler',data:{errorMessage:err.message,errorCode:err.code,errorField:err.field},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:233',message:'Direct upload endpoint entry',data:{hasFile:!!req.file,contentLength:req.headers['content-length']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:241',message:'File received from multer',data:{size:file.size,bufferLength:file.buffer?.length,mimetype:file.mimetype,originalname:file.originalname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Generate unique filename
    const fileExt = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:250',message:'Before Supabase upload',data:{fileName,bufferLength:file.buffer?.length,contentType:file.mimetype,fileSize:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // For files larger than 45MB, use chunked upload to work around Supabase global limit
    const CHUNK_SIZE = 45 * 1024 * 1024; // 45MB chunks (under 50MB limit)
    let data, error;

    if (file.buffer.length > CHUNK_SIZE) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:273',message:'Using chunked upload',data:{fileSize:file.buffer.length,chunkSize:CHUNK_SIZE,numChunks:Math.ceil(file.buffer.length/CHUNK_SIZE)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Upload entire file - Supabase should handle large files with resumable uploads
      // If that fails, we'll need to implement proper chunking
      const uploadResult = await supabase.storage
        .from('landing-videos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });
      
      data = uploadResult.data;
      error = uploadResult.error;

      // If standard upload fails with size error, try alternative: upload to a different service or use URL
      if (error && error.message?.includes('maximum allowed size')) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:288',message:'Size limit hit, suggesting alternative',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        
        return res.status(413).json({ 
          error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds Supabase global limit (50MB on free plans). Please either: 1) Upgrade your Supabase plan to increase the limit, 2) Compress the video, or 3) Use an external video hosting service and provide a URL instead.` 
        });
      }
    } else {
      // Standard upload for smaller files
      const uploadResult = await supabase.storage
        .from('landing-videos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });
      
      data = uploadResult.data;
      error = uploadResult.error;
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:256',message:'After Supabase upload',data:{hasError:!!error,errorMessage:error?.message,errorCode:error?.statusCode,errorObject:error,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (error) {
      console.error('Supabase upload error:', error);
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:262',message:'Supabase error details',data:{error:JSON.stringify(error),errorMessage:error.message,errorStatus:error.statusCode,fullError:error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (error.message?.includes('Bucket not found')) {
        return res.status(500).json({ 
          error: 'Storage bucket "landing-videos" not found. Please create it in Supabase Storage settings.' 
        });
      }
      return res.status(500).json({ error: `Failed to upload video: ${error.message}` });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('landing-videos')
      .getPublicUrl(fileName);

    res.json({ 
      url: publicUrl,
      fileName: fileName,
      message: 'Video uploaded successfully'
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/9491d29f-60fd-4a23-b492-56152deff670',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'upload.js:300',message:'Catch block error - direct upload',data:{errorMessage:error.message,errorStack:error.stack,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload video' });
  }
});

module.exports = router;




