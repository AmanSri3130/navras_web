const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  type: { type: String, enum: ['audience', 'performer'], required: true },
  seats: { type: Number, default: 1, min: 1, max: 10 },
  price: { type: Number, default: 0 }, // total paid
  ticketCode: { type: String, unique: true, required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'pending_review', 'attended', 'cancelled'], 
    default: 'confirmed' 
  },
  // Performer-specific fields
  performerDetails: {
    instrument: { type: String, default: '' },
    genre: { type: String, default: '' },
    bio: { type: String, default: '' },
    experienceLink: { type: String, default: '' },
  },
  // Snapshot of user info at time of registration
  userName: { type: String },
  userEmail: { type: String },
  userPhone: { type: String },
  // Snapshot of event info
  eventTitle: { type: String },
  eventDate: { type: String },
  eventVenue: { type: String },
}, { timestamps: true });

// Generate unique ticket code before save
registrationSchema.pre('save', function (next) {
  if (!this.ticketCode) {
    const suffix = this.type === 'audience' ? 'AUD' : 'PERF';
    this.ticketCode = `NAV-${Math.floor(10000 + Math.random() * 90000)}-${suffix}`;
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
