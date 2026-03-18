import express from 'express';
import {
  registerAgency,
  getAllAgencies,
  getAgencyById,
  getMyAgency,
  updateAgency,
} from '../controllers/agencyController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authMiddleware, registerAgency);
router.get('/', getAllAgencies);
router.get('/my-agency', authMiddleware, getMyAgency);
router.get('/:id', getAgencyById);
router.put('/:id', authMiddleware, updateAgency);

export default router;
