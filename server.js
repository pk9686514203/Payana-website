import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== MONGODB ================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

/* ================== MODELS ================== */

// USER
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// AGENCY
const agencySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Agency = mongoose.model("Agency", agencySchema);

// VEHICLE
const vehicleSchema = new mongoose.Schema({
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
}, { timestamps: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

// PACKAGE
const packageSchema = new mongoose.Schema({
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
}, { timestamps: true });

const Package = mongoose.model("Package", packageSchema);

// BOOKING ✅ (IMPORTANT)
const bookingSchema = new mongoose.Schema({
  userId: String,
  packageId: String,
  date: Date,
  persons: Number,
  totalPrice: Number
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

/* ================== SEED DATA ================== */

const seedDatabase = async () => {
  try {
    if (await User.countDocuments() === 0) {
      const user = await User.create({
        name: "Demo User",
        email: "demo@example.com",
        password: "123456",
        phone: "9876543210",
        role: "user"
      });

      const agency = await Agency.create({
        name: "Demo Agency",
        email: "agency@example.com",
        phone: "9876543210",
        address: "Bangalore",
        owner: user._id
      });

      await Vehicle.insertMany([
        {
          name: "Tempo Traveller",
          type: "bus",
          seats: 13,
          pricePerKm: 25,
          location: "Bangalore",
          image: "https://via.placeholder.com/300x200",
          rating: 4.5,
          verified: true,
          owner: user._id,
          agency: agency._id,
          features: ["AC", "WiFi"]
        }
      ]);

      await Package.insertMany([
        {
          name: "Ooty Trip",
          price: 4499,
          duration: "3 Days",
          description: "Ooty tour package",
          image: "https://via.placeholder.com/300x200",
          locations: ["Ooty"],
          itinerary: ["Day 1", "Day 2"],
          includes: ["Hotel", "Food"],
          agency: agency._id,
          rating: 4.5,
          reviews: 100,
          verified: true
        }
      ]);

      console.log("✅ Seed Data Added");
    }
  } catch (err) {
    console.log("Seed error:", err);
  }
};

/* ================== ROUTES ================== */

// ROOT
app.get("/", (req, res) => {
  res.send("🚀 Payana Backend Running");
});

// HEALTH
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
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

// ✅ BOOKING ROUTE (MAIN FIX)
app.post("/api/book", async (req, res) => {
  try {
    console.log("Incoming booking:", req.body);

    const booking = new Booking(req.body);
    await booking.save();

    res.json({
      success: true,
      message: "Booking saved successfully",
      data: booking
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// GET ALL BOOKINGS (ADMIN)
app.get("/api/bookings", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

/* ================== START ================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on ${PORT}`);
  await seedDatabase();
});