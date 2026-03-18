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

const upload = multer({ storage });

router.post('/add', authMiddleware, upload.single('image'), addPackage);
router.get('/', getAllPackages);
router.get('/agency/:agencyId', getPackagesByAgency);
router.get('/:id', getPackageById);
router.put('/:id', authMiddleware, upload.single('image'), updatePackage);
router.delete('/:id', authMiddleware, deletePackage);

export default router;
