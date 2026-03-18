import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

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
  res.status(200).json({ message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
