import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import {
  isValidEmail,
  isValidPhone,
  validatePassword,
  validateStringField,
} from '../utils/validation.js';

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate name
    const nameValidation = validateStringField(name, 'Name', 2, 100);
    if (!nameValidation.isValid) {
      return res.status(400).json({ message: nameValidation.error });
    }

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate phone
    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ 
        message: 'Please provide a valid phone number (10+ digits)' 
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.errors[0] });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Validate role
    const validRoles = ['user', 'agent', 'operator', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Create new user with sanitized data
    const user = new User({
      name: nameValidation.value,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role: userRole,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.toJSON());
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};
