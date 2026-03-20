import express from 'express';
import multer from 'multer';
import {
  addPackage,
  getAllPackages,
  getPackagesByAgency,
  getPackageById,
  updatePackage,
  deletePackage,
} from '../controllers/packageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Limit file size to 5MB
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Public routes
router.get('/', getAllPackages);
router.get('/agency/:agencyId', getPackagesByAgency);
router.get('/:id', getPackageById);

// Protected routes - only authenticated users
router.post('/add', authMiddleware, upload.single('image'), addPackage);
router.put('/:id', authMiddleware, upload.single('image'), updatePackage);
router.delete('/:id', authMiddleware, deletePackage);

export default router;
