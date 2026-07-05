import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Diya from './components/Diya';
import navrasLogo from './assets/navraslogo.jpeg';
import EventCard from './components/EventCard';
import { initialEvents, navrasPhotos } from './utils/MockData';
import AboutView from './components/AboutView';
import AdminDashboard from './components/AdminDashboard';
import { InstagramIcon, WhatsAppIcon, YouTubeIcon } from './components/SocialIcons';
import { 
  Calendar, MapPin, Users, IndianRupee, Search, Filter, 
  ArrowLeft, CheckCircle, Download, Plus, Heart, Info, 
  Music, BookOpen, Sparkles, Mic, Ticket, Share2, 
  Camera, UserPlus, ChevronRight, TrendingUp, Coins, Check, AlertCircle,
  Play, Quote, Image as ImageIcon, Film, MessageSquare
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'explore' | 'detail' | 'register' | 'dashboard' | 'profile' | 'login'
  const [events, setEvents] = useState(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState('ev-1');
  const [registrationType, setRegistrationType] = useState('audience'); // 'audience' | 'performer'
  
  // Auth state — null until the user logs in
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('navras_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [userBookings, setUserBookings] = useState([]);

  const [savedEventIds, setSavedEventIds] = useState([]);
  const [newTicket, setNewTicket] = useState(null); // Holds the recently booked ticket details for confirmation screen

  // Filter state for Explore page
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');

  // Fetch all events from the backend API
  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events');
      if (res.ok) {
        const data = await res.json();
        const token = localStorage.getItem('navras_token');
        
        // For each event, if user is host or admin, fetch detailed registrations list
        const mapped = await Promise.all(data.map(async (evt) => {
          let audience = [];
          let participants = [];
          
          if (token && currentUser) {
            const isHostOrAdmin = evt.hostId === currentUser._id || evt.hostId?._id === currentUser._id || currentUser.role === 'admin';
            if (isHostOrAdmin) {
              try {
                const regRes = await fetch(`http://localhost:5000/api/registrations/event/${evt._id}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (regRes.ok) {
                  const regData = await regRes.json();
                  audience = regData.filter(r => r.type === 'audience' && r.status !== 'cancelled').map(r => ({
                    name: r.userName,
                    email: r.userEmail,
                    seats: r.seats,
                    status: r.status
                  }));
                  participants = regData.filter(r => r.type === 'performer' && r.status !== 'cancelled').map(r => ({
                    id: r._id,
                    name: r.userName,
                    email: r.userEmail,
                    instrument: r.performerDetails?.instrument || r.performerDetails?.genre || '',
                    bio: r.performerDetails?.bio || '',
                    status: r.status === 'confirmed' ? 'Approved' : 'Pending Review'
                  }));
                }
              } catch (e) {
                console.error(`Failed to fetch registrations for event ${evt._id}:`, e);
              }
            }
          }
          
          return {
            id: evt._id,
            _id: evt._id,
            title: evt.title,
            type: evt.type,
            tagline: evt.tagline,
            description: evt.description,
            hostId: evt.hostId,
            hostName: evt.hostName,
            hostBio: evt.hostBio || '',
            hostAvatar: evt.hostAvatar || '',
            date: evt.date,
            dateFormatted: evt.dateFormatted,
            time: evt.time,
            city: evt.city,
            venue: evt.venue,
            price: evt.price,
            seatsTotal: evt.seatsTotal,
            seatsRemaining: evt.seatsRemaining,
            image: evt.image || '',
            lineup: evt.lineup || [],
            gallery: evt.gallery || [],
            audience,
            participants
          };
        }));
        
        if (mapped.length > 0) {
          setEvents(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  // Fetch logged in user's registrations / passes
  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('navras_token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/registrations/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(r => ({
          id: r._id,
          eventId: r.eventId?._id || r.eventId,
          eventTitle: r.eventTitle,
          dateFormatted: r.eventDate,
          time: r.eventId?.time || '',
          venue: r.eventVenue,
          type: r.type,
          seats: r.seats,
          price: r.price,
          ticketCode: r.ticketCode,
          status: r.status === 'confirmed' ? 'Confirmed' : r.status === 'pending_review' ? 'Pending Review' : r.status,
          formData: {
            name: r.userName,
            email: r.userEmail,
            phone: r.userPhone,
            instrumentOrGenre: r.performerDetails?.instrument || r.performerDetails?.genre || '',
            performerBio: r.performerDetails?.bio || ''
          }
        }));
        setUserBookings(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
    }
  };

  // Fetch events on mount and whenever user logs in or out
  useEffect(() => {
    fetchEvents();
  }, [currentUser]);

  // Fetch bookings when user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserBookings();
    } else {
      setUserBookings([]);
    }
  }, [currentUser]);

  // Handle Event Booking / Registration Submission
  const handleRegisterSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('navras_token');
      const performerDetails = registrationType === 'performer' ? {
        instrument: formData.instrumentOrGenre || '',
        genre: formData.instrumentOrGenre || '',
        bio: formData.performerBio || '',
        experienceLink: formData.experienceLink || ''
      } : undefined;

      const body = {
        eventId: selectedEventId,
        type: registrationType,
        seats: registrationType === 'audience' ? parseInt(formData.seats || 1) : 1,
        performerDetails
      };

      const res = await fetch('http://localhost:5000/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Registration failed');
        return;
      }

      await fetchEvents();
      await fetchUserBookings();

      const targetEvent = events.find(e => e.id === selectedEventId || e._id === selectedEventId);
      const ticket = {
        id: data._id,
        eventId: selectedEventId,
        eventTitle: targetEvent?.title || data.eventTitle,
        dateFormatted: targetEvent?.dateFormatted || data.eventDate,
        time: targetEvent?.time || '',
        venue: targetEvent ? `${targetEvent.venue}, ${targetEvent.city}` : data.eventVenue,
        type: registrationType,
        seats: body.seats,
        price: data.price,
        ticketCode: data.ticketCode,
        status: data.status === 'confirmed' ? 'Confirmed' : 'Pending Review',
        formData: formData
      };

      setNewTicket(ticket);
      setView('confirm');
    } catch (err) {
      console.error('Registration error:', err);
      alert('Network error. Failed to complete registration.');
    }
  };

  // Handle New Event Creation from Dashboard
  const handleCreateEvent = async (newEventData) => {
    try {
      const token = localStorage.getItem('navras_token');
      const body = {
        title: newEventData.title,
        type: newEventData.type,
        tagline: newEventData.tagline,
        description: newEventData.description,
        date: newEventData.date,
        dateFormatted: new Date(newEventData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: newEventData.time,
        city: newEventData.city,
        venue: newEventData.venue,
        price: parseInt(newEventData.price || 0),
        seatsTotal: parseInt(newEventData.seatsTotal || 20),
        image: newEventData.type === 'poetry' ? initialEvents[1].image 
               : newEventData.type === 'singing' ? initialEvents[2].image 
               : newEventData.type === 'openmic' ? initialEvents[3].image 
               : initialEvents[0].image,
        lineup: newEventData.lineup ? newEventData.lineup.split(',').map(item => item.trim()) : [],
        gallery: [initialEvents[0].image, initialEvents[1].image]
      };

      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to create event');
        return;
      }

      await fetchEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Network error. Failed to create event.');
    }
  };

  // Approve performer application via API
  const handleApprovePerformer = async (registrationId) => {
    try {
      const token = localStorage.getItem('navras_token');
      const res = await fetch(`http://localhost:5000/api/registrations/${registrationId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchEvents();
      } else {
        const data = await res.json();
        alert(data.message || 'Approval failed');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Failed to approve registration.');
    }
  };

  const handleSaveToggle = (eventId) => {
    if (savedEventIds.includes(eventId)) {
      setSavedEventIds(savedEventIds.filter(id => id !== eventId));
    } else {
      setSavedEventIds([...savedEventIds, eventId]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('navras_user');
    localStorage.removeItem('navras_token');
    setView('landing');
  };

  // Called after successful API login/register
  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    if (token) {
      localStorage.setItem('navras_user', JSON.stringify(user));
      localStorage.setItem('navras_token', token);
    }
    setView('explore');
  };

  // Navigations routing helper
  const renderView = () => {
    switch (view) {
      case 'landing':
        return <LandingView setView={setView} events={events} setSelectedEvent={setSelectedEventId} />;
      case 'explore':
        return (
          <ExploreView 
            events={events} 
            setView={setView} 
            setSelectedEvent={setSelectedEventId}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
            savedEventIds={savedEventIds}
            onSaveToggle={handleSaveToggle}
          />
        );
      case 'detail':
        return (
          <DetailView 
            event={events.find(e => e.id === selectedEventId)} 
            setView={setView} 
            setRegistrationType={setRegistrationType}
            savedEventIds={savedEventIds}
            onSaveToggle={handleSaveToggle}
            currentUser={currentUser}
          />
        );
      case 'register':
        return (
          <RegisterView 
            event={events.find(e => e.id === selectedEventId)} 
            registrationType={registrationType} 
            onSubmit={handleRegisterSubmit} 
            setView={setView}
            currentUser={currentUser}
          />
        );
      case 'confirm':
        return <ConfirmationView ticket={newTicket} setView={setView} />;
      case 'dashboard':
        if (!currentUser || currentUser.role !== 'admin') {
          return (
            <div className="max-w-lg mx-auto py-20 text-center font-sans space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <h2 className="font-serif text-2xl font-bold text-maroon">Access Denied</h2>
              <p className="text-sm text-charcoal/70">You must be logged in as an admin to host events.</p>
              <button onClick={() => setView('explore')} className="px-6 py-2 rounded-full bg-maroon text-cream text-sm font-bold cursor-pointer">Explore Mehfils</button>
            </div>
          );
        }
        return (
          <DashboardView 
            events={events} 
            currentUser={currentUser} 
            onCreateEvent={handleCreateEvent}
            setView={setView}
            setSelectedEvent={setSelectedEventId}
            setEvents={setEvents}
            onApprovePerformer={handleApprovePerformer}
          />
        );
      case 'profile':
        return (
          <ProfileView 
            currentUser={currentUser} 
            userBookings={userBookings} 
            savedEvents={events.filter(e => savedEventIds.includes(e.id))}
            setView={setView}
            setSelectedEvent={setSelectedEventId}
            onEditBio={(newBio) => setCurrentUser({ ...currentUser, bio: newBio })}
          />
        );
      case 'login':
        return <LoginView setView={setView} onAuthSuccess={handleAuthSuccess} />;
      case 'admin':
        return <AdminDashboard currentUser={currentUser} setView={setView} />;
      case 'about':
        return <AboutView />;
      default:
        return <LandingView setView={setView} events={events} setSelectedEvent={setSelectedEventId} />;
    }
  };

  return (
    <div className="bg-paper min-h-screen flex flex-col antialiased">
      <Navbar 
        currentView={view} 
        setView={setView} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      {/* Elegant cultural footer */}
      <footer className="bg-maroon text-cream border-t border-gold/40 py-12 px-4 sm:px-6 lg:px-8 mt-16 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-gold/25 pb-8 mb-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <img
              src={navrasLogo}
              alt="Navras Logo"
              className="h-20 w-auto object-contain brightness-110 cursor-pointer"
              onClick={() => setView('landing')}
            />
            <p className="text-xs text-cream/70 italic text-center md:text-left">
              “Gulaabi shaam, garm chai aur ghazal ke sur...”
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center gap-2 text-sm text-cream/80">
            <h4 className="font-serif font-bold text-gold uppercase tracking-wider text-xs mb-1">Quick Links</h4>
            <button onClick={() => setView('landing')} className="hover:text-gold transition-colors cursor-pointer">Home</button>
            <button onClick={() => setView('explore')} className="hover:text-gold transition-colors cursor-pointer">Explore Mehfils</button>
            <button onClick={() => setView('about')} className="hover:text-gold transition-colors cursor-pointer">About Us &amp; Team</button>
            <button onClick={() => setView('about')} className="hover:text-gold transition-colors cursor-pointer font-semibold text-saffron-light">Contact Us</button>
          </div>

          {/* Social & WhatsApp */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h4 className="font-serif font-bold text-gold uppercase tracking-wider text-xs">Join Our Community</h4>
            
            {/* Direct WhatsApp Quick Contact */}
            <a 
              href="https://wa.me/919999999999?text=Hello%20Navras%20Team!"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-800/20 hover:bg-emerald-800/40 text-emerald-400 border border-emerald-800/50 rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition-colors cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            {/* Social Icons */}
            <div className="flex gap-3 mt-1">
              <a 
                href="https://instagram.com/navras" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Instagram"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a 
                href="https://wa.me/919999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <WhatsAppIcon className="w-6 h-6" />
              </a>
              <a 
                href="https://youtube.com/navras" 
                target="_blank" 
                rel="noopener noreferrer"
                title="YouTube"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <YouTubeIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right font-sans text-xs text-cream/60">
          <p>© {new Date().getFullYear()} Navras Cultural Platform. All rights reserved.</p>
          <p>Designed for soulful gatherings and acoustic artists. Crafted with love.</p>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================================
   1. LANDING VIEW
   ============================================================================ */
function LandingView({ setView, events, setSelectedEvent }) {
  const featured = events.slice(0, 3);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-maroon to-maroon-dark text-cream p-8 sm:p-12 lg:p-20 shadow-2xl border border-gold/30">
        {/* Subtle floral background patterns */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-96 h-96">
          <svg className="w-full h-full fill-current text-gold" viewBox="0 0 100 100">
            <path d="M50 0 C60 30, 90 40, 100 50 C90 60, 60 70, 50 100 C40 70, 10 60, 0 50 C10 40, 40 30, 50 0 Z" />
          </svg>
        </div>
        <div className="absolute left-10 top-10 opacity-10 pointer-events-none w-48 h-48">
          <svg className="w-full h-full fill-current text-gold" viewBox="0 0 100 100">
            <path d="M50 0 C60 30, 90 40, 100 50 C90 60, 60 70, 50 100 C40 70, 10 60, 0 50 C10 40, 40 30, 50 0 Z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 text-left">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest font-sans">
              <Sparkles className="w-3.5 h-3.5" /> Intimate. Soulful. Acoustic.
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-wide text-cream">
              Where Souls Gather Over <span className="text-saffron-light underline decoration-gold/50 underline-offset-8">Poetry</span>, Music, & Chai
            </h1>
            
            <p className="text-base sm:text-lg text-cream/80 font-sans max-w-xl leading-relaxed">
              Navras is a community for candlelit mehfils, unplugged Sufi gatherings, poetry circles, and storytelling open mics. Join cozy gatherings with select listeners.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setView('explore')}
                className="px-8 py-3.5 rounded-full bg-saffron text-cream font-sans font-bold text-base hover:bg-saffron-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              >
                Find Your Mehfil
              </button>
              <button 
                onClick={() => setView('dashboard')}
                className="px-8 py-3.5 rounded-full border border-gold text-gold font-sans font-bold text-base hover:bg-gold/10 transition-all duration-300 cursor-pointer"
              >
                Host an Evening
              </button>
            </div>
          </div>

          {/* Rotating Showcase Slider */}
          <div className="lg:col-span-5 relative">
            <div className="bg-card-white/10 backdrop-blur-md rounded-2xl p-4 border border-gold/20 shadow-xl">
              <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
                <img 
                  src={featured[activeSlide].image} 
                  alt={featured[activeSlide].title} 
                  className="w-full h-full object-cover animate-fade-in"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-5 left-5 right-5 text-left text-cream">
                  <span className="text-[10px] uppercase font-bold text-saffron-light tracking-widest font-sans">Featured Gathering</span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold mt-1 mb-2 line-clamp-1">{featured[activeSlide].title}</h3>
                  <p className="text-xs text-cream/70 line-clamp-2 font-sans mb-3">{featured[activeSlide].tagline}</p>
                  <button 
                    onClick={() => { setSelectedEvent(featured[activeSlide].id); setView('detail'); }}
                    className="text-xs font-bold text-gold hover:text-cream flex items-center gap-1 cursor-pointer font-sans"
                  >
                    Details & RSVP &rarr;
                  </button>
                </div>
              </div>
              
              {/* Slider Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {featured.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeSlide ? 'bg-saffron w-6' : 'bg-gold/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="text-center max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <div className="cultural-divider font-serif text-3xl font-semibold text-maroon">How Navras Works</div>
          <p className="text-charcoal/80 font-sans max-w-xl mx-auto">
            Experience art the traditional way — intimate, acoustic, and in close communion with artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card-white p-8 rounded-2xl shadow-md border border-gold/20 flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center border border-gold text-maroon">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-maroon">1. Explore</h3>
            <p className="text-xs text-charcoal/80 font-sans leading-relaxed text-center">
              Browse through curated, cozy cultural gatherings like shayari read-outs, baithaks, or acoustic singing sessions near you.
            </p>
          </div>

          <div className="bg-card-white p-8 rounded-2xl shadow-md border border-gold/20 flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center border border-gold text-saffron">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-maroon">2. RSVP Your Role</h3>
            <p className="text-xs text-charcoal/80 font-sans leading-relaxed text-center">
              Choose to register as an **Audience/Listener** or register as a **Performer/Participant** if you wish to share your art.
            </p>
          </div>

          <div className="bg-card-white p-8 rounded-2xl shadow-md border border-gold/20 flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center border border-gold text-emerald-800">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-maroon">3. Experience</h3>
            <p className="text-xs text-charcoal/80 font-sans leading-relaxed text-center">
              Gather in warm spaces (gardens, rooftop cafes, libraries) over traditional tea and share conversations that feed the soul.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Grid Section */}
      <div className="space-y-8 text-left">
        <div className="flex items-end justify-between border-b border-gold/20 pb-4">
          <div>
            <h2 className="font-serif text-3xl font-bold text-maroon">Intimate Gatherings Near You</h2>
            <p className="text-sm text-charcoal/80 font-sans mt-1">Carefully curated experiences, limited seat availability</p>
          </div>
          <button 
            onClick={() => setView('explore')}
            className="text-sm font-bold text-saffron hover:text-saffron-dark font-sans flex items-center gap-1 cursor-pointer"
          >
            See All Mehfils <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((evt) => (
            <EventCard 
              key={evt.id} 
              event={evt} 
              onViewDetails={(id) => { setSelectedEvent(id); setView('detail'); }} 
            />
          ))}
        </div>
      </div>

      {/* =====================================================================
          UPCOMING & CURRENT EVENTS POSTERS SHOWCASE
          ===================================================================== */}
      <div className="space-y-8 text-left">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gold/20 pb-5 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-cream text-[10px] font-bold uppercase tracking-widest font-sans shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" /> Live &amp; Upcoming
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-maroon">The Mehfil Marquee</h2>
            <p className="text-sm text-charcoal/70 font-sans mt-1.5">Each gathering, a world of its own. Reserve your seat before the diyas are lit.</p>
          </div>
          <button
            onClick={() => setView('explore')}
            className="shrink-0 text-sm font-bold text-saffron hover:text-saffron-dark font-sans flex items-center gap-1 cursor-pointer whitespace-nowrap transition-colors"
          >
            Browse All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Poster Grid — horizontal scroll on mobile, 2-col asymmetric on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gold/30 lg:grid lg:grid-cols-12 lg:overflow-visible lg:pb-0">

          {/* ── FEATURED LARGE POSTER (col-span-7) ── */}
          {events[0] && (
            <div
              className="relative shrink-0 w-[82vw] sm:w-[60vw] lg:w-auto lg:col-span-7 rounded-3xl overflow-hidden shadow-2xl snap-start cursor-pointer group border border-gold/20"
              style={{ minHeight: '480px' }}
              onClick={() => { setSelectedEvent(events[0].id); setView('detail'); }}
            >
              {/* Background image */}
              <img
                src={events[0].image}
                alt={events[0].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark via-maroon/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-maroon/40 via-transparent to-transparent" />

              {/* Decorative paisley watermark */}
              <div className="absolute top-6 right-6 opacity-10 text-gold pointer-events-none">
                <svg width="90" height="90" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 5 C65 15, 85 30, 80 55 C75 75, 55 88, 45 80 C30 70, 20 45, 30 28 C38 14, 48 8, 50 5 Z" />
                  <circle cx="60" cy="30" r="8" />
                </svg>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-10">
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-red-600 text-cream text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" /> Happening Soon
                  </span>
                  <span className="bg-saffron/80 text-cream text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full font-sans">
                    {events[0].type === 'mehfil' ? 'Mehfil' : events[0].type === 'poetry' ? 'Poetry' : events[0].type === 'singing' ? 'Singing' : 'Open Mic'}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-cream leading-tight mb-2 drop-shadow-lg">
                  {events[0].title}
                </h3>
                <p className="text-cream/80 text-sm font-sans leading-relaxed mb-5 line-clamp-2 max-w-md">
                  {events[0].tagline}
                </p>

                {/* Meta strip */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-cream/80 text-xs font-sans mb-6">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    {events[0].dateFormatted}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" />
                    {events[0].city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gold" />
                    {events[0].seatsRemaining} seats left
                  </span>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(events[0].id); setView('detail'); }}
                    className="px-6 py-3 rounded-full bg-saffron text-cream font-bold text-xs uppercase tracking-wider font-sans hover:bg-saffron-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Reserve a Seat
                  </button>
                  <span className="text-cream/60 font-serif italic text-sm">
                    {events[0].price === 0 ? 'Free Entry' : `₹${events[0].price} / seat`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── RIGHT COLUMN STACK (col-span-5) ── */}
          <div className="lg:col-span-5 flex flex-row lg:flex-col gap-5 shrink-0 w-auto">
            {events.slice(1, 4).map((evt, idx) => (
              <div
                key={evt.id}
                onClick={() => { setSelectedEvent(evt.id); setView('detail'); }}
                className="relative shrink-0 w-[72vw] sm:w-[44vw] lg:w-auto flex-1 rounded-2xl overflow-hidden shadow-lg snap-start cursor-pointer group border border-gold/15"
                style={{ minHeight: idx === 0 ? '220px' : '180px' }}
              >
                {/* BG image */}
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-maroon/30 to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[8px] uppercase font-bold tracking-wider px-2 py-1 rounded-full font-sans ${
                    evt.seatsRemaining <= 8 ? 'bg-red-600 text-cream' : 'bg-gold/80 text-maroon'
                  }`}>
                    {evt.seatsRemaining <= 8 ? `Only ${evt.seatsRemaining} left` : evt.city}
                  </span>
                </div>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[8px] uppercase font-bold text-gold/90 tracking-widest font-sans">
                      {evt.type === 'mehfil' ? 'Mehfil' : evt.type === 'poetry' ? 'Poetry' : evt.type === 'singing' ? 'Singing' : 'Open Mic'}
                    </span>
                    <span className="text-gold/40">·</span>
                    <span className="text-[8px] text-cream/70 font-sans">{evt.dateFormatted}</span>
                  </div>
                  <h4 className="font-serif font-bold text-cream text-sm sm:text-base leading-snug line-clamp-2 drop-shadow">
                    {evt.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-cream/70 font-sans flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gold" />{evt.city}
                    </span>
                    <span className="text-[10px] font-bold text-saffron-light font-sans">
                      {evt.price === 0 ? 'Free' : `₹${evt.price}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable thumbnail strip — all events at a glance */}
        <div className="space-y-3">
          <p className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">All Scheduled Gatherings</p>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {events.map((evt) => (
              <button
                key={evt.id}
                onClick={() => { setSelectedEvent(evt.id); setView('detail'); }}
                className="group relative shrink-0 w-32 h-20 rounded-xl overflow-hidden border border-gold/20 snap-start cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/80 to-transparent flex flex-col justify-end p-2">
                  <p className="text-[9px] font-bold text-cream leading-tight line-clamp-2 font-sans">{evt.title}</p>
                </div>
              </button>
            ))}
            {/* "More" chip */}
            <button
              onClick={() => setView('explore')}
              className="shrink-0 w-24 h-20 rounded-xl border-2 border-dashed border-gold/30 flex flex-col items-center justify-center text-gold hover:bg-gold/10 transition-colors cursor-pointer gap-1.5"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider font-sans">See All</span>
            </button>
          </div>
        </div>
      </div>


      {/* =====================================================================
          GALLERY SECTION
          ===================================================================== */}
      <div className="space-y-8">
        <div className="flex items-end justify-between border-b border-gold/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="w-4 h-4 text-gold" />
              <span className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">Captured Moments</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-maroon">Mehfil Gallery</h2>
            <p className="text-sm text-charcoal/70 font-sans mt-1">Glimpses from our intimate gatherings — every frame tells a story.</p>
          </div>
        </div>

        {/* Masonry-style gallery grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {navrasPhotos.map((photo, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl overflow-hidden shadow-md border border-gold/20 group cursor-pointer ${
                idx === 0 ? 'col-span-2 row-span-2 sm:col-span-2' : ''
              }`}
              style={{ minHeight: idx === 0 ? '280px' : '160px' }}
            >
              <img
                src={photo}
                alt={`Navras moment ${idx + 1}`}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-maroon/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-cream">
                  <Camera className="w-6 h-6 mx-auto mb-1 opacity-80" />
                  <span className="text-[10px] uppercase tracking-widest font-sans font-bold">View</span>
                </div>
              </div>
              {/* Decorative corner accent */}
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-gold/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-tr" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-gold/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl" />
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          KAVI / POETRY SECTION
          ===================================================================== */}
      <div className="space-y-8">
        <div className="flex items-end justify-between border-b border-gold/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-gold" />
              <span className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">Kavi Kona</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-maroon">Words That Linger</h2>
            <p className="text-sm text-charcoal/70 font-sans mt-1">Shayaris, ghazals, nazms — poetry shared at Navras mehfils.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              urdu: 'کچھ اس طرح پڑھی میں نے غزل تیری آنکھوں میں',
              hindi: 'Kuch is tarah padhi maine ghazal teri aankhon mein',
              translation: 'I read the ghazal in your eyes — the way silence speaks louder than words.',
              poet: 'Mirza Ghalib',
              occasion: 'Mehfil-e-Ghazal, Delhi',
              type: 'Ghazal'
            },
            {
              urdu: 'آج بازار میں پا بہ جولاں چلو',
              hindi: 'Aaj bazaar mein pa-ba-jaulaan chalo',
              translation: 'Walk today in the marketplace with shackled feet — meet the beloved with all your sorrow.',
              poet: 'Faiz Ahmad Faiz',
              occasion: 'Sufi Baithak, Bangalore',
              type: 'Nazm'
            },
            {
              urdu: 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے',
              hindi: 'Hazaaron khwahishein aisi ke har khwahish pe dam nikle',
              translation: 'A thousand desires, each one intense enough to take your breath away.',
              poet: 'Mirza Ghalib',
              occasion: 'Kavi Sammelan, Mumbai',
              type: 'Sher'
            },
            {
              urdu: 'بلھے شاہ اساں مرنا ناہیں گور پیا کوئی ہور',
              hindi: 'Bulleh Shah asaan marna nahin, gor piya koi hor',
              translation: "Bulleh Shah, we shall not die — someone else lies in that grave. The soul is eternal.",
              poet: 'Bulleh Shah',
              occasion: 'Sufi Night, Bangalore',
              type: 'Kafi'
            },
            {
              urdu: 'رنجش ہی سہی دل ہی دکھانے کے لئے آ',
              hindi: 'Ranjish hi sahi, dil hi dukhane ke liye aa',
              translation: 'Even if it means more heartache, come — if only to break my heart once more.',
              poet: 'Ahmad Faraz',
              occasion: 'Urdu Open Mic, Jaipur',
              type: 'Ghazal'
            },
            {
              urdu: 'ہم نے مانا کہ تغافل نہ کرو گے لیکن',
              hindi: 'Hum ne maana ke taghaful na karoge lekin',
              translation: 'We accept you will not ignore us — but how long shall we live on just this hope alone?',
              poet: 'Mir Taqi Mir',
              occasion: 'Kavi Sammelan, Delhi',
              type: 'Ghazal'
            }
          ].map((poem, idx) => (
            <div
              key={idx}
              className="relative bg-card-white rounded-2xl border border-gold/20 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              {/* Decorative quote mark watermark */}
              <div className="absolute -top-2 -right-2 text-gold/8 font-serif text-[100px] leading-none select-none pointer-events-none">"
              </div>

              {/* Type badge */}
              <span className="inline-block mb-3 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-saffron/10 text-saffron border border-saffron/20 font-sans">
                {poem.type}
              </span>

              {/* Urdu text */}
              <p className="font-serif text-xl text-maroon leading-relaxed mb-1 text-right" dir="rtl">
                {poem.urdu}
              </p>

              {/* Transliteration */}
              <p className="text-sm text-charcoal/70 italic font-sans mb-3">
                {poem.hindi}
              </p>

              {/* Divider */}
              <div className="w-8 h-px bg-gold/40 mb-3" />

              {/* Translation */}
              <p className="text-xs text-charcoal/80 font-sans leading-relaxed mb-4">
                {poem.translation}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                <div>
                  <p className="text-xs font-bold text-maroon font-sans">{poem.poet}</p>
                  <p className="text-[10px] text-charcoal/50 font-sans mt-0.5">{poem.occasion}</p>
                </div>
                <Diya className="w-5 h-5 text-saffron opacity-60" />
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          PERFORMANCES SECTION (Instagram 9:16 video ratio)
          ===================================================================== */}
      <div className="space-y-8">
        <div className="flex items-end justify-between border-b border-gold/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-4 h-4 text-gold" />
              <span className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">Live at Navras</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-maroon">Performances</h2>
            <p className="text-sm text-charcoal/70 font-sans mt-1">Hear the music, feel the words — moments from our stages.</p>
          </div>
        </div>

        {/* Horizontal scroll of Instagram-ratio (9:16) video cards */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gold/30">
          {[
            {
              thumbnail: navrasPhotos[0],
              title: 'Ghazal under the Stars',
              artist: 'Ustad Shujaat Ali',
              duration: '4:32',
              type: 'Ghazal',
              location: 'Delhi'
            },
            {
              thumbnail: navrasPhotos[1],
              title: 'Sufi Kafi Rendition',
              artist: 'Kabir & The Mystic Circle',
              duration: '6:14',
              type: 'Sufi',
              location: 'Bangalore'
            },
            {
              thumbnail: navrasPhotos[2],
              title: 'Kavi Sammelan Highlight',
              artist: 'Vasundhara Sharma',
              duration: '3:48',
              type: 'Poetry',
              location: 'Mumbai'
            },
            {
              thumbnail: navrasPhotos[3],
              title: 'Bansuri Raag Yaman',
              artist: 'Priyanka Prasad',
              duration: '7:05',
              type: 'Classical',
              location: 'Jaipur'
            },
            {
              thumbnail: navrasPhotos[4],
              title: 'Open Mic — Original Nazm',
              artist: 'Farhan Akhter',
              duration: '2:55',
              type: 'Nazm',
              location: 'Jaipur'
            }
          ].map((video, idx) => (
            <div
              key={idx}
              className="group relative shrink-0 snap-start cursor-pointer rounded-2xl overflow-hidden border border-gold/20 shadow-lg hover:shadow-2xl transition-all duration-300"
              style={{ width: '200px', height: '356px' }} /* 9:16 Instagram ratio */
            >
              {/* Thumbnail */}
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Full gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark via-maroon/40 to-transparent" />

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-saffron/80 text-cream font-sans">
                  {video.type}
                </span>
                <span className="text-[9px] font-mono text-cream/80 bg-black/40 px-1.5 py-0.5 rounded">
                  {video.duration}
                </span>
              </div>

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-cream/20 backdrop-blur-sm border border-cream/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-saffron/80 transition-all duration-300 shadow-lg">
                  <Play className="w-5 h-5 text-cream fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[10px] text-gold uppercase tracking-widest font-sans font-bold mb-1">
                  {video.location}
                </p>
                <h4 className="font-serif text-sm font-bold text-cream leading-snug mb-1 line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-[10px] text-cream/70 font-sans">{video.artist}</p>

                {/* Watch button — appears on hover */}
                <button className="mt-2 w-full py-1.5 rounded-full bg-saffron text-cream text-[10px] font-bold uppercase tracking-wider font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  Watch Performance
                </button>
              </div>

              {/* Corner decorative element */}
              <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold/40 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-gold/40 rounded-bl-lg" />
            </div>
          ))}

          {/* Add more card */}
          <div
            className="shrink-0 snap-start rounded-2xl border-2 border-dashed border-gold/30 flex flex-col items-center justify-center gap-3 text-gold hover:bg-gold/5 transition-colors cursor-pointer"
            style={{ width: '200px', height: '356px' }}
          >
            <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest font-sans">More Coming</p>
              <p className="text-[10px] text-gold/60 font-sans mt-1">Follow us for live clips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-cream rounded-3xl p-8 sm:p-12 border border-gold/20 shadow-inner max-w-5xl mx-auto relative overflow-hidden">
        <div className="absolute right-0 top-0 text-gold/5 font-serif text-[120px] leading-none select-none pointer-events-none font-bold">
          “ ”
        </div>
        <div className="relative z-10 text-center space-y-8">
          <Diya className="w-12 h-12 mx-auto" />
          <p className="font-serif text-xl sm:text-2xl text-maroon italic leading-relaxed max-w-3xl mx-auto">
            "Navras felt like stepping into an old-world literary salon. The candlelight, the carpets, the aroma of kulhad chai, and the sheer closeness to the artists made the Urdu shayari session feel deeply personal."
          </p>
          <div className="flex flex-col items-center">
            <span className="font-bold text-charcoal font-sans text-sm">Zoya Siddiqui</span>
            <span className="text-xs text-gold font-sans uppercase tracking-widest mt-1">Poet & Attendee, Delhi Mehfil</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   2. EXPLORE VIEW
   ============================================================================ */
function ExploreView({ 
  events, setView, setSelectedEvent, 
  searchTerm, setSearchTerm, 
  activeCategory, setActiveCategory, 
  selectedCity, setSelectedCity, 
  selectedPrice, setSelectedPrice,
  savedEventIds, onSaveToggle
}) {
  
  // Category tags helper
  const categories = [
    { id: 'all', label: 'All Gatherings' },
    { id: 'poetry', label: 'Poetry & Nazm' },
    { id: 'singing', label: 'Live Singing' },
    { id: 'mehfil', label: 'Mehfils' },
    { id: 'openmic', label: 'Open Mics' }
  ];

  // Filtering Logic
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.hostName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || evt.type === activeCategory;
    const matchesCity = selectedCity === 'all' || evt.city === selectedCity;
    
    let matchesPrice = true;
    if (selectedPrice === 'free') {
      matchesPrice = evt.price === 0;
    } else if (selectedPrice === 'paid') {
      matchesPrice = evt.price > 0;
    }

    return matchesSearch && matchesCategory && matchesCity && matchesPrice;
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="border-b border-gold/20 pb-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-maroon">Browse Soulful Circles</h1>
        <p className="text-sm text-charcoal/80 font-sans mt-1">Find poetry, acoustic music, and storytelling in cozy spaces.</p>
      </div>

      {/* Advanced Filters */}
      <div className="bg-card-white rounded-2xl border border-gold/20 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gold" />
            <input 
              type="text" 
              placeholder="Search by keyword, host, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans text-charcoal focus:border-maroon focus:outline-none transition-colors"
            />
          </div>

          {/* City Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm font-sans text-charcoal focus:border-maroon focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Cities (India)</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Jaipur">Jaipur</option>
            </select>
          </div>

          {/* Price Selector */}
          <div className="md:col-span-4">
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm font-sans text-charcoal focus:border-maroon focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Prices</option>
              <option value="free">Free Gatherings</option>
              <option value="paid">Contribution Required (Paid)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider font-sans transition-all cursor-pointer border ${
                activeCategory === cat.id 
                  ? 'bg-maroon text-cream border-maroon shadow-md' 
                  : 'bg-cream text-charcoal/80 border-gold/20 hover:border-gold hover:text-maroon'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative">
              <EventCard 
                event={evt} 
                onViewDetails={(id) => { setSelectedEvent(id); setView('detail'); }} 
              />
              {/* Add Wishlist Heart */}
              <button 
                onClick={() => onSaveToggle(evt.id)}
                className="absolute top-4 right-4 z-20 bg-cream/90 backdrop-blur-sm hover:bg-cream text-maroon hover:text-red-600 p-2 rounded-full shadow-md border border-gold/20 transition-all cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${savedEventIds.includes(evt.id) ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card-white border border-gold/20 rounded-2xl shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-gold mx-auto" />
          <h3 className="font-serif text-xl font-bold text-maroon">No Mehfils Found</h3>
          <p className="text-sm text-charcoal/80 font-sans max-w-sm mx-auto">
            Try adjusting your search keywords, city selection, or toggling categories.
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setActiveCategory('all'); setSelectedCity('all'); setSelectedPrice('all'); }}
            className="px-5 py-2.5 rounded-full bg-saffron text-cream font-sans font-bold text-xs uppercase tracking-wider hover:bg-saffron-dark transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   3. DETAIL VIEW
   ============================================================================ */
function DetailView({ event, setView, setRegistrationType, savedEventIds, onSaveToggle, currentUser }) {
  if (!event) return <div>Event not found</div>;

  const isSaved = savedEventIds.includes(event.id);
  const isSoldOut = event.seatsRemaining === 0;

  const handleRegisterClick = (type) => {
    setRegistrationType(type);
    if (!currentUser) {
      setView('login');
    } else {
      setView('register');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Back Button */}
      <button 
        onClick={() => setView('explore')}
        className="inline-flex items-center text-sm font-bold text-maroon hover:text-saffron transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
      </button>

      {/* Hero Banner Grid */}
      <div className="bg-card-white rounded-3xl border border-gold/20 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 h-80 lg:h-[450px] relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-cream">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-gold/30 bg-maroon text-cream font-sans">
              {event.type.toUpperCase()}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-3 leading-snug">{event.title}</h1>
          </div>
        </div>

        {/* Quick Details Sidebar */}
        <div className="lg:col-span-4 p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gold/20 bg-cream/40">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-bold">Details</span>
              <button 
                onClick={() => onSaveToggle(event.id)}
                className="text-maroon hover:text-red-600 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gold mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-charcoal font-sans">{event.dateFormatted}</p>
                  <p className="text-xs text-charcoal/70 font-sans">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gold mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-charcoal font-sans">{event.venue}</p>
                  <p className="text-xs text-charcoal/70 font-sans">{event.city}, India</p>
                </div>
              </div>

              <div className="flex items-start">
                <IndianRupee className="w-5 h-5 text-gold mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-charcoal font-sans">
                    {event.price === 0 ? 'Free Entry' : `₹${event.price} contribution`}
                  </p>
                  <p className="text-xs text-charcoal/70 font-sans">Per seat registration cost</p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="w-5 h-5 text-gold mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-charcoal font-sans">
                    {event.seatsRemaining} of {event.seatsTotal} seats open
                  </p>
                  <p className="text-xs text-charcoal/70 font-sans">Intimate seating limits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Dual Buttons Container */}
          <div className="pt-6 border-t border-gold/10 space-y-3">
            {isSoldOut ? (
              <div className="w-full text-center py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl font-bold font-sans">
                Event Sold Out
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleRegisterClick('audience')}
                  className="w-full py-3.5 rounded-xl bg-saffron text-cream font-bold font-sans hover:bg-saffron-dark transition-all shadow-md cursor-pointer text-center text-sm"
                >
                  Register as Audience
                </button>
                <button
                  onClick={() => handleRegisterClick('performer')}
                  className="w-full py-3.5 rounded-xl border border-maroon text-maroon font-bold font-sans hover:bg-maroon hover:text-cream transition-all cursor-pointer text-center text-sm"
                >
                  Apply as Performer
                </button>
              </>
            )}
            <p className="text-[10px] text-center text-charcoal/60 font-sans">
              Performers share poetry/melodies; audience logs as observers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Full story & performers */}
        <div className="lg:col-span-8 space-y-8 bg-card-white border border-gold/20 p-8 rounded-3xl shadow-sm">
          {/* Detailed description */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-maroon border-b border-gold/10 pb-2">About The Mehfil</h2>
            <p className="text-sm text-charcoal leading-relaxed font-sans whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Lineup / Performers */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-maroon border-b border-gold/10 pb-2">Lineup & Hosts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.lineup.map((person, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-cream/40 rounded-xl border border-gold/15">
                  <div className="w-10 h-10 rounded-full bg-maroon/10 border border-gold/25 flex items-center justify-center text-maroon">
                    {person.includes('Singer') || person.includes('Vocals') ? <Music className="w-4 h-4" /> : 
                     person.includes('Poet') || person.includes('Shayari') || person.includes('Host') ? <BookOpen className="w-4 h-4" /> : 
                     <Mic className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs text-gold uppercase tracking-wider font-semibold font-sans">Artist</p>
                    <p className="text-sm font-bold text-maroon font-sans">{person}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-maroon border-b border-gold/10 pb-2">Atmosphere Gallery</h2>
            <div className="grid grid-cols-3 gap-3">
              {event.gallery.map((img, idx) => (
                <div key={idx} className="h-24 sm:h-36 rounded-xl overflow-hidden border border-gold/20">
                  <img src={img} alt={`atmosphere-${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Host Bio & Venue Map */}
        <div className="lg:col-span-4 space-y-6">
          {/* Host Bio */}
          <div className="bg-card-white border border-gold/20 p-6 rounded-3xl shadow-sm text-center space-y-4">
            <img 
              src={event.hostAvatar} 
              alt={event.hostName}
              className="w-20 h-20 rounded-full object-cover border-2 border-gold mx-auto shadow"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans block mb-0.5">Your Host</span>
              <h3 className="font-serif text-lg font-bold text-maroon">{event.hostName}</h3>
            </div>
            <p className="text-xs text-charcoal/80 font-sans leading-relaxed">
              "{event.hostBio}"
            </p>
          </div>

          {/* Venue & Map mockup */}
          <div className="bg-card-white border border-gold/20 p-6 rounded-3xl shadow-sm space-y-4">
            <h4 className="font-serif text-lg font-bold text-maroon border-b border-gold/10 pb-2">Venue Location</h4>
            <div className="h-48 rounded-2xl overflow-hidden relative border border-gold/10">
              {/* Fake Map graphics using SVG */}
              <div className="absolute inset-0 bg-[#e5e3df] flex flex-col justify-center items-center p-4">
                {/* Map Grid Gridlines */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border border-stone-400" />
                  ))}
                </div>
                {/* Green Park Circle */}
                <div className="absolute top-8 left-16 w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 opacity-60 flex items-center justify-center text-[8px] font-bold text-emerald-800">Nizamuddin Park</div>
                {/* Map Pins */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center border-2 border-cream shadow-md text-cream animate-pulse">
                    <MapPin className="w-4 h-4 fill-cream" />
                  </div>
                  <span className="bg-maroon text-cream text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">{event.venue.split(',')[0]}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-charcoal/80 font-sans">
              <span className="font-bold">Address:</span> {event.venue}, {event.city}. Exact room/access instructions will be shared via ticket pass.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   4. REGISTRATION FLOW
   ============================================================================ */
function RegisterView({ event, registrationType, onSubmit, setView, currentUser }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    phone: '',
    seats: 1,
    instrumentOrGenre: '',
    performerBio: '',
    experienceLink: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setView('detail');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in text-left">
      <div className="border-b border-gold/20 pb-4">
        <h1 className="font-serif text-3xl font-bold text-maroon">
          Register: {registrationType === 'audience' ? 'Audience RSVP' : 'Performer application'}
        </h1>
        <p className="text-sm text-charcoal/80 font-sans mt-1">Mehfil: {event.title}</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-sans ${step >= 1 ? 'bg-maroon text-cream' : 'bg-gold/20 text-gold'}`}>1</div>
          <span className="text-[10px] uppercase font-bold text-gold tracking-wider mt-1.5">Your Details</span>
        </div>
        <div className={`h-1 flex-grow mx-4 rounded-full ${step >= 2 ? 'bg-maroon' : 'bg-gold/20'}`} />
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-sans ${step >= 2 ? 'bg-maroon text-cream' : 'bg-gold/20 text-gold'}`}>2</div>
          <span className="text-[10px] uppercase font-bold text-gold tracking-wider mt-1.5">
            {registrationType === 'audience' ? 'Pass Options' : 'Art details'}
          </span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card-white border border-gold/20 rounded-3xl p-6 sm:p-8 shadow-md">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-maroon border-b border-gold/10 pb-2">Contact Details</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none transition-colors"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none transition-colors"
                placeholder="e.g. +91 98765 43210"
              />
            </div>
          </div>
        )}

        {step === 2 && registrationType === 'audience' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-maroon border-b border-gold/10 pb-2">Seats & Tickets</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Number of Seats</label>
              <select
                name="seats"
                value={formData.seats}
                onChange={handleInputChange}
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none transition-colors cursor-pointer"
              >
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4 Seats (Max limit)</option>
              </select>
            </div>

            {event.price > 0 && (
              <div className="bg-cream/40 p-4 rounded-2xl border border-gold/15 space-y-2 mt-4">
                <div className="flex justify-between text-sm text-charcoal font-sans">
                  <span>Price per seat</span>
                  <span>₹{event.price}</span>
                </div>
                <div className="flex justify-between text-sm text-charcoal font-sans">
                  <span>Quantity</span>
                  <span>x {formData.seats}</span>
                </div>
                <hr className="border-gold/10" />
                <div className="flex justify-between text-base font-bold text-maroon font-serif">
                  <span>Total Contribution</span>
                  <span>₹{event.price * formData.seats}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && registrationType === 'performer' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-maroon border-b border-gold/10 pb-2">Performance Details</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Instrument or Poetry Genre</label>
              <input 
                type="text" 
                name="instrumentOrGenre"
                value={formData.instrumentOrGenre}
                onChange={handleInputChange}
                required
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none transition-colors"
                placeholder="e.g. Harmonium, Urdu Shayari, Sitar, Ghazal vocals"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Performance Intro & Track List (Optional)</label>
              <textarea 
                name="performerBio"
                value={formData.performerBio}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none transition-colors"
                placeholder="Briefly describe what you would like to perform at the mehfil..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal font-sans">Past Performance Link (Video / Audio / Drive)</label>
              <input 
                type="url" 
                name="experienceLink"
                value={formData.experienceLink}
                onChange={handleInputChange}
                className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none transition-colors"
                placeholder="https://youtube.com/... or Google Drive Link"
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gold/10">
          <button 
            onClick={handleBack}
            className="flex-1 py-2.5 rounded-xl border border-gold text-gold font-sans font-bold text-xs uppercase tracking-wider hover:bg-gold/10 transition-all cursor-pointer text-center"
          >
            Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!formData.name || !formData.email || !formData.phone || (step === 2 && registrationType === 'performer' && !formData.instrumentOrGenre)}
            className="flex-1 py-2.5 rounded-xl bg-maroon text-cream font-sans font-bold text-xs uppercase tracking-wider hover:bg-maroon-light transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-center"
          >
            {step === 1 ? 'Continue' : registrationType === 'audience' ? 'Confirm RSVP' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   5. CONFIRMATION VIEW
   ============================================================================ */
function ConfirmationView({ ticket, setView }) {
  if (!ticket) return <div>No ticket booking loaded</div>;

  const isPerformer = ticket.type === 'performer';

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in text-center">
      <div className="space-y-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm border ${isPerformer ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
          <CheckCircle className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-maroon">
          {isPerformer ? 'Artist Application Received!' : 'Registration Confirmed!'}
        </h1>
        <p className="text-sm text-charcoal/80 font-sans max-w-sm mx-auto">
          {isPerformer
            ? 'Your performer application is under review. The host will confirm your slot shortly.'
            : 'Your seat has been reserved. We look forward to hosting you at the mehfil!'}
        </p>
      </div>

      {/* ── AUDIENCE TICKET (maroon/gold) ── */}
      {!isPerformer && (
        <div className="bg-card-white rounded-3xl shadow-xl overflow-hidden max-w-sm mx-auto border border-gold/30">
          {/* Header band */}
          <div className="bg-maroon text-cream py-4 px-6 text-left">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold font-sans">🎟 Navras Audience Pass</span>
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-saffron text-cream">Confirmed</span>
            </div>
            <h3 className="font-serif text-lg font-bold leading-tight truncate">{ticket.eventTitle}</h3>
          </div>

          {/* Gold divider wave */}
          <div className="h-1 bg-gradient-to-r from-gold via-saffron to-gold" />

          <div className="p-6 space-y-5 text-left bg-gradient-to-b from-cream/40 to-white relative">
            {/* Pass Code + Status */}
            <div className="flex justify-between items-end border-b border-gold/15 pb-4">
              <div>
                <p className="text-[9px] uppercase font-bold text-gold tracking-widest font-sans">Pass Code</p>
                <p className="text-base font-bold text-maroon font-mono">{ticket.ticketCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-gold tracking-widest font-sans">Seats</p>
                <p className="text-base font-bold text-maroon font-sans">{ticket.seats}</p>
              </div>
            </div>

            {/* Event details */}
            <div className="space-y-2.5 text-xs text-charcoal/80 font-sans border-b border-gold/10 pb-4">
              <div className="flex items-start gap-2"><Calendar className="w-4 h-4 text-gold shrink-0 mt-0.5" /><span>{ticket.dateFormatted} • {ticket.time}</span></div>
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" /><span className="truncate">{ticket.venue}</span></div>
              <div className="flex items-start gap-2"><IndianRupee className="w-4 h-4 text-gold shrink-0 mt-0.5" /><span>₹{ticket.price} total contribution</span></div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center py-2 gap-3">
              <div className="w-28 h-28 bg-white border border-gold/30 p-2 rounded-xl relative overflow-hidden">
                <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full opacity-80">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${[0,1,2,5,10,12,14,19,22,23,24,7,17].includes(i) ? 'bg-maroon' : 'bg-transparent'}`} />
                  ))}
                </div>
                <div className="absolute top-1.5 left-1.5 w-7 h-7 border-2 border-maroon bg-white" />
                <div className="absolute top-1.5 right-1.5 w-7 h-7 border-2 border-maroon bg-white" />
                <div className="absolute bottom-1.5 left-1.5 w-7 h-7 border-2 border-maroon bg-white" />
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gold font-sans">Present at Venue Entry</span>
            </div>
          </div>

          {/* Tear line footer */}
          <div className="relative border-t-2 border-dashed border-gold/30 py-3 bg-cream/60 px-6 flex justify-between items-center">
            <div className="absolute -left-3 top-[-7px] w-6 h-3.5 rounded-full bg-paper border border-gold/30" />
            <div className="absolute -right-3 top-[-7px] w-6 h-3.5 rounded-full bg-paper border border-gold/30" />
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold text-gold tracking-widest font-sans">Guest Name</p>
              <p className="text-xs font-bold text-maroon font-sans">{ticket.formData?.name || 'Guest'}</p>
            </div>
            <button onClick={() => window.print()} className="p-1.5 rounded-md hover:bg-gold/15 text-maroon transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── PERFORMER TICKET (purple/indigo) ── */}
      {isPerformer && (
        <div className="bg-card-white rounded-3xl shadow-xl overflow-hidden max-w-sm mx-auto border border-purple-200">
          {/* Header band — purple gradient */}
          <div className="text-cream py-4 px-6 text-left" style={{ background: 'linear-gradient(135deg, #3B0764 0%, #5B21B6 60%, #7C3AED 100%)' }}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-200 font-sans">🎤 Navras Artist Pass</span>
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/80 text-cream">Pending Review</span>
            </div>
            <h3 className="font-serif text-lg font-bold leading-tight truncate">{ticket.eventTitle}</h3>
          </div>

          {/* Shimmer divider */}
          <div className="h-1 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400" />

          <div className="p-6 space-y-5 text-left" style={{ background: 'linear-gradient(180deg, #F5F0FF 0%, #ffffff 100%)' }}>
            {/* Pass Code + Type */}
            <div className="flex justify-between items-end border-b border-purple-100 pb-4">
              <div>
                <p className="text-[9px] uppercase font-bold text-purple-400 tracking-widest font-sans">Artist Pass Code</p>
                <p className="text-base font-bold text-purple-900 font-mono">{ticket.ticketCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-purple-400 tracking-widest font-sans">Role</p>
                <p className="text-sm font-bold text-purple-800 font-sans">Performer</p>
              </div>
            </div>

            {/* Event details + genre */}
            <div className="space-y-2.5 text-xs text-charcoal/80 font-sans border-b border-purple-100 pb-4">
              <div className="flex items-start gap-2"><Calendar className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" /><span>{ticket.dateFormatted} • {ticket.time}</span></div>
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" /><span className="truncate">{ticket.venue}</span></div>
              <div className="flex items-start gap-2"><Mic className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" /><span className="font-semibold text-purple-800">{ticket.formData?.instrumentOrGenre || 'Artistry'}</span></div>
            </div>

            {/* Artist bio preview */}
            {ticket.formData?.performerBio && (
              <div className="bg-purple-50 rounded-xl p-3 text-[11px] text-purple-800 font-sans italic border border-purple-100">
                "{ticket.formData.performerBio}"
              </div>
            )}

            {/* QR */}
            <div className="flex flex-col items-center py-2 gap-3">
              <div className="w-28 h-28 bg-white border border-purple-200 p-2 rounded-xl relative overflow-hidden">
                <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full opacity-80">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${[0,2,4,6,8,11,13,16,18,20,22,24,9,15].includes(i) ? 'bg-purple-800' : 'bg-transparent'}`} />
                  ))}
                </div>
                <div className="absolute top-1.5 left-1.5 w-7 h-7 border-2 border-purple-800 bg-white" />
                <div className="absolute top-1.5 right-1.5 w-7 h-7 border-2 border-purple-800 bg-white" />
                <div className="absolute bottom-1.5 left-1.5 w-7 h-7 border-2 border-purple-800 bg-white" />
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-purple-400 font-sans">Show at Backstage Entry</span>
            </div>
          </div>

          {/* Tear line footer */}
          <div className="relative border-t-2 border-dashed border-purple-200 py-3 px-6 flex justify-between items-center" style={{ backgroundColor: '#F5F0FF' }}>
            <div className="absolute -left-3 top-[-7px] w-6 h-3.5 rounded-full bg-paper border border-purple-200" />
            <div className="absolute -right-3 top-[-7px] w-6 h-3.5 rounded-full bg-paper border border-purple-200" />
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold text-purple-400 tracking-widest font-sans">Artist Name</p>
              <p className="text-xs font-bold text-purple-900 font-sans">{ticket.formData?.name || 'Artist'}</p>
            </div>
            <button onClick={() => window.print()} className="p-1.5 rounded-md hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 pt-4">
        <button onClick={() => setView('explore')}
          className="px-6 py-2.5 rounded-full border border-gold text-gold font-sans font-bold text-xs uppercase tracking-wider hover:bg-gold/10 transition-all cursor-pointer">
          Explore More Mehfils
        </button>
        <button onClick={() => setView('profile')}
          className="px-6 py-2.5 rounded-full bg-maroon text-cream font-sans font-bold text-xs uppercase tracking-wider hover:bg-maroon-light transition-all cursor-pointer">
          View My Passes
        </button>
      </div>
    </div>
  );
}




/* ============================================================================
   6. HOST DASHBOARD
   ============================================================================ */
function DashboardView({ events, currentUser, onCreateEvent, setView, setSelectedEvent, setEvents, onApprovePerformer }) {
  const [activeEventTabId, setActiveEventTabId] = useState(events[0]?.id || '');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rsvpTab, setRsvpTab] = useState('audience'); // 'audience' | 'performer'
  
  // Create Event local state
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'poetry',
    tagline: '',
    description: '',
    date: '',
    time: '06:00 PM - 09:00 PM',
    city: 'Delhi',
    venue: '',
    price: 0,
    seatsTotal: 25,
    lineup: ''
  });

  const selectedEvent = events.find(e => e.id === activeEventTabId);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateEvent(newEvent);
    setCreateModalOpen(false);
    // Reset form
    setNewEvent({
      title: '',
      type: 'poetry',
      tagline: '',
      description: '',
      date: '',
      time: '06:00 PM - 09:00 PM',
      city: 'Delhi',
      venue: '',
      price: 0,
      seatsTotal: 25,
      lineup: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleApprovePerformerInternal = async (registrationId, performerEmail) => {
    if (onApprovePerformer && registrationId) {
      await onApprovePerformer(registrationId);
    } else {
      const updatedEvents = events.map(evt => {
        if (evt.id === activeEventTabId) {
          const updatedParticipants = evt.participants.map(part => {
            if (part.email === performerEmail) {
              return { ...part, status: 'Approved' };
            }
            return part;
          });
          return { ...evt, participants: updatedParticipants };
        }
        return evt;
      });
      setEvents(updatedEvents);
    }
  };

  // Metrics calculators
  const totalAudienceCount = events.reduce((sum, e) => sum + e.audience.reduce((s, aud) => s + (aud.seats || 1), 0), 0);
  const totalPerformersCount = events.reduce((sum, e) => sum + e.participants.length, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.price * e.audience.reduce((s, aud) => s + (aud.seats || 1), 0)), 0);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold/20 pb-4 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-maroon">Host Dashboard</h1>
          <p className="text-sm text-charcoal/80 font-sans mt-1">Manage your intimate gatherings and review attendee requests.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-saffron text-cream font-sans font-bold text-xs uppercase tracking-wider hover:bg-saffron-dark transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Mehfil
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-white border border-gold/20 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cream border border-gold flex items-center justify-center text-maroon">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">My Events</p>
            <p className="text-2xl font-bold text-maroon font-sans">{events.length}</p>
          </div>
        </div>

        <div className="bg-card-white border border-gold/20 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cream border border-gold flex items-center justify-center text-saffron">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">Listeners RSVPd</p>
            <p className="text-2xl font-bold text-maroon font-sans">{totalAudienceCount}</p>
          </div>
        </div>

        <div className="bg-card-white border border-gold/20 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cream border border-gold flex items-center justify-center text-purple-800">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">Performers Registered</p>
            <p className="text-2xl font-bold text-maroon font-sans">{totalPerformersCount}</p>
          </div>
        </div>

        <div className="bg-card-white border border-gold/20 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cream border border-gold flex items-center justify-center text-emerald-800">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gold tracking-widest font-sans">Contributions Raised</p>
            <p className="text-2xl font-bold text-maroon font-sans">₹{totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Events List selector */}
        <div className="lg:col-span-4 bg-card-white border border-gold/20 rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-maroon border-b border-gold/10 pb-2 px-2">Active Events</h3>
          <div className="space-y-1">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setActiveEventTabId(e.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl border text-sm font-sans flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                  activeEventTabId === e.id 
                    ? 'bg-maroon text-cream border-maroon shadow-md' 
                    : 'bg-transparent text-charcoal border-transparent hover:bg-gold/10'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-serif font-bold text-sm truncate pr-2">{e.title}</span>
                  <span className={`text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded font-bold ${
                    activeEventTabId === e.id ? 'bg-saffron text-cream' : 'bg-gold/20 text-gold'
                  }`}>
                    {e.city}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full text-xs opacity-80">
                  <span>{e.dateFormatted}</span>
                  <span>{e.seatsRemaining} / {e.seatsTotal} seats open</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: RSVPs & Details table */}
        <div className="lg:col-span-8 bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm space-y-6">
          {selectedEvent ? (
            <>
              {/* Event Quick Meta */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/15 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-maroon">{selectedEvent.title}</h3>
                  <p className="text-xs text-charcoal/80 font-sans mt-0.5">{selectedEvent.venue} • {selectedEvent.time}</p>
                </div>
                <button
                  onClick={() => { setSelectedEvent(selectedEvent.id); setView('detail'); }}
                  className="text-xs font-bold text-saffron hover:text-saffron-dark font-sans tracking-wide uppercase border-b border-saffron cursor-pointer"
                >
                  View Public Page
                </button>
              </div>

              {/* RSVPs Tables */}
              <div className="space-y-4">
                {/* RSVP Tab Selector */}
                <div className="flex border-b border-gold/10">
                  <button
                    onClick={() => setRsvpTab('audience')}
                    className={`py-2.5 px-5 text-sm font-semibold font-sans border-b-2 cursor-pointer transition-colors ${
                      rsvpTab === 'audience' 
                        ? 'border-maroon text-maroon' 
                        : 'border-transparent text-charcoal/70 hover:text-maroon'
                    }`}
                  >
                    Audience / Listeners ({selectedEvent.audience.reduce((s, a) => s + (a.seats || 1), 0)})
                  </button>
                  <button
                    onClick={() => setRsvpTab('performer')}
                    className={`py-2.5 px-5 text-sm font-semibold font-sans border-b-2 cursor-pointer transition-colors ${
                      rsvpTab === 'performer' 
                        ? 'border-maroon text-maroon' 
                        : 'border-transparent text-charcoal/70 hover:text-maroon'
                    }`}
                  >
                    Performer Applications ({selectedEvent.participants.length})
                  </button>
                </div>

                {/* Tab content - Audience table */}
                {rsvpTab === 'audience' && (
                  <div className="overflow-x-auto">
                    {selectedEvent.audience.length > 0 ? (
                      <table className="min-w-full divide-y divide-gold/10 text-xs text-left">
                        <thead>
                          <tr className="text-gold uppercase tracking-wider font-sans font-bold">
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Seats Reserved</th>
                            <th className="py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5 text-charcoal font-sans">
                          {selectedEvent.audience.map((aud, index) => (
                            <tr key={index} className="hover:bg-cream/40">
                              <td className="py-3 px-4 font-bold">{aud.name}</td>
                              <td className="py-3 px-4">{aud.email}</td>
                              <td className="py-3 px-4 font-semibold text-center sm:text-left">{aud.seats || 1}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  Confirmed
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12 text-charcoal/60 font-sans text-xs">
                        No audience tickets booked yet.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content - Performers table */}
                {rsvpTab === 'performer' && (
                  <div className="overflow-x-auto">
                    {selectedEvent.participants.length > 0 ? (
                      <table className="min-w-full divide-y divide-gold/10 text-xs text-left">
                        <thead>
                          <tr className="text-gold uppercase tracking-wider font-sans font-bold">
                            <th className="py-3 px-4">Artist Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Genre/Instrument</th>
                            <th className="py-3 px-4">Short Intro</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5 text-charcoal font-sans">
                          {selectedEvent.participants.map((part, index) => (
                            <tr key={index} className="hover:bg-cream/40">
                              <td className="py-3 px-4 font-bold">{part.name}</td>
                              <td className="py-3 px-4">{part.email}</td>
                              <td className="py-3 px-4 font-semibold text-purple-900">{part.instrument}</td>
                              <td className="py-3 px-4 max-w-[200px] truncate" title={part.bio}>{part.bio || 'No intro provided'}</td>
                              <td className="py-3 px-4 text-right">
                                {part.status === 'Approved' ? (
                                  <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    Approved
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleApprovePerformerInternal(part.id, part.email)}
                                    className="px-2.5 py-1 rounded bg-maroon text-cream font-bold hover:bg-maroon-light transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
                                  >
                                    Approve Slot
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12 text-charcoal/60 font-sans text-xs">
                        No performer applications submitted.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-charcoal/50 font-sans">
              Select an active event on the left list, or create a new one to begin.
            </div>
          )}
        </div>
      </div>

      {/* CREATE EVENT MODAL MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card-white border border-gold/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative text-left">
            <h3 className="font-serif text-2xl font-bold text-maroon border-b border-gold/15 pb-2">Host a Cultural Mehfil</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Mehfil Title</label>
                <input 
                  type="text" 
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Baithak: Acoustic Sufi Night"
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal font-sans">Gathering Type</label>
                  <select
                    name="type"
                    value={newEvent.type}
                    onChange={handleInputChange}
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                  >
                    <option value="poetry">Poetry / Shayari</option>
                    <option value="singing">Acoustic Singing</option>
                    <option value="mehfil">Classical Mehfil</option>
                    <option value="openmic">Open Mic</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal font-sans">City</label>
                  <select
                    name="city"
                    value={newEvent.city}
                    onChange={handleInputChange}
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                  >
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Jaipur">Jaipur</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Short Tagline</label>
                <input 
                  type="text" 
                  name="tagline"
                  value={newEvent.tagline}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. A spiritual evening of folk music and coffee"
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Detailed Story Description</label>
                <textarea 
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  placeholder="Tell your attendees about the intimacy, food, cushions layout, and warm conversations..."
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal font-sans">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal font-sans">Seats Limit</label>
                  <input 
                    type="number" 
                    name="seatsTotal"
                    value={newEvent.seatsTotal}
                    onChange={handleInputChange}
                    required
                    min="5"
                    max="100"
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal font-sans">Price (₹ contribution)</label>
                  <input 
                    type="number" 
                    name="price"
                    value={newEvent.price}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0 for Free entry"
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal font-sans">Time Range</label>
                  <input 
                    type="text" 
                    name="time"
                    value={newEvent.time}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 06:00 PM - 09:00 PM"
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Venue Address</label>
                <input 
                  type="text" 
                  name="venue"
                  value={newEvent.venue}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. The Sufi Courtyard, Indiranagar"
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal font-sans">Artists Lineup (comma separated)</label>
                <input 
                  type="text" 
                  name="lineup"
                  value={newEvent.lineup}
                  onChange={handleInputChange}
                  placeholder="Ustad Kabir Sen (Rabab), Divya Hegde (Vocals)"
                  className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:border-maroon focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gold/15">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 border border-gold text-gold rounded-xl font-sans font-bold text-xs uppercase tracking-wider hover:bg-gold/10 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-maroon text-cream rounded-xl font-sans font-bold text-xs uppercase tracking-wider hover:bg-maroon-light transition-colors cursor-pointer text-center"
                >
                  Create Mehfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   7. USER PROFILE
   ============================================================================ */
function ProfileView({ currentUser, userBookings, savedEvents, setView, setSelectedEvent, onEditBio }) {
  const [profileTab, setProfileTab] = useState('passes'); // 'passes' | 'saved'
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser ? (currentUser.bio || '') : '');
  const [activePassForModal, setActivePassForModal] = useState(null);

  if (!currentUser) {
    return (
      <div className="text-center py-16 bg-card-white border border-gold/20 rounded-2xl shadow-sm space-y-4 font-sans">
        <AlertCircle className="w-12 h-12 text-gold mx-auto" />
        <h3 className="font-serif text-xl font-bold text-maroon">Not Logged In</h3>
        <p className="text-sm text-charcoal/80 max-w-sm mx-auto">Please login to view your cultural profile and tickets.</p>
        <button onClick={() => setView('login')} className="px-5 py-2.5 rounded-full bg-saffron text-cream font-bold text-xs uppercase tracking-wider hover:bg-saffron-dark transition-colors">Sign In</button>
      </div>
    );
  }

  const handleSaveBio = () => {
    onEditBio(bioInput);
    setIsEditingBio(false);
  };

  const userAvatar = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=4A121A&color=fff&size=128`;
  const userBio = currentUser.bio || 'Lover of acoustic instruments and Urdu/Devanagari literature.';
  const userLocation = currentUser.location || 'Delhi, India';

  // Compute activity tracker stats
  const totalBookings = userBookings.length;
  const performerSlots = userBookings.filter(p => p.type === 'performer').length;
  const audienceRSVPs = userBookings.filter(p => p.type === 'audience').length;
  const totalSpent = userBookings.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* User Information Card */}
      <div className="bg-card-white border border-gold/20 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start">
        <img 
          src={userAvatar} 
          alt={currentUser.name} 
          className="w-24 h-24 rounded-full border-2 border-gold shadow object-cover"
        />
        <div className="flex-grow space-y-3 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div>
              <h1 className="font-serif text-2xl font-bold text-maroon">{currentUser.name}</h1>
              <p className="text-xs text-charcoal/70 font-sans">{currentUser.email} • {userLocation}</p>
            </div>
            <button
              onClick={() => {
                if (isEditingBio) {
                  handleSaveBio();
                } else {
                  setBioInput(userBio);
                  setIsEditingBio(true);
                }
              }}
              className="px-4 py-1.5 rounded-full border border-gold text-gold font-sans font-bold text-xs uppercase tracking-wider hover:bg-gold/10 transition-colors cursor-pointer"
            >
              {isEditingBio ? 'Save Profile' : 'Edit Bio'}
            </button>
          </div>
          
          {isEditingBio ? (
            <textarea
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              rows="3"
              className="w-full bg-cream border border-gold/30 rounded-xl py-2 px-3 text-sm font-sans focus:outline-none focus:border-maroon"
            />
          ) : (
            <p className="text-sm text-charcoal leading-relaxed font-sans italic">
              "{userBio}"
            </p>
          )}
        </div>
      </div>

      {/* User Activity Tracker Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cream/30 border border-gold/15 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[9px] uppercase font-bold text-gold tracking-widest font-sans">Total Bookings</p>
          <p className="text-xl font-bold text-maroon font-sans mt-0.5">{totalBookings}</p>
        </div>
        <div className="bg-cream/30 border border-gold/15 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[9px] uppercase font-bold text-gold tracking-widest font-sans">Artist Slots</p>
          <p className="text-xl font-bold text-purple-900 font-sans mt-0.5">{performerSlots}</p>
        </div>
        <div className="bg-cream/30 border border-gold/15 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[9px] uppercase font-bold text-gold tracking-widest font-sans">Audience RSVPs</p>
          <p className="text-xl font-bold text-saffron font-sans mt-0.5">{audienceRSVPs}</p>
        </div>
        <div className="bg-cream/30 border border-gold/15 p-4 rounded-2xl shadow-sm text-center">
          <p className="text-[9px] uppercase font-bold text-gold tracking-widest font-sans">Total Spent</p>
          <p className="text-xl font-bold text-emerald-800 font-sans mt-0.5">₹{totalSpent}</p>
        </div>
      </div>

      {/* Passes and Wishlist Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-gold/20">
          <button
            onClick={() => setProfileTab('passes')}
            className={`py-2.5 px-5 text-sm font-semibold font-sans border-b-2 cursor-pointer transition-colors ${
              profileTab === 'passes' 
                ? 'border-maroon text-maroon' 
                : 'border-transparent text-charcoal/70 hover:text-maroon'
            }`}
          >
            My Digital Invitation Passes ({userBookings.length})
          </button>
          <button
            onClick={() => setProfileTab('saved')}
            className={`py-2.5 px-5 text-sm font-semibold font-sans border-b-2 cursor-pointer transition-colors ${
              profileTab === 'saved' 
                ? 'border-maroon text-maroon' 
                : 'border-transparent text-charcoal/70 hover:text-maroon'
            }`}
          >
            Saved Mehfils ({savedEvents.length})
          </button>
        </div>

        {/* Tab 1: Booked Passes */}
        {profileTab === 'passes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userBookings.length > 0 ? (
              userBookings.map((pass) => {
                const isPerf = pass.type === 'performer';
                return (
                  <div key={pass.id} className={`bg-card-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-44 hover:shadow-md transition-shadow ${isPerf ? 'border-purple-200' : 'border-gold/20'}`}>
                    <div className={`p-4 border-b text-left flex justify-between items-start ${isPerf ? 'bg-purple-50/50 border-purple-100' : 'bg-maroon/5 border-gold/10'}`}>
                      <div>
                        <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${isPerf ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-saffron/10 text-saffron border border-saffron/20'}`}>
                          {isPerf ? '🎤 Performer slot' : '🎟 Audience RSVP'}
                        </span>
                        <h4 className="font-serif font-bold text-maroon text-sm mt-1 truncate max-w-[200px]" title={pass.eventTitle}>{pass.eventTitle}</h4>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase ${pass.status === 'Confirmed' ? 'text-emerald-700' : 'text-amber-700'}`}>{pass.status}</span>
                    </div>

                  <div className="p-4 flex-grow flex justify-between items-end">
                    <div className="space-y-1 text-xs text-charcoal/80 font-sans">
                      <p>{pass.dateFormatted} • {pass.time}</p>
                      <p className="truncate max-w-[240px]">{pass.venue.split(',')[0]}</p>
                    </div>
                    <button
                      onClick={() => setActivePassForModal(pass)}
                      className="px-3 py-1.5 rounded-lg bg-cream text-maroon border border-gold/30 hover:bg-gold/10 font-bold text-xs uppercase tracking-wider font-sans cursor-pointer"
                    >
                      View Ticket
                    </button>
                  </div>
                </div>
              )})
            ) : (
              <div className="md:col-span-2 text-center py-12 text-charcoal/50 font-sans text-xs">
                No active passes. Go to Explore and find your next mehfil!
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved / Bookmarked events */}
        {profileTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.length > 0 ? (
              savedEvents.map((evt) => (
                <EventCard 
                  key={evt.id} 
                  event={evt} 
                  onViewDetails={(id) => { setSelectedEvent(id); setView('detail'); }} 
                />
              ))
            ) : (
              <div className="lg:col-span-3 text-center py-12 text-charcoal/50 font-sans text-xs">
                No saved events yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* PASS MODAL POPUP */}
      {activePassForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-sm w-full animate-fade-in text-left">
            <button 
              onClick={() => setActivePassForModal(null)}
              className="absolute -top-10 right-0 text-cream font-bold hover:text-gold text-sm cursor-pointer"
            >
              Close [X]
            </button>
            <ConfirmationView ticket={activePassForModal} setView={setView} />
          </div>
        </div>
      )}
    </div>
  );
}


/* ============================================================================
   8. LOGIN / SIGNUP VIEW  � Real backend API: login + register + OTP verify
   ============================================================================ */
function LoginView({ setView, onAuthSuccess }) {
  const API = 'http://localhost:5000/api/auth';
  // mode: 'login' | 'register' | 'otp'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  // otp
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const id = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(id); return 0; } return t - 1; });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onAuthSuccess(data.user, data.token);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setOtpEmail(regEmail);
      setSuccess('OTP sent to your email! Check your inbox.');
      setMode('otp');
      startResendTimer();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: otpEmail, otp }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      onAuthSuccess(data.user, data.token);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return; setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: otpEmail }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('New OTP sent!'); startResendTimer();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-fade-in text-left font-sans">
      <div className="bg-card-white border border-gold/30 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-center mb-6"><Diya className="w-12 h-12" /></div>

        {mode === 'otp' ? (
          <>
            <div className="text-center space-y-2 mb-6">
              <h2 className="font-serif text-3xl font-bold text-maroon">Verify Your Email</h2>
              <p className="text-xs text-charcoal/70">A 6-digit code was sent to <span className="font-semibold text-maroon">{otpEmail}</span></p>
              {success && <p className="text-xs text-emerald-600 font-semibold">{success}</p>}
            </div>
            {error && <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-charcoal">Enter OTP</label>
                <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required placeholder="� � � � � �"
                  className="w-full bg-cream border border-gold/30 rounded-xl py-3 px-4 text-3xl tracking-[1.2rem] text-center font-mono font-bold focus:border-maroon focus:outline-none" />
              </div>
              <button type="submit" disabled={loading || otp.length < 6}
                className="w-full py-3 bg-maroon hover:bg-maroon-light disabled:opacity-50 text-cream font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors cursor-pointer">
                {loading ? 'Verifying�' : 'Verify & Enter Navras'}
              </button>
            </form>
            <div className="text-center mt-5 text-xs text-charcoal/70">
              {"Didn't receive the code? "}
              {resendTimer > 0 ? <span className="text-gold font-semibold">Resend in {resendTimer}s</span>
                : <button onClick={handleResendOtp} disabled={loading} className="text-saffron font-bold hover:underline cursor-pointer">Resend OTP</button>}
            </div>
            <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className="mt-4 w-full text-center text-xs text-charcoal/40 hover:text-maroon cursor-pointer">Back to register</button>
          </>
        ) : (
          <>
            <div className="flex rounded-xl overflow-hidden border border-gold/30 mb-6">
              <button onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${mode === 'login' ? 'bg-maroon text-cream' : 'bg-cream/50 text-charcoal hover:bg-cream'}`}>
                Sign In
              </button>
              <button onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${mode === 'register' ? 'bg-maroon text-cream' : 'bg-cream/50 text-charcoal hover:bg-cream'}`}>
                Register
              </button>
            </div>
            <div className="text-center space-y-1 mb-6">
              <h2 className="font-serif text-2xl font-bold text-maroon">{mode === 'login' ? 'Welcome to Navras' : 'Begin Your Journey'}</h2>
              <p className="text-xs text-charcoal/70">{mode === 'login' ? 'Sign in to book seats, host mehfils & more.' : 'Join the community � your cultural home awaits.'}</p>
            </div>
            {error && <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm focus:border-maroon focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="��������"
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm focus:border-maroon focus:outline-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-maroon hover:bg-maroon-light disabled:opacity-50 text-cream font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors cursor-pointer mt-2">
                  {loading ? 'Signing in�' : 'Sign In'}
                </button>
              </form>
            )}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal">Full Name</label>
                  <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Your full name"
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm focus:border-maroon focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-charcoal">Email Address</label>
                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="you@example.com"
                    className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm focus:border-maroon focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal">Phone</label>
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} required placeholder="+91 99999 99999"
                      className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm focus:border-maroon focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-charcoal">Password</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="min 6 chars"
                      className="w-full bg-cream border border-gold/30 rounded-xl py-2.5 px-3 text-sm focus:border-maroon focus:outline-none" />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-maroon hover:bg-maroon-light disabled:opacity-50 text-cream font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors cursor-pointer mt-1">
                  {loading ? 'Sending OTP�' : 'Create Account & Send OTP'}
                </button>
                <p className="text-[10px] text-charcoal/50 text-center">A 6-digit verification code will be sent to your email.</p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
