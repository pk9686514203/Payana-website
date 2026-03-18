import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getMyBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id', authMiddleware, updateBooking);
router.post('/:id/cancel', authMiddleware, cancelBooking);

export default router;
