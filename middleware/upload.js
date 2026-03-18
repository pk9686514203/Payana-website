import multer from 'multer';

// Configure multer for in-memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Simulate image storage (In production, use Cloudinary)
// For now, we'll use a simple base64 encoding or store URLs
export const getImageUrl = (filename) => {
  // In production with Cloudinary:
  // return cloudinary.url(filename, { width: 300, crop: 'fill' });
  
  // For now, return a public URL placeholder
  return `/images/${filename}`;
};

export const uploadImageFile = (file) => {
  if (!file) return null;
  
  // In production, upload to Cloudinary
  // For now, return a mock URL
  const filename = `${Date.now()}-${file.originalname}`;
  return {
    url: getImageUrl(filename),
    filename: filename,
  };
};
