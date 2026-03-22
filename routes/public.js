import express from 'express';
import mongoose from 'mongoose';
import Package from '../models/Package.js';
import Vehicle from '../models/Vehicle.js';
import Agency from '../models/Agency.js';

const router = express.Router();

const packageFilter = () => ({
  $or: [{ status: 'approved' }, { status: { $exists: false } }, { verified: true }],
});

const vehicleFilter = () => ({
  $or: [{ status: 'approved' }, { status: { $exists: false } }, { verified: true }],
});

const agencyFilter = () => ({
  $or: [{ status: 'approved' }, { status: { $exists: false } }, { verified: true }],
});

function mapAgent(a) {
  if (!a) return null;
  return {
    id: a._id.toString(),
    agency_name: a.name,
    logo_url: a.logo,
    is_verified: !!a.verified,
    phone: a.phone,
    email: a.email,
    instagram: a.instagram || undefined,
    description: a.description || undefined,
  };
}

function mapPackageDoc(p) {
  const a = p.agency && typeof p.agency === 'object' ? p.agency : null;
  return {
    id: p._id.toString(),
    title: p.name,
    name: p.name,
    price: p.price,
    duration: p.duration,
    description: p.description || '',
    images: p.image ? [p.image] : [],
    locations: p.locations || [],
    itinerary: p.itinerary || [],
    includes: p.includes || [],
    agents: mapAgent(a),
    status: p.status || 'approved',
  };
}

function mapVehicleDoc(v, owner) {
  return {
    id: v._id.toString(),
    vehicle_name: v.name,
    vehicle_type: v.type,
    location: v.location,
    seats: v.seats,
    price_per_km: v.pricePerKm,
    status: v.status || 'approved',
    vehicle_owners: owner
      ? {
          owner_name: owner.name,
          is_verified: !!owner.verified,
          phone: owner.phone,
          email: owner.email,
        }
      : null,
  };
}

function mapAgencyDoc(a) {
  const owner = a.owner && typeof a.owner === 'object' && a.owner.name ? a.owner : null;
  return {
    id: a._id.toString(),
    agency_name: a.name,
    phone: a.phone,
    email: a.email,
    address: a.address,
    description: a.description,
    logo_url: a.logo,
    is_verified: !!a.verified,
    status: a.status || 'approved',
    instagram: a.instagram || undefined,
    owner_name: owner?.name || '',
  };
}

router.get('/packages', async (_req, res) => {
  console.log('[API] GET /api/packages');
  try {
    const list = await Package.find(packageFilter()).populate('agency').sort({ createdAt: -1 }).lean();
    res.json(list.map((p) => mapPackageDoc(p)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load packages' });
  }
});

router.get('/packages/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    const p = await Package.findById(req.params.id).populate('agency').lean();
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(mapPackageDoc(p));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load package' });
  }
});

router.get('/vehicles', async (_req, res) => {
  try {
    const list = await Vehicle.find(vehicleFilter()).populate('owner').sort({ createdAt: -1 }).lean();
    res.json(list.map((v) => mapVehicleDoc(v, v.owner)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load vehicles' });
  }
});

router.get('/vehicles/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    const v = await Vehicle.findById(req.params.id).populate('owner').lean();
    if (!v) return res.status(404).json({ message: 'Not found' });
    res.json(mapVehicleDoc(v, v.owner));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load vehicle' });
  }
});

router.get('/agencies', async (_req, res) => {
  try {
    const list = await Agency.find(agencyFilter()).sort({ createdAt: -1 }).lean();
    res.json(list.map(mapAgencyDoc));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load agencies' });
  }
});

router.get('/agencies/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    const a = await Agency.findById(req.params.id).populate('owner', 'name').lean();
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json(mapAgencyDoc(a));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load agency' });
  }
});

router.get('/agencies/:id/packages', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Not found' });
    }
    const list = await Package.find({
      agency: req.params.id,
      ...packageFilter(),
    })
      .populate('agency')
      .sort({ createdAt: -1 })
      .lean();
    res.json(list.map((p) => mapPackageDoc(p)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load agency packages' });
  }
});

export default router;
