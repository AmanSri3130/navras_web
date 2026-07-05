require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const seed = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});
  await Venue.deleteMany({});
  console.log('Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Navras Admin',
    email: 'admin@navras.in',
    phone: '9999999999',
    password: 'Admin@Navras123',
    role: 'admin',
    isVerified: true,
  });
  console.log(`✅ Admin created: admin@navras.in / Admin@Navras123`);

  // Create sample venues
  const venues = await Venue.insertMany([
    { name: 'The Amaltas Baithak', address: 'Nizamuddin East', city: 'Delhi', capacity: 30, contactPerson: 'Ravi Kumar', phone: '9876543210' },
    { name: 'Kala Ghoda Art House', address: 'Colaba', city: 'Mumbai', capacity: 25, contactPerson: 'Meena Shah', phone: '9876543211' },
    { name: 'The Sufi Courtyard', address: 'Indiranagar', city: 'Bangalore', capacity: 40, contactPerson: 'Arjun Menon', phone: '9876543212' },
    { name: 'The Haveli Library', address: 'Pink City', city: 'Jaipur', capacity: 20, contactPerson: 'Priya Rajput', phone: '9876543213' },
  ]);
  console.log(`✅ ${venues.length} venues created`);

  // Create sample events
  const events = await Event.insertMany([
    {
      title: 'Mehfil-e-Ghazal under the Stars',
      type: 'mehfil',
      tagline: 'An evening of soulful ghazals, warm tea, and classic melodies.',
      description: 'Join us for a candlelit rooftop evening dedicated to the timeless poetry of Ghalib, Faiz, and Mir.',
      hostId: admin._id,
      hostName: 'Ustad Shujaat Ali',
      hostBio: 'A veteran ghazal singer and classical music researcher.',
      date: new Date('2026-10-15'),
      dateFormatted: 'Oct 15, 2026',
      time: '06:30 PM - 09:30 PM',
      city: 'Delhi',
      venueId: venues[0]._id,
      venue: 'The Amaltas Baithak, Nizamuddin East',
      price: 650,
      seatsTotal: 30,
      seatsRemaining: 8,
      lineup: ['Ustad Shujaat Ali (Vocals & Harmonium)', 'Priyanka Prasad (Sitar)', 'Mahesh Dutt (Tabla)'],
      status: 'upcoming',
    },
    {
      title: 'Kavi Sammelan & Kulhad Chai',
      type: 'poetry',
      tagline: 'Celebrating the beauty of Hindustani verse and shared conversations.',
      description: 'An open-circle gathering where poets share original verses, nazms, and shayaris.',
      hostId: admin._id,
      hostName: 'Vasundhara Sharma',
      date: new Date('2026-10-18'),
      dateFormatted: 'Oct 18, 2026',
      time: '04:00 PM - 07:00 PM',
      city: 'Mumbai',
      venueId: venues[1]._id,
      venue: 'Kala Ghoda Art House, Colaba',
      price: 300,
      seatsTotal: 25,
      seatsRemaining: 12,
      lineup: ['Vasundhara Sharma (Host)', 'Aseem Mishra (Urdu shayari)'],
      status: 'upcoming',
    },
    {
      title: 'Baithak: Acoustic Sufi Night',
      type: 'singing',
      tagline: 'An evening of spiritual resonance, mystical poetry, and acoustic strings.',
      description: 'Immerse yourself in acoustic Sufi melodies and Bulleh Shah recitations.',
      hostId: admin._id,
      hostName: 'Kabir & The Mystic Circle',
      date: new Date('2026-10-24'),
      dateFormatted: 'Oct 24, 2026',
      time: '07:00 PM - 10:00 PM',
      city: 'Bangalore',
      venueId: venues[2]._id,
      venue: 'The Sufi Courtyard, Indiranagar',
      price: 500,
      seatsTotal: 40,
      seatsRemaining: 15,
      lineup: ['Kabir Sen (Rabab & Lead Vocals)', 'Divya Hegde (Acoustic Guitar)'],
      status: 'upcoming',
    },
    {
      title: 'Urdu Shayari & Ghazal Open Mic',
      type: 'openmic',
      tagline: 'Step up to the mic and share your soulful verses.',
      description: 'An open mic dedicated exclusively to Urdu poetry, ghazals, and nazms.',
      hostId: admin._id,
      hostName: 'Farhan Akhter',
      date: new Date('2026-10-29'),
      dateFormatted: 'Oct 29, 2026',
      time: '05:30 PM - 08:30 PM',
      city: 'Jaipur',
      venueId: venues[3]._id,
      venue: 'The Haveli Library, Pink City',
      price: 0,
      seatsTotal: 20,
      seatsRemaining: 5,
      lineup: ['Farhan Akhter (Host)', 'Open Mic slots for registered performers'],
      status: 'upcoming',
    },
  ]);
  console.log(`✅ ${events.length} events created`);

  console.log('\n🎉 Seed complete!\n');
  console.log('Admin Login:');
  console.log('  Email: admin@navras.in');
  console.log('  Password: Admin@Navras123\n');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
