import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import otpRoutes from './routes/otp.js';
import bookingRoutes from './routes/bookings.js';
import exportRoutes from './routes/export.js';
import meRoutes from './routes/me.js';
import publicRoutes from './routes/public.js';
import { connectDB, isMongoConnected } from './connectDB.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://payana-frontendd.vercel.app',
  'https://www.payanabookings.in',  // 🔥 ADD THIS
  'https://payanabookings.in',      // 🔥 also add this (important)
  'http://localhost:5173'
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.CORS_ALLOW_ALL === 'true') {
        return callback(null, true);
      }
      if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      console.warn('[CORS] blocked origin:', origin);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-export-key', 'x-internal-key', 'X-Requested-With'],
    optionsSuccessStatus: 204,
  })
);

app.use((req, res, next) => {
  const origin = req.get('origin') || '-';
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} | origin=${origin} | mongo=${isMongoConnected() ? 'up' : 'down'}`);
  next();
});

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.status(200).send('API WORKING ✅');
});

app.get('/health', (_req, res) => {
  const ready = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    ok: true,
    mongo: isMongoConnected() ? 'connected' : 'disconnected',
    mongoState: states[ready] ?? String(ready),
    uptime: process.uptime(),
  });
});

function requireMongoForApi(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }
  if (isMongoConnected()) {
    return next();
  }
  console.log('[API] Database not connected —', req.method, req.originalUrl);
  return res.status(500).json({
    error: 'Database not connected',
  });
}

app.use('/api', requireMongoForApi);

app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/me', meRoutes);
app.use('/api', publicRoutes);

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[API ERROR]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();
