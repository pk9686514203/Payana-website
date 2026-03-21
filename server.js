import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

/* ================== CORS ================== */
app.use(cors({
  origin: [
    'https://payana-website-1.onrender.com', // your frontend
    'https://your-netlify-app.netlify.app',  // if using netlify
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== MONGODB ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

/* ================== MODELS ================== */

// USER
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String
}, { timestamps: true }));

// AGENCY
const Agency = mongoose.model("Agency", new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true }));

// VEHICLE
const Vehicle = mongoose.model("Vehicle", new mongoose.Schema({
  name: String,
  type: String,
  seats: Number,
  pricePerKm: Number,
  location: String,
  image: String,
  rating: Number,
  verified: Boolean,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
  features: [String]
}, { timestamps: true }));

// PACKAGE
const Package = mongoose.model("Package", new mongoose.Schema({
  name: String,
  price: Number,
  duration: String,
  description: String,
  image: String,
  locations: [String],
  itinerary: [String],
  includes: [String],
  agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
  rating: Number,
  reviews: Number,
  verified: Boolean
}, { timestamps: true }));

// ✅ BOOKING MODEL
const Booking = mongoose.model("Booking", new mongoose.Schema({
  userId: String,
  packageId: String,
  persons: Number,
  travelDate: String,
  totalPrice: Number
}, { timestamps: true }));

/* ================== ROUTES ================== */

// ROOT
app.get("/", (req, res) => {
  res.send("🚀 Payana Backend Running");
});

// VEHICLES
app.get("/api/vehicles", async (req, res) => {
  const data = await Vehicle.find();
  res.json(data);
});

// PACKAGES
app.get("/api/packages", async (req, res) => {
  const data = await Package.find();
  res.json(data);
});

// ✅ CREATE BOOKING (IMPORTANT)
app.post("/api/bookings", async (req, res) => {
  try {
    console.log("Incoming booking:", req.body);

    const booking = new Booking(req.body);
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking saved successfully",
      data: booking
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET BOOKINGS (ADMIN)
app.get("/api/bookings", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

/* ================== START ================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});