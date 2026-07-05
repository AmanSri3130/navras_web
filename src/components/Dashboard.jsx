import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

/**
 * Dashboard view showing user activity statistics.
 * It pulls stats, bookings, and saved events from the API.
 */
export default function Dashboard({ currentUser, setView, setSelectedEvent }) {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: statsData }, { data: bookingsData }, { data: savedData }] = await Promise.all([
          axios.get('/api/users/me/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('/api/registrations/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          // Assuming saved events endpoint exists; for now reuse bookings as placeholder
          axios.get('/api/registrations/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        setStats(statsData);
        setBookings(bookingsData);
        // Filter saved events from bookings where saved flag would be true – placeholder uses empty array
        setSaved([]);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      }
    };
    fetchData();
  }, []);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal/70">Please log in to view your dashboard.</p>
        <button onClick={() => setView('login')} className="mt-4 px-5 py-2 rounded-full bg-maroon text-cream font-bold">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <img src={currentUser.avatar} alt={currentUser.name} className="w-20 h-20 rounded-full border-2 border-gold" />
        <div>
          <h2 className="font-serif text-2xl text-maroon">{currentUser.name}</h2>
          <p className="text-sm text-charcoal/70">{currentUser.email}</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-cream p-4 rounded-xl">
          <div className="text-center">
            <p className="text-xs text-charcoal/60">Total Events</p>
            <p className="font-bold text-maroon text-lg">{stats.totalEvents}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">As Audience</p>
            <p className="font-bold text-maroon text-lg">{stats.asAudience}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">As Performer</p>
            <p className="font-bold text-maroon text-lg">{stats.asPerformer}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-charcoal/60">Spent</p>
            <p className="font-bold text-maroon text-lg">₹{stats.totalSpent}</p>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <section>
        <h3 className="font-serif text-xl text-maroon mb-3">Your Passes</h3>
        {bookings.length === 0 ? (
          <p className="text-charcoal/60">You haven't bought any tickets yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-card-white border border-gold/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow">
                <div className="bg-maroon/5 p-2 border-b border-gold/10 text-left flex justify-between items-start">
                  <div>
                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${b.type === 'performer' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-saffron/10 text-saffron border border-saffron/20'}`}> {b.type === 'audience' ? 'Audience RSVP' : 'Performer slot'} </span>
                    <h4 className="font-serif font-bold text-maroon text-sm mt-1 truncate" title={b.eventTitle}>{b.eventTitle}</h4>
                  </div>
                  <span className="text-[10px] text-charcoal font-semibold">{b.status}</span>
                </div>
                <div className="p-2 flex-grow flex justify-between items-end">
                  <div className="space-y-1 text-xs text-charcoal/80">
                    <p>{b.dateFormatted} • {b.time}</p>
                    <p className="truncate">{b.eventVenue}</p>
                  </div>
                  <button onClick={() => { setSelectedEvent(b.eventId); setView('detail'); }} className="px-3 py-1.5 rounded-lg bg-cream text-maroon border border-gold/30 hover:bg-gold/10 font-bold text-xs uppercase tracking-wider cursor-pointer">View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
