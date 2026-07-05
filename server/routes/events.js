const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

// ── GET /api/events ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { type, city, maxPrice, status } = req.query;
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('hostId', 'name avatar')
      .populate('venueId', 'name address city')
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// ── GET /api/events/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('hostId', 'name avatar bio')
      .populate('venueId')
      .populate('sponsorIds');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// ── POST /api/events ─────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, type, tagline, description, date, dateFormatted, time, city, venue, price, seatsTotal, lineup } = req.body;

    if (!title || !type || !date || !city || !seatsTotal)
      return res.status(400).json({ message: 'Title, type, date, city, and seats are required' });

    const event = await Event.create({
      ...req.body,
      hostId: req.user._id,
      hostName: req.user.name,
      hostAvatar: req.user.avatar || '',
      seatsRemaining: seatsTotal,
    });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// ── PATCH /api/events/:id ────────────────────────────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isHostOrAdmin = event.hostId.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isHostOrAdmin) return res.status(403).json({ message: 'Not authorized' });

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// ── DELETE /api/events/:id ───────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isHostOrAdmin = event.hostId.toString() === req.user._id.toString() || req.user.role === 'admin';
    if (!isHostOrAdmin) return res.status(403).json({ message: 'Not authorized' });

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;
