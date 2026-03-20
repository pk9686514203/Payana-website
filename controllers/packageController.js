import Package from '../models/Package.js';
import Agency from '../models/Agency.js';
import mongoose from 'mongoose';
import {
  validateStringField,
  validateNumberField,
  validateStringArray,
  sanitizeInput,
} from '../utils/validation.js';

export const addPackage = async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected for addPackage');
      return res.status(503).json({ message: 'Database connection error. Please try again later.' });
    }

    const {
      name,
      price,
      duration,
      description,
      locations,
      itinerary,
      includes,
      agencyId,
    } = req.body;

    console.log('📦 Adding new package:', { name, agencyId });

    // Validate required string fields
    const nameValidation = validateStringField(name, 'Package name', 2, 200);
    if (!nameValidation.isValid) {
      return res.status(400).json({ message: nameValidation.error });
    }

    const durationValidation = validateStringField(duration, 'Duration', 2, 50);
    if (!durationValidation.isValid) {
      return res.status(400).json({ message: durationValidation.error });
    }

    // Validate price
    const priceValidation = validateNumberField(price, 'Price', 0.01, 1000000);
    if (!priceValidation.isValid) {
      return res.status(400).json({ message: priceValidation.error });
    }

    // Validate agencyId
    if (!agencyId || typeof agencyId !== 'string') {
      return res.status(400).json({ message: 'Valid agency ID is required' });
    }

    // Validate agency ID format
    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: 'Invalid agency ID format' });
    }

    // Check if agency exists
    console.log(`🔍 Checking if agency exists: ${agencyId}`);
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    // Sanitize optional fields
    const sanitizedDescription = description ? sanitizeInput(description) : '';
    
    // Parse and sanitize locations
    let parsedLocations = [];
    if (locations) {
      if (typeof locations === 'string') {
        parsedLocations = locations.split(',').map((l) => sanitizeInput(l)).filter((l) => l);
      } else if (Array.isArray(locations)) {
        parsedLocations = locations.map((l) => sanitizeInput(String(l))).filter((l) => l);
      }
    }

    // Parse and sanitize itinerary
    let parsedItinerary = [];
    if (itinerary) {
      if (typeof itinerary === 'string') {
        parsedItinerary = itinerary.split('\n').map((i) => sanitizeInput(i)).filter((i) => i);
      } else if (Array.isArray(itinerary)) {
        parsedItinerary = itinerary.map((i) => sanitizeInput(String(i))).filter((i) => i);
      }
    }

    // Parse and sanitize includes
    let parsedIncludes = [];
    if (includes) {
      if (typeof includes === 'string') {
        parsedIncludes = includes.split(',').map((i) => sanitizeInput(i)).filter((i) => i);
      } else if (Array.isArray(includes)) {
        parsedIncludes = includes.map((i) => sanitizeInput(String(i))).filter((i) => i);
      }
    }

    let image = null;
    if (req.file) {
      image = `/images/${req.file.filename}`;
    }

    const tourPackage = new Package({
      name: nameValidation.value,
      price: priceValidation.value,
      duration: durationValidation.value,
      description: sanitizedDescription,
      locations: parsedLocations,
      itinerary: parsedItinerary,
      includes: parsedIncludes,
      agency: agencyId,
      image,
    });

    await tourPackage.save();

    // Update agency packages count
    agency.packagesCount = (agency.packagesCount || 0) + 1;
    await agency.save();

    console.log(`✅ Package added successfully: ${tourPackage._id}`);
    res.status(201).json({
      message: 'Package added successfully',
      package: tourPackage,
    });
  } catch (error) {
    console.error('❌ Add package error:', {
      message: error.message,
      code: error.code,
    });

    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Database connection error. Please try again later.' });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Package with this name already exists' });
    }

    res.status(500).json({ message: 'Failed to add package. Please try again.' });
  }
};

export const getAllPackages = async (req, res) => {
  try {
    console.log('📦 Fetching all verified packages...');

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected');
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        connectionStatus: mongoose.connection.readyState 
      });
    }

    console.log('🔍 Querying Package collection...');
    const packages = await Package.find({ verified: true })
      .populate('agency', 'name location email phone');

    console.log(`✅ Found ${packages.length} verified packages`);
    res.status(200).json(packages);
  } catch (error) {
    console.error('❌ Get packages error:', {
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Handle specific MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.' 
      });
    }

    res.status(500).json({ message: 'Failed to fetch packages. Please try again.' });
  }
};

export const getPackagesByAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log(`📦 Fetching packages for agency: ${agencyId}`);

    // Validate agency ID format
    if (!mongoose.Types.ObjectId.isValid(agencyId)) {
      return res.status(400).json({ message: 'Invalid agency ID format' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected');
      return res.status(503).json({ message: 'Database connection error' });
    }

    const packages = await Package.find({ agency: agencyId, verified: true })
      .populate('agency', 'name location email phone');

    console.log(`✅ Found ${packages.length} packages for agency ${agencyId}`);
    res.status(200).json(packages);
  } catch (error) {
    console.error('❌ Get packages by agency error:', error.message);
    
    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Database connection error' });
    }

    res.status(500).json({ message: 'Failed to fetch packages. Please try again.' });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Fetching package: ${id}`);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid package ID format' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection error' });
    }

    const tourPackage = await Package.findById(id)
      .populate('agency', 'name location email phone verified');

    if (!tourPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    console.log(`✅ Retrieved package: ${tourPackage.name}`);
    res.status(200).json(tourPackage);
  } catch (error) {
    console.error('❌ Get package by ID error:', error.message);
    
    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      return res.status(503).json({ message: 'Database connection error' });
    }

    res.status(500).json({ message: 'Failed to fetch package. Please try again.' });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const {
      name,
      price,
      duration,
      description,
      locations,
      itinerary,
      includes,
    } = req.body;

    const tourPackage = await Package.findById(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (name) tourPackage.name = name;
    if (price) tourPackage.price = parseFloat(price);
    if (duration) tourPackage.duration = duration;
    if (description) tourPackage.description = description;
    if (locations) tourPackage.locations = locations.split(',').map((l) => l.trim());
    if (itinerary) tourPackage.itinerary = itinerary.split('\n').filter((i) => i.trim());
    if (includes) tourPackage.includes = includes.split(',').map((i) => i.trim());

    if (req.file) {
      tourPackage.image = `/images/${req.file.filename}`;
    }

    await tourPackage.save();

    res.status(200).json({
      message: 'Package updated successfully',
      package: tourPackage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const tourPackage = await Package.findByIdAndDelete(req.params.id);

    if (!tourPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Update agency packages count
    const agency = await Agency.findById(tourPackage.agency);
    if (agency) {
      agency.packagesCount = Math.max(0, (agency.packagesCount || 1) - 1);
      await agency.save();
    }

    res.status(200).json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
