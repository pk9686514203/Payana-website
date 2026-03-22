import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Agency from '../models/Agency.js';
import Vehicle from '../models/Vehicle.js';
import { normalizeIndianPhone } from '../utils/phone.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

function normalizeDbRole(role) {
  if (role === 'user') return 'customer';
  if (role === 'agent') return 'agency';
  if (role === 'operator') return 'owner';
  return role;
}

function issueToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  const role = normalizeDbRole(user.role);
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role },
    secret,
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    _id: user._id.toString(),
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: normalizeDbRole(user.role),
    agencyName: user.agencyName || '',
  };
}

router.post('/signup', async (req, res) => {
  console.log('[AUTH] POST /api/auth/signup', req.body?.email || '(no email)');
  try {
    const {
      email,
      password,
      name,
      phone,
      role: rawRole,
      address = '',
      vehicleName = '',
      vehicleType = 'SUV',
      pricePerKm = '',
      driverName = '',
      image = '',
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let role = typeof rawRole === 'string' ? rawRole.trim() : 'customer';
    if (role === 'user') role = 'customer';
    if (role === 'agent') role = 'agency';
    if (role === 'operator') role = 'owner';
    if (!['customer', 'agency', 'owner'].includes(role)) {
      role = 'customer';
    }

    const phoneNorm = normalizeIndianPhone(phone || '');
    const agencyName = role === 'agency' ? String(name || '').trim() : String(name || '').trim();

    const user = new User({
      email: email.trim().toLowerCase(),
      password,
      name: name?.trim() || email.split('@')[0],
      phone: phoneNorm,
      role,
      agencyName: role === 'agency' ? agencyName : agencyName,
      address: address?.trim() || undefined,
    });

    if (role === 'agency') {
      if (!address?.trim()) {
        return res.status(400).json({ message: 'Address is required for agency signup' });
      }
    }

    if (role === 'owner') {
      if (!vehicleName?.trim() || !pricePerKm) {
        return res.status(400).json({ message: 'Vehicle details are required for owner signup' });
      }
    }

    await user.save();

    if (role === 'agency') {
      const agency = await Agency.create({
        name: agencyName,
        email: user.email,
        phone: phoneNorm,
        address: address.trim(),
        owner: user._id,
        verified: true,
        status: 'approved',
      });
      user.agency = agency._id;
      await user.save();
    }

    if (role === 'owner') {
      await Vehicle.create({
        name: vehicleName.trim(),
        type: vehicleType || 'SUV',
        seats: 7,
        pricePerKm: Number(pricePerKm) || 0,
        location: address?.trim() || 'Bengaluru',
        image: image || null,
        owner: user._id,
        driverName: driverName?.trim() || '',
        verified: true,
        status: 'approved',
      });
    }

    const token = issueToken(user);
    const fresh = await User.findById(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: publicUser(fresh),
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map((e) => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  console.log('[AUTH] POST /api/auth/login', req.body?.email || '(no email)');
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = issueToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error loading profile' });
  }
});

export default router;
