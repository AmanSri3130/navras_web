const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Registration = require('../models/Registration');
const protect = require('../middleware/auth');

// ── GET /api/users/me ────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// ── PATCH /api/users/me ──────────────────────────────────────────────────────
router.patch('/me', protect, async (req, res) => {
  try {
    const { name, phone, bio, location, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, bio, location, avatar },
      { new: true, select: '-password -otp -otpExpiry' }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// ── GET /api/users/me/stats ──────────────────────────────────────────────────
router.get('/me/stats', protect, async (req, res) => {
  try {
    const totalRegs = await Registration.countDocuments({ userId: req.user._id });
    const asAudience = await Registration.countDocuments({ userId: req.user._id, type: 'audience' });
    const asPerformer = await Registration.countDocuments({ userId: req.user._id, type: 'performer' });
    const spent = await Registration.aggregate([
      { $match: { userId: req.user._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    res.json({
      totalEvents: totalRegs,
      asAudience,
      asPerformer,
      totalSpent: spent[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;
