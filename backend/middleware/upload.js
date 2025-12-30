const multer = require('multer');
const path = require('path');

// Configure storage - using memory storage for Supabase upload
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Single file upload middleware
exports.uploadSingle = upload.single('image');

// Multiple files upload middleware
exports.uploadMultiple = upload.array('images', 10); // Max 10 images

// CSV file upload middleware (no file type restriction)
const csvUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for CSV files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'text/csv' || file.mimetype === 'application/csv' || file.mimetype === 'application/vnd.ms-excel';

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'));
    }
  },
});

exports.uploadCSV = csvUpload.single('file');

// For temporary local storage (not recommended for production)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const localUpload = multer({
  storage: localStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Local upload (temporary only - use Supabase Storage in production)
exports.uploadLocal = localUpload.single('image');

