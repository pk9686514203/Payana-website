import Review from '../models/Review.js';
import Package from '../models/Package.js';

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { packageId, name, rating, comment, image } = req.body;
    const userId = req.userId; // From auth middleware

    // Validation
    if (!packageId || !name || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (comment.length < 10 || comment.length > 500) {
      return res.status(400).json({ message: 'Comment must be between 10 and 500 characters' });
    }

    // Check if package exists
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Create review
    const review = new Review({
      packageId,
      userId,
      name,
      rating,
      comment,
      image: image || null,
      verified: true, // Auto-verify for now
    });

    await review.save();

    // Update package rating
    await updatePackageRating(packageId);

    res.status(201).json({
      message: 'Review added successfully',
      review: review.toObject(),
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: error.message || 'Failed to add review' });
  }
};

// Get reviews for a package
export const getReviewsByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    const reviews = await Review.find({ packageId, verified: true })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch reviews' });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ verified: true })
      .populate('packageId', 'name')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch reviews' });
  }
};

// Delete a review (admin/user who posted it)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the one who posted or admin
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const packageId = review.packageId;
    await Review.findByIdAndDelete(reviewId);

    // Update package rating
    await updatePackageRating(packageId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: error.message || 'Failed to delete review' });
  }
};

// Update package rating based on reviews
const updatePackageRating = async (packageId) => {
  try {
    const reviews = await Review.find({ packageId, verified: true });

    if (reviews.length === 0) {
      await Package.findByIdAndUpdate(packageId, { rating: 0, reviews: 0 });
      return;
    }

    const avgRating = 
      reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;

    await Package.findByIdAndUpdate(packageId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviews: reviews.length,
    });
  } catch (error) {
    console.error('Error updating package rating:', error);
  }
};

// Get review statistics
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { verified: true } },
      {
        $group: {
          _id: '$packageId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch stats' });
  }
};
