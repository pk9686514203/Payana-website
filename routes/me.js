import express from 'express';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import Vehicle from '../models/Vehicle.js';
import Agency from '../models/Agency.js';
import User from '../models/User.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

function mapMyBooking(b) {
  const pkg = b.packageId && typeof b.packageId === 'object' ? b.packageId : null;
  const veh = b.vehicleId && typeof b.vehicleId === 'object' ? b.vehicleId : null;
  return {
    id: b._id.toString(),
    booking_id: b.bookingRef,
    travel_date: b.date,
    passengers: b.persons,
    status: b.status,
    agency_name: b.agencyName,
    packages: b.bookingType === 'package' && pkg ? { title: pkg.name } : null,
    vehicles: b.bookingType === 'vehicle' && veh ? { vehicle_name: veh.name } : null,
  };
}

function mapAgentBooking(b) {
  const pkg = b.packageId && typeof b.packageId === 'object' ? b.packageId : null;
  return {
    id: b._id.toString(),
    customer_name: b.name,
    customer_phone: b.phone,
    travel_date: b.date,
    passengers: b.persons,
    packages: pkg ? { title: pkg.name } : { title: b.vehicle || 'Booking' },
  };
}

router.get('/bookings', requireAuth, async (req, res) => {
  try {
    const list = await Booking.find({ userId: req.auth.id })
      .sort({ createdAt: -1 })
      .populate('packageId', 'name')
      .populate('vehicleId', 'name')
      .lean();
    res.json(list.map(mapMyBooking));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load bookings' });
  }
});

router.get('/agent-dashboard', requireAuth, requireRoles('agency'), async (req, res) => {
  try {
    const agency = await Agency.findOne({ owner: req.auth.id }).lean();
    if (!agency) {
      return res.status(404).json({ message: 'No agency profile' });
    }

    const packages = await Package.find({ agency: agency._id }).sort({ createdAt: -1 }).lean();
    const packageIds = packages.map((p) => p._id);

    const bookings = await Booking.find({
      $or: [{ packageId: { $in: packageIds } }, { agencyId: agency._id }],
    })
      .sort({ createdAt: -1 })
      .populate('packageId', 'name')
      .lean();

    res.json({
      agent: {
        id: agency._id.toString(),
        agency_name: agency.name,
        status: agency.status || 'approved',
        phone: agency.phone,
        email: agency.email,
      },
      packages: packages.map((p) => ({
        id: p._id.toString(),
        title: p.name,
        price: p.price,
        duration: p.duration,
        status: p.status || 'approved',
        description: p.description,
        locations: p.locations,
        includes: p.includes,
      })),
      bookings: bookings.map(mapAgentBooking),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load agent dashboard' });
  }
});

router.post('/packages', requireAuth, requireRoles('agency'), async (req, res) => {
  try {
    const agency = await Agency.findOne({ owner: req.auth.id });
    if (!agency) {
      return res.status(400).json({ message: 'Agency not found' });
    }

    const { title, description, price, duration, locations, includes } = req.body;
    if (!title || price == null || !duration) {
      return res.status(400).json({ message: 'Title, price, and duration are required' });
    }

    const locArr = Array.isArray(locations)
      ? locations
      : String(locations || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    const incArr = Array.isArray(includes)
      ? includes
      : String(includes || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const pkg = await Package.create({
      name: String(title).trim(),
      description: String(description || ''),
      price: Number(price),
      duration: String(duration),
      locations: locArr,
      includes: incArr,
      agency: agency._id,
      verified: false,
      status: 'pending',
    });

    res.status(201).json({
      id: pkg._id.toString(),
      title: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      status: pkg.status,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create package' });
  }
});

router.get('/vehicle-owner-dashboard', requireAuth, requireRoles('owner'), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.auth.id }).sort({ createdAt: -1 }).lean();
    const vehicleIds = vehicles.map((v) => v._id);

    const bookings = await Booking.find({ vehicleId: { $in: vehicleIds } })
      .sort({ createdAt: -1 })
      .populate('vehicleId', 'name')
      .lean();

    const user = await User.findById(req.auth.id).lean();

    res.json({
      owner: {
        id: req.auth.id,
        owner_name: user?.name || 'Owner',
        status: 'approved',
      },
      vehicles: vehicles.map((v) => ({
        id: v._id.toString(),
        vehicle_name: v.name,
        vehicle_type: v.type,
        seats: v.seats,
        price_per_km: v.pricePerKm,
        location: v.location,
        status: v.status || 'approved',
      })),
      bookings: bookings.map((b) => {
        const veh = b.vehicleId && typeof b.vehicleId === 'object' ? b.vehicleId : null;
        return {
          id: b._id.toString(),
          customer_name: b.name,
          customer_phone: b.phone,
          travel_date: b.date,
          passengers: b.persons,
          vehicles: veh ? { vehicle_name: veh.name } : { vehicle_name: b.vehicle },
        };
      }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load vehicle owner dashboard' });
  }
});

router.post('/vehicles', requireAuth, requireRoles('owner'), async (req, res) => {
  try {
    const { vehicle_name, vehicle_type, seats, price_per_km, location, contact_phone } = req.body;
    if (!vehicle_name || !seats || price_per_km == null || !location) {
      return res.status(400).json({ message: 'Missing required vehicle fields' });
    }

    const v = await Vehicle.create({
      name: String(vehicle_name).trim(),
      type: String(vehicle_type || 'SUV'),
      seats: Number(seats),
      pricePerKm: Number(price_per_km),
      location: String(location).trim(),
      owner: req.auth.id,
      verified: false,
      status: 'pending',
    });

    res.status(201).json({
      id: v._id.toString(),
      vehicle_name: v.name,
      vehicle_type: v.type,
      seats: v.seats,
      price_per_km: v.pricePerKm,
      location: v.location,
      status: v.status,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create vehicle' });
  }
});

export default router;
