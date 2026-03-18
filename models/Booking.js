import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    fromLocation: {
      type: String,
      required: true,
    },
    toLocation: {
      type: String,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
