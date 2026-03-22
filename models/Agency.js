import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Agency name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email must be unique'],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    logo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    instagram: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'approved',
    },
  },
  { timestamps: true }
);

const Agency = mongoose.model('Agency', agencySchema);

export default Agency;
