import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    image: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;
