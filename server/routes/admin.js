const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Venue = require('../models/Venue');
const Sponsor = require('../models/Sponsor');
const { createStyledWorkbook, generatePDF } = require('../utils/export');

// All admin routes require auth + admin role
router.use(protect, admin);

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalRegs, revenueAgg, upcomingEvents, liveEvents] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Event.countDocuments(),
      Registration.countDocuments({ status: { $ne: 'cancelled' } }),
      Registration.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ]),
      Event.countDocuments({ status: 'upcoming' }),
      Event.countDocuments({ status: 'live' }),
    ]);
    res.json({
      totalUsers,
      totalEvents,
      totalRegistrations: totalRegs,
      totalRevenue: revenueAgg[0]?.total || 0,
      upcomingEvents,
      liveEvents,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

// ── EXPORT HELPERS ───────────────────────────────────────────────────────────

// Events Export
router.get('/export/events', async (req, res) => {
  try {
    const fmt = req.query.fmt || 'xlsx';
    const events = await Event.find().populate('hostId', 'name email').sort({ date: -1 });

    const columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Date', key: 'dateFormatted', width: 18 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Venue', key: 'venue', width: 25 },
      { header: 'Host', key: 'host', width: 20 },
      { header: 'Seats Total', key: 'seatsTotal', width: 12 },
      { header: 'Seats Remaining', key: 'seatsRemaining', width: 16 },
      { header: 'Price (₹)', key: 'price', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    const rows = events.map(e => ({
      title: e.title,
      type: e.type,
      dateFormatted: e.dateFormatted || String(e.date),
      city: e.city,
      venue: e.venue,
      host: e.hostId?.name || 'N/A',
      seatsTotal: e.seatsTotal,
      seatsRemaining: e.seatsRemaining,
      price: e.price,
      status: e.status,
    }));

    if (fmt === 'pdf') {
      generatePDF(res, 'Events Report', columns, rows);
    } else {
      const wb = createStyledWorkbook('Events', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="navras_events.xlsx"');
      await wb.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Export failed' });
  }
});

// Registrations Export
router.get('/export/registrations', async (req, res) => {
  try {
    const fmt = req.query.fmt || 'xlsx';
    const regs = await Registration.find().sort({ createdAt: -1 });

    const columns = [
      { header: 'Name', key: 'userName', width: 20 },
      { header: 'Email', key: 'userEmail', width: 25 },
      { header: 'Phone', key: 'userPhone', width: 15 },
      { header: 'Event', key: 'eventTitle', width: 30 },
      { header: 'Date', key: 'eventDate', width: 15 },
      { header: 'Venue', key: 'eventVenue', width: 25 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Seats', key: 'seats', width: 8 },
      { header: 'Amount (₹)', key: 'price', width: 12 },
      { header: 'Ticket Code', key: 'ticketCode', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Registered On', key: 'createdAt', width: 20 },
    ];

    const rows = regs.map(r => ({
      ...r.toObject(),
      createdAt: new Date(r.createdAt).toLocaleString('en-IN'),
    }));

    if (fmt === 'pdf') {
      generatePDF(res, 'Registrations Report', columns, rows);
    } else {
      const wb = createStyledWorkbook('Registrations', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="navras_registrations.xlsx"');
      await wb.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});

// Users Export
router.get('/export/users', async (req, res) => {
  try {
    const fmt = req.query.fmt || 'xlsx';
    const users = await User.find({ role: 'user' }).select('-password -otp -otpExpiry').sort({ createdAt: -1 });

    const userIds = users.map(u => u._id);
    const regCounts = await Registration.aggregate([
      { $match: { userId: { $in: userIds }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$userId', total: { $sum: 1 }, asAudience: { $sum: { $cond: [{ $eq: ['$type', 'audience'] }, 1, 0] } }, asPerformer: { $sum: { $cond: [{ $eq: ['$type', 'performer'] }, 1, 0] } }, totalSpent: { $sum: '$price' } } }
    ]);
    const regMap = Object.fromEntries(regCounts.map(r => [r._id.toString(), r]));

    const columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Verified', key: 'isVerified', width: 10 },
      { header: 'Events (Total)', key: 'total', width: 14 },
      { header: 'As Audience', key: 'asAudience', width: 13 },
      { header: 'As Performer', key: 'asPerformer', width: 13 },
      { header: 'Total Spent (₹)', key: 'totalSpent', width: 15 },
      { header: 'Joined', key: 'createdAt', width: 18 },
    ];

    const rows = users.map(u => {
      const stats = regMap[u._id.toString()] || {};
      return {
        name: u.name,
        email: u.email,
        phone: u.phone,
        isVerified: u.isVerified ? 'Yes' : 'No',
        total: stats.total || 0,
        asAudience: stats.asAudience || 0,
        asPerformer: stats.asPerformer || 0,
        totalSpent: stats.totalSpent || 0,
        createdAt: new Date(u.createdAt).toLocaleString('en-IN'),
      };
    });

    if (fmt === 'pdf') {
      generatePDF(res, 'Users Report', columns, rows);
    } else {
      const wb = createStyledWorkbook('Users', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="navras_users.xlsx"');
      await wb.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});

// Revenue Export
router.get('/export/revenue', async (req, res) => {
  try {
    const fmt = req.query.fmt || 'xlsx';
    const revenue = await Registration.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$eventId',
          eventTitle: { $first: '$eventTitle' },
          audienceCount: { $sum: { $cond: [{ $eq: ['$type', 'audience'] }, 1, 0] } },
          performerCount: { $sum: { $cond: [{ $eq: ['$type', 'performer'] }, 1, 0] } },
          gross: { $sum: '$price' },
        }
      },
      { $sort: { gross: -1 } }
    ]);

    const columns = [
      { header: 'Event', key: 'eventTitle', width: 30 },
      { header: 'Audience Count', key: 'audienceCount', width: 15 },
      { header: 'Performer Slots', key: 'performerCount', width: 15 },
      { header: 'Gross Revenue (₹)', key: 'gross', width: 18 },
    ];

    const rows = revenue.map(r => ({ ...r }));

    if (fmt === 'pdf') {
      generatePDF(res, 'Revenue Report', columns, rows);
    } else {
      const wb = createStyledWorkbook('Revenue', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="navras_revenue.xlsx"');
      await wb.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});

// Venues Export
router.get('/export/venues', async (req, res) => {
  try {
    const fmt = req.query.fmt || 'xlsx';
    const venues = await Venue.find().sort({ createdAt: -1 });

    const columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Capacity', key: 'capacity', width: 12 },
      { header: 'Contact Person', key: 'contactPerson', width: 20 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
    ];

    const rows = venues.map(v => v.toObject());

    if (fmt === 'pdf') {
      generatePDF(res, 'Venues Report', columns, rows);
    } else {
      const wb = createStyledWorkbook('Venues', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="navras_venues.xlsx"');
      await wb.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});

// Sponsors Export
router.get('/export/sponsors', async (req, res) => {
  try {
    const fmt = req.query.fmt || 'xlsx';
    const sponsors = await Sponsor.find().sort({ amount: -1 });

    const columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Tier', key: 'tier', width: 12 },
      { header: 'Amount (₹)', key: 'amount', width: 15 },
      { header: 'Contact Email', key: 'contactEmail', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
    ];

    const rows = sponsors.map(s => s.toObject());

    if (fmt === 'pdf') {
      generatePDF(res, 'Sponsors Report', columns, rows);
    } else {
      const wb = createStyledWorkbook('Sponsors', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="navras_sponsors.xlsx"');
      await wb.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});

// ── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ── GET /api/admin/registrations ─────────────────────────────────────────────
router.get('/registrations', async (req, res) => {
  try {
    const regs = await Registration.find().sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

module.exports = router;
