const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const protect = require('../middleware/auth');

// ── POST /api/registrations ──────────────────────────────────────────────────
// Register for an event (audience or performer)
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, type, seats = 1, performerDetails } = req.body;
    if (!eventId || !type) return res.status(400).json({ message: 'eventId and type are required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.seatsRemaining < seats) return res.status(400).json({ message: `Only ${event.seatsRemaining} seats remaining` });

    // Check duplicate registration
    const existing = await Registration.findOne({ userId: req.user._id, eventId });
    if (existing) return res.status(400).json({ message: 'You are already registered for this event' });

    // Create registration
    const reg = await Registration.create({
      userId: req.user._id,
      eventId,
      type,
      seats,
      price: event.price * seats,
      performerDetails: type === 'performer' ? performerDetails : undefined,
      // Snapshots
      userName: req.user.name,
      userEmail: req.user.email,
      userPhone: req.user.phone,
      eventTitle: event.title,
      eventDate: event.dateFormatted,
      eventVenue: event.venue,
    });

    // Decrement seats atomically
    event.seatsRemaining = event.seatsRemaining - seats;
    await event.save();

    // Emit real-time seat update via Socket.IO (attached to app)
    const io = req.app.get('io');
    if (io) {
      io.emit('seat-update', { eventId: event._id.toString(), seatsRemaining: event.seatsRemaining });
    }

    res.status(201).json(reg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ── GET /api/registrations/me ────────────────────────────────────────────────
// Get current user's registrations
router.get('/me', protect, async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.user._id })
      .populate('eventId', 'title date dateFormatted time city venue image status')
      .sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

// ── GET /api/registrations/event/:eventId ────────────────────────────────────
// Get all registrations for an event (host or admin)
router.get('/event/:eventId', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isHostOrAdmin = event.hostId.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isHostOrAdmin) return res.status(403).json({ message: 'Not authorized' });

    const regs = await Registration.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

// ── PATCH /api/registrations/:id/cancel ─────────────────────────────────────
// Cancel a registration and restore seats
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });
    if (reg.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (reg.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    reg.status = 'cancelled';
    await reg.save();

    // Restore seats
    await Event.findByIdAndUpdate(reg.eventId, { $inc: { seatsRemaining: reg.seats } });

    const io = req.app.get('io');
    if (io) {
      const event = await Event.findById(reg.eventId);
      io.emit('seat-update', { eventId: reg.eventId.toString(), seatsRemaining: event.seatsRemaining });
    }

    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel registration' });
  }
});

// ── PATCH /api/registrations/:id/approve ────────────────────────────────────
// Approve a performer registration
router.patch('/:id/approve', protect, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found' });

    const event = await Event.findById(reg.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isHostOrAdmin = event.hostId.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isHostOrAdmin) return res.status(403).json({ message: 'Not authorized' });

    reg.status = 'confirmed';
    await reg.save();

    res.json(reg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve registration' });
  }
});

module.exports = router;
