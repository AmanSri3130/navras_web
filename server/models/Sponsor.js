const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  tier: { type: String, enum: ['gold', 'silver', 'bronze', 'community'], default: 'community' },
  amount: { type: Number, default: 0 }, // Sponsorship amount in INR
  eventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Sponsor', sponsorSchema);
