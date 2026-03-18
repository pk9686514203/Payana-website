import Agency from '../models/Agency.js';

export const registerAgency = async (req, res) => {
  try {
    const { name, location, description, phone, email, instagram } = req.body;

    // Validation
    if (!name || !location || !phone || !email) {
      return res.status(400).json({ message: 'Name, location, phone, and email are required' });
    }

    // Check if agency already exists with same email
    const existingAgency = await Agency.findOne({ email });
    if (existingAgency) {
      return res.status(400).json({ message: 'Agency with this email already exists' });
    }

    // Create new agency
    const agency = new Agency({
      name,
      owner: req.userId,
      location,
      description,
      phone,
      email,
      instagram: instagram || null,
      verified: false,
    });

    await agency.save();

    res.status(201).json({
      message: 'Agency registered successfully',
      agency,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find({ verified: true })
      .populate('owner', 'name email phone')
      .select('-__v');

    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgencyById = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.status(200).json(agency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAgency = async (req, res) => {
  try {
    const agency = await Agency.findOne({ owner: req.userId });

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    res.status(200).json(agency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAgency = async (req, res) => {
  try {
    const { name, location, description, phone, email, instagram } = req.body;

    const agency = await Agency.findOne({ _id: req.params.id, owner: req.userId });

    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    if (name) agency.name = name;
    if (location) agency.location = location;
    if (description) agency.description = description;
    if (phone) agency.phone = phone;
    if (email) agency.email = email;
    if (instagram) agency.instagram = instagram;

    await agency.save();

    res.status(200).json({
      message: 'Agency updated successfully',
      agency,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
