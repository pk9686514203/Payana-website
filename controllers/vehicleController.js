import Vehicle from '../models/Vehicle.js';
import Agency from '../models/Agency.js';

export const addVehicle = async (req, res) => {
  try {
    const { name, type, seats, pricePerKm, location, agencyId, features } = req.body;

    // Validation
    if (!name || !type || !seats || !pricePerKm || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if agency exists if agencyId provided
    if (agencyId) {
      const agency = await Agency.findById(agencyId);
      if (!agency) {
        return res.status(404).json({ message: 'Agency not found' });
      }
    }

    let image = null;
    if (req.file) {
      image = `/images/${req.file.filename}`;
    }

    const vehicle = new Vehicle({
      name,
      type,
      seats: parseInt(seats),
      pricePerKm: parseFloat(pricePerKm),
      owner: req.userId,
      agency: agencyId || null,
      location,
      image,
      features: features ? features.split(',').map((f) => f.trim()) : [],
    });

    await vehicle.save();

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ verified: true })
      .populate('owner', 'name email')
      .populate('agency', 'name location');

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehiclesByAgency = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ agency: req.params.agencyId, verified: true })
      .populate('owner', 'name email')
      .populate('agency', 'name location');

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('agency', 'name location email phone');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { name, type, seats, pricePerKm, location, features } = req.body;

    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.userId });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (name) vehicle.name = name;
    if (type) vehicle.type = type;
    if (seats) vehicle.seats = parseInt(seats);
    if (pricePerKm) vehicle.pricePerKm = parseFloat(pricePerKm);
    if (location) vehicle.location = location;
    if (features) vehicle.features = features.split(',').map((f) => f.trim());

    if (req.file) {
      vehicle.image = `/images/${req.file.filename}`;
    }

    await vehicle.save();

    res.status(200).json({
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
