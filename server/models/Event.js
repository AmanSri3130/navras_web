const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['poetry', 'singing', 'mehfil', 'openmic'], required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostName: { type: String, required: true },
  hostBio: { type: String, default: '' },
  hostAvatar: { type: String, default: '' },
  date: { type: Date, required: true },
  dateFormatted: { type: String },
  time: { type: String, required: true },
  city: { type: String, required: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', default: null },
  venue: { type: String, required: true },
  price: { type: Number, default: 0, min: 0 },
  seatsTotal: { type: Number, required: true, min: 1 },
  seatsRemaining: { type: Number, required: true },
  image: { type: String, default: '' },
  lineup: [{ type: String }],
  gallery: [{ type: String }],
  sponsorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sponsor' }],
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

// Virtual: seats sold
eventSchema.virtual('seatsSold').get(function () {
  return this.seatsTotal - this.seatsRemaining;
});

// Virtual: revenue generated
eventSchema.virtual('grossRevenue').get(function () {
  return this.price * (this.seatsTotal - this.seatsRemaining);
});

module.exports = mongoose.model('Event', eventSchema);
