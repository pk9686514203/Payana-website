import express from 'express';
import {
  addReview,
  getReviewsByPackage,
  getAllReviews,
  deleteReview,
  getReviewStats,
} from '../controllers/reviewController.js';
import { authMiddleware as authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add a new review (authenticated)
router.post('/', authenticate, addReview);

// Get all reviews
router.get('/', getAllReviews);

// Get reviews for a specific package
router.get('/package/:packageId', getReviewsByPackage);

// Get review statistics
router.get('/stats', getReviewStats);

// Delete a review (authenticated)
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
