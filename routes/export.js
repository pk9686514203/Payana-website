import express from 'express';
import ExcelJS from 'exceljs';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Agency from '../models/Agency.js';

const router = express.Router();

function exportKeyOk(req) {
  const key = process.env.EXPORT_SECRET || process.env.INTERNAL_API_KEY;
  if (!key) return false;
  const header = req.headers['x-export-key'] || req.headers['x-internal-key'];
  const q = req.query.key;
  return header === key || q === key;
}

function formatInr(n) {
  if (n == null || Number.isNaN(Number(n))) return '';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n));
  } catch {
    return `₹${n}`;
  }
}

router.get('/excel', async (req, res) => {
  try {
    if (!exportKeyOk(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [users, bookings, agencies] = await Promise.all([
      User.find().select('-password').lean(),
      Booking.find().sort({ createdAt: -1 }).lean(),
      Agency.find().lean(),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Namma Payana';

    const usersSheet = workbook.addWorksheet('Users');
    usersSheet.columns = [
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Phone', key: 'phone', width: 14 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'Agency Name', key: 'agencyName', width: 24 },
      { header: 'Address', key: 'address', width: 36 },
      { header: 'Created', key: 'createdAt', width: 22 },
    ];
    users.forEach((u) => {
      usersSheet.addRow({
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        agencyName: u.agencyName || '',
        address: u.address || '',
        createdAt: u.createdAt,
      });
    });

    const bookingsSheet = workbook.addWorksheet('Bookings');
    bookingsSheet.columns = [
      { header: 'Booking Ref', key: 'bookingRef', width: 22 },
      { header: 'Name', key: 'name', width: 22 },
      { header: 'Phone', key: 'phone', width: 14 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Role (user)', key: 'role', width: 12 },
      { header: 'Pickup', key: 'pickup', width: 18 },
      { header: 'Drop', key: 'drop', width: 18 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Time', key: 'time', width: 10 },
      { header: 'Vehicle / Item', key: 'vehicle', width: 22 },
      { header: 'Persons', key: 'persons', width: 10 },
      { header: 'Price', key: 'price', width: 14 },
      { header: 'Agency', key: 'agencyName', width: 22 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created', key: 'createdAt', width: 22 },
    ];
    bookings.forEach((b) => {
      bookingsSheet.addRow({
        bookingRef: b.bookingRef,
        name: b.name,
        phone: b.phone,
        email: b.email,
        role: '',
        pickup: b.pickup,
        drop: b.drop,
        date: b.date,
        time: b.time,
        vehicle: b.vehicle,
        persons: b.persons,
        price: formatInr(b.price),
        agencyName: b.agencyName,
        status: b.status,
        createdAt: b.createdAt,
      });
    });

    const agenciesSheet = workbook.addWorksheet('Agencies');
    agenciesSheet.columns = [
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Phone', key: 'phone', width: 14 },
      { header: 'Address', key: 'address', width: 36 },
      { header: 'Verified', key: 'verified', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created', key: 'createdAt', width: 22 },
    ];
    agencies.forEach((a) => {
      agenciesSheet.addRow({
        name: a.name,
        email: a.email,
        phone: a.phone,
        address: a.address,
        verified: a.verified ? 'Yes' : 'No',
        status: a.status,
        createdAt: a.createdAt,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="payana-export.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error('Export error:', e);
    res.status(500).json({ message: 'Export failed' });
  }
});

export default router;
