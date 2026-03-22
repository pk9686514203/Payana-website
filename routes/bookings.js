import express from 'express';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import Vehicle from '../models/Vehicle.js';
import { normalizeIndianPhone } from '../utils/phone.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { sendBookingConfirmationSms } from '../utils/sms.js';

const router = express.Router();

function bookingRef() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PB-${ts}-${rand}`;
}

function assertPhoneToken(token, expectedPhone) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  const decoded = jwt.verify(token, secret);
  if (decoded.purpose !== 'phone_verify' || decoded.phone !== expectedPhone) {
    throw new Error('INVALID_PHONE_TOKEN');
  }
}

router.post('/', requireAuth, async (req, res) => {
  console.log('[API] POST /api/bookings', req.body?.bookingType, req.auth?.id);
  try {
    const {
      bookingType,
      packageId,
      vehicleId,
      name,
      phone,
      email,
      pickup,
      drop,
      date,
      time,
      vehicle,
      persons,
      price,
      message,
      agencyName,
      phoneVerificationToken,
    } = req.body;

    const phoneNorm = normalizeIndianPhone(phone || '');
    if (phoneNorm.length !== 10) {
      return res.status(400).json({ message: 'Valid phone number required' });
    }

    try {
      assertPhoneToken(phoneVerificationToken, phoneNorm);
    } catch {
      return res.status(400).json({ message: 'Please verify your phone with OTP before booking' });
    }

    if (!name?.trim() || !email?.trim() || !date || !persons) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const type = bookingType === 'vehicle' ? 'vehicle' : 'package';
    let agencyId = null;
    let resolvedAgencyName = agencyName?.trim() || '';
    let itemLabel = vehicle || '';

    if (type === 'package' && packageId) {
      const pkg = await Package.findById(packageId).populate('agency');
      if (pkg?.agency) {
        agencyId = pkg.agency._id;
        resolvedAgencyName = resolvedAgencyName || pkg.agency.name;
      }
      itemLabel = itemLabel || pkg?.name || '';
    }

    if (type === 'vehicle' && vehicleId) {
      const veh = await Vehicle.findById(vehicleId).populate('agency');
      if (veh?.agency) {
        agencyId = veh.agency._id;
        resolvedAgencyName = resolvedAgencyName || veh.agency.name;
      }
      itemLabel = itemLabel || veh?.name || '';
    }

    const ref = bookingRef();
    const booking = await Booking.create({
      bookingRef: ref,
      userId: req.auth.id,
      bookingType: type,
      packageId: type === 'package' && packageId ? packageId : null,
      vehicleId: type === 'vehicle' && vehicleId ? vehicleId : null,
      name: name.trim(),
      phone: phoneNorm,
      email: email.trim().toLowerCase(),
      pickup: pickup?.trim() || '',
      drop: drop?.trim() || '',
      date,
      time: time?.trim() || '',
      vehicle: itemLabel,
      persons: Number(persons),
      price: Number(price) || 0,
      status: 'confirmed',
      agencyName: resolvedAgencyName,
      agencyId,
      message: message?.trim() || '',
    });

    const qrPayload = JSON.stringify({
      bookingId: ref,
      name: booking.name,
      phone: booking.phone,
      date: booking.date,
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 240, margin: 1 });

    try {
      await sendBookingConfirmationSms(
        phoneNorm,
        `Payana: Booking ${ref} confirmed for ${booking.date}. Thank you for choosing Namma Payana!`
      );
    } catch (e) {
      console.warn('Booking SMS optional failed:', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking saved successfully',
      data: booking,
      bookingId: ref,
      qrDataUrl,
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: err.message || 'Failed to save booking' });
  }
});

function internalKeyOk(req) {
  const key = process.env.EXPORT_SECRET || process.env.INTERNAL_API_KEY;
  if (!key) return false;
  const header = req.headers['x-internal-key'];
  const q = req.query.key;
  return header === key || q === key;
}

router.get('/', async (req, res) => {
  console.log('[API] GET /api/bookings (internal)');
  if (!internalKeyOk(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const list = await Booking.find()
    .sort({ createdAt: -1 })
    .populate('packageId', 'name price')
    .populate('vehicleId', 'name type')
    .lean();
  res.json(list);
});

export default router;
