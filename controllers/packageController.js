import Package from '../models/Package.js';
import Agency from '../models/Agency.js';

export const addPackage = async (req, res) => {
  try {
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

    // Validation
    if (!name || !price || !duration || !agencyId) {
      return res
        .status(400)
        .json({ message: 'name, price, duration, and agencyId are required' });
    }

    // Check if agency exists
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    let image = null;
    if (req.file) {
      image = `/images/${req.file.filename}`;
    }

    const tourPackage = new Package({
      name,
      price: parseFloat(price),
      duration,
      description,
      locations: locations ? locations.split(',').map((l) => l.trim()) : [],
      itinerary: itinerary ? itinerary.split('\n').filter((i) => i.trim()) : [],
      includes: includes ? includes.split(',').map((i) => i.trim()) : [],
      agency: agencyId,
      image,
    });

    await tourPackage.save();

    // Update agency packages count
    agency.packagesCount = (agency.packagesCount || 0) + 1;
    await agency.save();

    res.status(201).json({
      message: 'Package added successfully',
      package: tourPackage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ verified: true })
      .populate('agency', 'name location email phone');

    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackagesByAgency = async (req, res) => {
  try {
    const packages = await Package.find({ agency: req.params.agencyId, verified: true })
      .populate('agency', 'name location email phone');

    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const tourPackage = await Package.findById(req.params.id)
      .populate('agency', 'name location email phone verified');

    if (!tourPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.status(200).json(tourPackage);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
