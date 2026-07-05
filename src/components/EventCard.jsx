import React from 'react';
import { Calendar, MapPin, Users, IndianRupee } from 'lucide-react';

export default function EventCard({ event, onViewDetails }) {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'poetry':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'singing':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'mehfil':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'openmic':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-300';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'poetry': return 'Poetry & Nazm';
      case 'singing': return 'Live Singing';
      case 'mehfil': return 'Mehfil / Baithak';
      case 'openmic': return 'Open Mic';
      default: return 'Gathering';
    }
  };

  const isLowSeats = event.seatsRemaining > 0 && event.seatsRemaining <= 10;
  const isSoldOut = event.seatsRemaining === 0;

  return (
    <div className="group bg-card-white rounded-2xl shadow-md overflow-hidden card-border-gold transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col h-full animate-fade-in">
      {/* Cover Image */}
      <div className="relative h-56 w-full overflow-hidden border-b border-gold/10">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
        
        {/* Event Type Badge */}
        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide uppercase border shadow-sm ${getBadgeStyle(event.type)}`}>
          {getTypeName(event.type)}
        </span>

        {/* Price Badge */}
        <span className="absolute bottom-4 right-4 bg-cream/90 backdrop-blur-sm text-maroon border border-gold/30 px-3 py-1 rounded-lg text-sm font-bold font-sans flex items-center shadow-sm">
          {event.price === 0 ? (
            'Free Entry'
          ) : (
            <>
              <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
              {event.price}
            </>
          )}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-grow flex flex-col justify-between relative z-10">
        <div>
          {/* Host Info */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gold uppercase tracking-widest font-semibold font-sans">Hosted by</span>
            <span className="text-xs font-bold text-charcoal font-sans">{event.hostName}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-bold text-maroon hover:text-maroon-light transition-colors leading-snug mb-3">
            {event.title}
          </h3>

          {/* Tagline */}
          <p className="text-sm text-charcoal/80 font-sans line-clamp-2 mb-5">
            {event.tagline}
          </p>
        </div>

        {/* Meta Info */}
        <div className="space-y-2.5 pt-4 border-t border-gold/10">
          <div className="flex items-center text-xs text-charcoal/80 font-sans">
            <Calendar className="w-4 h-4 mr-2.5 text-gold shrink-0" />
            <span>{event.dateFormatted} • {event.time.split(' - ')[0]}</span>
          </div>
          
          <div className="flex items-center text-xs text-charcoal/80 font-sans">
            <MapPin className="w-4 h-4 mr-2.5 text-gold shrink-0" />
            <span className="truncate">{event.venue}, {event.city}</span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            {/* Seats status */}
            <div className="flex items-center text-xs font-semibold font-sans">
              <Users className="w-4 h-4 mr-2 text-gold shrink-0" />
              {isSoldOut ? (
                <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">Sold Out</span>
              ) : isLowSeats ? (
                <span className="text-saffron bg-saffron/10 border border-saffron/20 px-2 py-0.5 rounded animate-pulse">
                  Only {event.seatsRemaining} seats left!
                </span>
              ) : (
                <span className="text-charcoal">{event.seatsRemaining} of {event.seatsTotal} seats open</span>
              )}
            </div>

            {/* CTA */}
            <button 
              onClick={() => onViewDetails(event.id)}
              className="text-xs font-bold text-maroon hover:text-saffron font-sans tracking-wide uppercase flex items-center gap-1 cursor-pointer transition-colors duration-200"
            >
              View Mehfil &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
