import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['car', 'suv', 'van', 'bus', 'bike'],
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      default: null,
    },
    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    features: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
