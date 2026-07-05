import wa1 from '../assets/WhatsApp Image 2026-07-03 at 11.50.38 AM.jpeg';
import wa2 from '../assets/WhatsApp Image 2026-07-03 at 11.50.39 AM (1).jpeg';
import wa3 from '../assets/WhatsApp Image 2026-07-03 at 11.50.39 AM.jpeg';
import wa4 from '../assets/WhatsApp Image 2026-07-03 at 11.50.40 AM (1).jpeg';
import wa5 from '../assets/WhatsApp Image 2026-07-03 at 11.50.40 AM.jpeg';
import gulmohar from '../assets/gulmohar.jpeg';

// All real Navras event photos for gallery, events, etc.
export const navrasPhotos = [wa1, wa2, wa3, wa4, wa5];

export const initialEvents = [
  {
    id: 'ev-1',
    title: 'Mehfil-e-Ghazal under the Stars',
    type: 'mehfil',
    tagline: 'An evening of soulful ghazals, warm tea, and classic melodies.',
    description: 'Join us for a candlelit rooftop evening dedicated to the timeless poetry of Ghalib, Faiz, and Mir, set to classical tunes on the harmonium and sitar. This is an intimate gathering designed for people who appreciate the depth of words and the softness of classical notes. Warm Kashmiri Kahwa and light snacks will be served.',
    hostName: 'Ustad Shujaat Ali',
    hostBio: 'A veteran ghazal singer and classical music researcher who has been hosting baithaks for over two decades.',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: '2026-10-15',
    dateFormatted: 'Oct 15, 2026',
    time: '06:30 PM - 09:30 PM',
    city: 'Delhi',
    venue: 'The Amaltas Baithak, Nizamuddin East',
    price: 650,
    seatsTotal: 30,
    seatsRemaining: 8,
    image: wa2,
    lineup: ['Ustad Shujaat Ali (Vocals & Harmonium)', 'Priyanka Prasad (Sitar)', 'Mahesh Dutt (Tabla)'],
    gallery: [wa2, wa3, wa5],
    participants: [
      { name: 'Kunal Sen', email: 'kunal@gmail.com', type: 'performer', instrument: 'Flute', bio: 'Flautist training in Hindustani classical for 5 years.' },
      { name: 'Sameer Sheikh', email: 'sameer@gmail.com', type: 'performer', instrument: 'Violin', bio: 'Performs classical covers on violin.' }
    ],
    audience: [
      { name: 'Aditi Rao', email: 'aditi@outlook.com', type: 'audience', seats: 2 },
      { name: 'Rohan Sharma', email: 'rohan@gmail.com', type: 'audience', seats: 1 },
      { name: 'Meera Nair', email: 'meera@gmail.com', type: 'audience', seats: 2 }
    ]
  },
  {
    id: 'ev-2',
    title: 'Kavi Sammelan & Kulhad Chai',
    type: 'poetry',
    tagline: 'Celebrating the beauty of Hindustani verse and shared conversations.',
    description: 'An open-circle gathering where poets and enthusiasts share their original verses, nazms, and shayaris in Hindustani. Set on comfortable floor cushions (gaddi layout), this evening celebrates the oral tradition of poetry. Every attendee gets a warm kulhad of spiced chai and a cozy atmosphere to connect with fellow writers.',
    hostName: 'Vasundhara Sharma',
    hostBio: 'Poet, storyteller, and literature organizer. She leads the Navras Poetry Collective in Mumbai.',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: '2026-10-18',
    dateFormatted: 'Oct 18, 2026',
    time: '04:00 PM - 07:00 PM',
    city: 'Mumbai',
    venue: 'Kala Ghoda Art House, Colaba',
    price: 300,
    seatsTotal: 25,
    seatsRemaining: 12,
    image: wa5,
    lineup: ['Vasundhara Sharma (Host)', 'Aseem Mishra (Urdu shayari)', 'Zainab Anwar (Modern Hindi poetry)'],
    gallery: [wa5, wa4, wa2],
    participants: [
      { name: 'Ananya Roy', email: 'ananya@gmail.com', type: 'performer', genre: 'Urdu Nazm', bio: 'Writes about city life and nostalgia.' }
    ],
    audience: [
      { name: 'Vikram Seth', email: 'vikram@gmail.com', type: 'audience', seats: 1 },
      { name: 'Sneha Patel', email: 'sneha@yahoo.com', type: 'audience', seats: 2 }
    ]
  },
  {
    id: 'ev-3',
    title: 'Baithak: Acoustic Sufi Night',
    type: 'singing',
    tagline: 'An evening of spiritual resonance, mystical poetry, and acoustic strings.',
    description: 'Immerse yourself in a serene baithak where the focus is entirely on acoustic Sufi melodies, Bulleh Shah and Rumi recitations, and deep vocal harmonies. There are no loud sound systems here — just raw vocals, acoustical chords, and a carpeted floor layout lit by diyas. Tea and traditional sweets will be served.',
    hostName: 'Kabir & The Mystic Circle',
    hostBio: 'An acoustic folk-Sufi collective that rearranges classical mystical poetry using acoustic guitars, rabab, and percussion.',
    hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: '2026-10-24',
    dateFormatted: 'Oct 24, 2026',
    time: '07:00 PM - 10:00 PM',
    city: 'Bangalore',
    venue: 'The Sufi Courtyard, Indiranagar',
    price: 500,
    seatsTotal: 40,
    seatsRemaining: 15,
    image: wa3,
    lineup: ['Kabir Sen (Rabab & Lead Vocals)', 'Divya Hegde (Acoustic Guitar)', 'Raman Kapoor (Tabla/Percussion)'],
    gallery: [wa3, wa2, wa5],
    participants: [
      { name: 'Nikhil Murthy', email: 'nikhil@gmail.com', type: 'performer', instrument: 'Harmonium', bio: 'Loves accompanying classical vocalists.' }
    ],
    audience: [
      { name: 'Shreya Das', email: 'shreya@gmail.com', type: 'audience', seats: 3 },
      { name: 'Amit Verma', email: 'amit@gmail.com', type: 'audience', seats: 2 }
    ]
  },
  {
    id: 'ev-4',
    title: 'Urdu Shayari & Ghazal Open Mic',
    type: 'openmic',
    tagline: 'Step up to the mic and share your soulful verses in an intimate room.',
    description: 'An open mic dedicated exclusively to Urdu poetry, ghazals, and nazms. Whether you are a seasoned shayar or reading your very first line, our supportive community is here to listen. Audience seats are limited to maintain an intimate, cozy, candlelit room where every voice is heard.',
    hostName: 'Farhan Akhter',
    hostBio: 'Writer, translator, and host who works to popularize Urdu literature among young writers.',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    date: '2026-10-29',
    dateFormatted: 'Oct 29, 2026',
    time: '05:30 PM - 08:30 PM',
    city: 'Jaipur',
    venue: 'The Haveli Library, Pink City',
    price: 0,
    seatsTotal: 20,
    seatsRemaining: 5,
    image: gulmohar,
    lineup: ['Farhan Akhter (Host)', 'Open Mic slots for registered performers'],
    gallery: [gulmohar, wa4, wa5, wa3],
    participants: [],
    audience: [
      { name: 'Priya Sharma', email: 'priya@gmail.com', type: 'audience', seats: 1 }
    ]
  }
];
