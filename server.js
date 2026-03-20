import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import Vehicle from './models/Vehicle.js';
import Package from './models/Package.js';
import User from './models/User.js';
import Agency from './models/Agency.js';
import {
  connectToMongoDB,
  disconnectFromMongoDB,
  getMongoDBConnectionStatus,
  setupMongoDBEventListeners,
} from './db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://payana-travel-hub.netlify.app',
  'https://payana-website-1.onrender.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Setup MongoDB event listeners
setupMongoDBEventListeners();

const seedDatabase = async () => {
  try {
    const vehicleCount = await Vehicle.countDocuments();
    const packageCount = await Package.countDocuments();
    const userCount = await User.countDocuments();
    const agencyCount = await Agency.countDocuments();

    if (userCount === 0) {
      const demoUser = new User({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123456',
        phone: '9876543210',
        role: 'agency',
      });
      await demoUser.save();
      console.log('✅ Demo user created');
    }

    if (agencyCount === 0) {
      const demoAgency = new Agency({
        name: 'Demo Travel Agency',
        email: 'agency@example.com',
        phone: '9876543210',
        address: 'Demo Address',
        owner: await User.findOne({ email: 'demo@example.com' }).then(u => u?._id),
      });
      await demoAgency.save();
      console.log('✅ Demo agency created');
    }

    if (vehicleCount === 0) {
      const agency = await Agency.findOne();
      const owner = await User.findOne();
      const vehicles = [
        {
          name: 'Tempo Traveller',
          type: 'bus',
          seats: 13,
          pricePerKm: 25,
          location: 'Bangalore',
          image: 'https://via.placeholder.com/300x200?text=Tempo+Traveller',
          rating: 4.5,
          verified: true,
          owner: owner?._id,
          agency: agency?._id,
          features: ['AC', 'WiFi', 'USB Charger'],
        },
        {
          name: 'Toyota Fortuner',
          type: 'suv',
          seats: 7,
          pricePerKm: 35,
          location: 'Bangalore',
          image: 'https://via.placeholder.com/300x200?text=Fortuner',
          rating: 4.8,
          verified: true,
          owner: owner?._id,
          agency: agency?._id,
          features: ['AC', 'Leather Seats', 'Navigation'],
        },
        {
          name: 'Luxury Bus',
          type: 'bus',
          seats: 45,
          pricePerKm: 45,
          location: 'Bangalore',
          image: 'https://via.placeholder.com/300x200?text=Luxury+Bus',
          rating: 4.6,
          verified: true,
          owner: owner?._id,
          agency: agency?._id,
          features: ['AC', 'Sleeper Berths', 'Toilet', 'WiFi'],
        },
      ];
      await Vehicle.insertMany(vehicles);
      console.log('✅ Sample vehicles created');
    }

    if (packageCount === 0) {
      const agency = await Agency.findOne();
      const packages = [
        {
          name: 'Ooty Hill Station',
          price: 4499,
          duration: '3 Days / 2 Nights',
          description: 'Explore the beautiful hill station of Ooty with scenic views and adventure activities.',
          image: 'https://via.placeholder.com/300x200?text=Ooty',
          locations: ['Ooty', 'Coonoor', 'Doddabetta'],
          itinerary: ['Day 1: Arrival and city tour', 'Day 2: Botanical garden and lake visit', 'Day 3: Return'],
          includes: ['Hotel', 'Meals', 'Transport'],
          agency: agency?._id,
          rating: 4.5,
          reviews: 125,
          verified: true,
        },
        {
          name: 'Coorg Coffee Retreat',
          price: 3999,
          duration: '2 Days / 1 Night',
          description: 'Experience the lush coffee plantations and misty hills of Coorg.',
          image: 'https://via.placeholder.com/300x200?text=Coorg',
          locations: ['Coorg', 'Madikeri', 'Chelavara'],
          itinerary: ['Day 1: Plantation tour and stay', 'Day 2: Return'],
          includes: ['Hotel', 'Breakfast', 'Transport', 'Coffee Tour'],
          agency: agency?._id,
          rating: 4.7,
          reviews: 98,
          verified: true,
        },
        {
          name: 'Mysore Palace Tour',
          price: 2999,
          duration: '1 Day',
          description: 'Visit the magnificent Mysore Palace and explore the cultural heritage.',
          image: 'https://via.placeholder.com/300x200?text=Mysore',
          locations: ['Mysore', 'Chamundi Hills'],
          itinerary: ['Morning: Palace visit', 'Afternoon: Chamundi Hills temple', 'Evening: Return'],
          includes: ['Transport', 'Guide', 'Entry Fees'],
          agency: agency?._id,
          rating: 4.4,
          reviews: 256,
          verified: true,
        },
      ];
      await Package.insertMany(packages);
      console.log('✅ Sample packages created');
    }
  } catch (error) {
    console.error('⚠️ Seed data error:', error.message);
  }
};

// Initialize Server
const startServer = async () => {
  try {
    const dbConnected = await connectToMongoDB();

    if (!dbConnected) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Fatal: Cannot start without MongoDB connection in production');
        process.exit(1);
      } else {
        console.warn('Warning: MongoDB not connected. Some features may not work.');
      }
    } else {
      await seedDatabase();
    }

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/agencies', agencyRoutes);
    app.use('/api/vehicles', vehicleRoutes);
    app.use('/api/packages', packageRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/reviews', reviewRoutes);

    // Image serving
    app.use('/images', express.static(path.join(__dirname, 'public/images')));

    // Health check
    app.get('/api/health', (req, res) => {
      const connectionStatus = getMongoDBConnectionStatus();
      res.status(200).json({
        message: 'Server is running',
        database: connectionStatus.stateName,
        timestamp: new Date().toISOString(),
      });
    });

    // Root route
    app.get('/', (req, res) => {
      res.status(200).send('🚀 Payana Backend Running');
    });

    // API status route
    app.get('/api', (req, res) => {
      res.status(200).json({ message: 'API Working' });
    });

    // Fetch vehicles from database
    app.get('/api/vehicles/all', async (req, res) => {
      try {
        const vehicles = await Vehicle.find().limit(20);
        res.status(200).json(vehicles);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles' });
      }
    });

    // Fetch vehicles (alias)
    app.get('/api/vehicles', async (req, res) => {
      try {
        const vehicles = await Vehicle.find().limit(20);
        res.status(200).json(vehicles);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles' });
      }
    });

    // Fetch packages from database
    app.get('/api/packages/all', async (req, res) => {
      try {
        const packages = await Package.find().limit(20);
        res.status(200).json(packages);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching packages' });
      }
    });

    // Fetch packages (alias)
    app.get('/api/packages', async (req, res) => {
      try {
        const packages = await Package.find().limit(20);
        res.status(200).json(packages);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching packages' });
      }
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Error handler
    app.use(errorHandler);

    // Start listening
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
