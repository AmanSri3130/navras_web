const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  capacity: { type: Number, default: 50 },
  contactPerson: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  amenities: [{ type: String }],
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
