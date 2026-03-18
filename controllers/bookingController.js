import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import Vehicle from '../models/Vehicle.js';

export const createBooking = async (req, res) => {
  try {
    const { packageId, vehicleId, bookingDate, fromLocation, toLocation, numberOfPeople, notes } = req.body;

    // Validation
    if (!bookingDate || !fromLocation || !toLocation) {
      return res
        .status(400)
        .json({ message: 'booking date, from location, and to location are required' });
    }

    if (!packageId && !vehicleId) {
      return res.status(400).json({ message: 'Either packageId or vehicleId is required' });
    }

    let totalPrice = 0;

    // Calculate total price based on package or vehicle
    if (packageId) {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }
      totalPrice = pkg.price;
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      // Simple calculation: assume 100km default if not specified
      totalPrice = vehicle.pricePerKm * 100 * (numberOfPeople || 1);
    }

    const booking = new Booking({
      user: req.userId,
      package: packageId || null,
      vehicle: vehicleId || null,
      bookingDate: new Date(bookingDate),
      fromLocation,
      toLocation,
      numberOfPeople: numberOfPeople || 1,
      totalPrice,
      notes: notes || '',
    });

    await booking.save();

    const populatedBooking = await booking
      .populate('user', 'name email phone')
      .populate('package', 'name price duration agency')
      .populate('vehicle', 'name type seats pricePerKm');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate('package', 'name price duration')
      .populate('vehicle', 'name type seats')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('package', 'name price duration agency')
      .populate('vehicle', 'name type seats pricePerKm');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { bookingDate, fromLocation, toLocation, numberOfPeople, notes, status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (bookingDate) booking.bookingDate = new Date(bookingDate);
    if (fromLocation) booking.fromLocation = fromLocation;
    if (toLocation) booking.toLocation = toLocation;
    if (numberOfPeople) booking.numberOfPeople = numberOfPeople;
    if (notes) booking.notes = notes;
    if (status) booking.status = status;

    await booking.save();

    res.status(200).json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
