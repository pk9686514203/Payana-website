import express from 'express';
import multer from 'multer';
import {
  addVehicle,
  getAllVehicles,
  getVehiclesByAgency,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
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

router.post('/add', authMiddleware, upload.single('image'), addVehicle);
router.get('/', getAllVehicles);
router.get('/agency/:agencyId', getVehiclesByAgency);
router.get('/:id', getVehicleById);
router.put('/:id', authMiddleware, upload.single('image'), updateVehicle);
router.delete('/:id', authMiddleware, deleteVehicle);

export default router;
