import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    locations: [
      {
        type: String,
      },
    ],
    itinerary: [
      {
        type: String,
      },
    ],
    includes: [
      {
        type: String,
      },
    ],
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model('Package', packageSchema);

export default Package;
