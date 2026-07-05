import React from 'react';
import { Mail, Phone, MapPin, MessageSquare, Sparkles, Send } from 'lucide-react';
import { InstagramIcon, WhatsAppIcon, YouTubeIcon } from './SocialIcons';
import navrasImg from '../assets/navras.jpeg';
import Diya from './Diya';

export default function AboutView() {
  const team = [
    {
      name: 'Aman K.',
      role: 'Founder & Cultural Curator',
      bio: 'Visionary behind Navras, dedicated to bringing back the warmth of traditional acoustic mehfils and intimate baithaks.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Zoya Siddiqui',
      role: 'Creative Director & Poetry Lead',
      bio: 'Urdu literature scholar and poet, curating the finest shayaris, nazms, and ghazal artists for the marquee.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Rohan Malhotra',
      role: 'Operations & Host Relations',
      bio: 'Ensuring every venue has the perfect candlelit ambience, fresh kulhad chai, and a cozy floor seating setup.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! We will get back to you shortly.');
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in text-left">
      {/* ── ABOUT US ── */}
      <section className="space-y-6 text-center max-w-3xl mx-auto">
        <Diya className="w-12 h-12 mx-auto text-saffron" />
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-maroon">Our Story</h1>
        <p className="font-serif text-lg text-charcoal/80 leading-relaxed italic">
          "Navras represents the nine emotions of human experience. We created this space to escape the noise of digital life and return to soulful, candlelit gatherings."
        </p>
        <p className="text-sm sm:text-base text-charcoal/70 font-sans leading-relaxed">
          In a world dominated by massive concerts and loud club venues, Navras is a sanctuary for intimate, acoustic, and community-driven cultural experiences. Whether it's a quiet poetry circle, an unplugged singing session, or an open mic where every whisper is heard, we celebrate the raw beauty of classical art.
        </p>
      </section>

      {/* Decorative Line Accent */}
      <div className="flex items-center justify-center gap-4 opacity-35">
        <div className="h-px bg-gold w-24"></div>
        <Sparkles className="w-5 h-5 text-gold" />
        <div className="h-px bg-gold w-24"></div>
      </div>

      {/* ── OUR TEAM ── */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl font-bold text-maroon">The Curators of Ambience</h2>
          <p className="text-sm text-charcoal/60 font-sans">The team dedicated to preserving culture, art, and intimacy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div key={idx} className="bg-card-white border border-gold/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gold/40">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-maroon">{member.name}</h3>
                <p className="text-xs text-saffron font-sans font-semibold uppercase tracking-wider">{member.role}</p>
              </div>
              <p className="text-xs text-charcoal/80 font-sans leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Decorative Line Accent */}
      <div className="flex items-center justify-center gap-4 opacity-35">
        <div className="h-px bg-gold w-24"></div>
        <Sparkles className="w-5 h-5 text-gold" />
        <div className="h-px bg-gold w-24"></div>
      </div>

      {/* ── CONTACT US & SOCIAL HANDLES ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info & Banner Image */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-maroon">Get in Touch</h2>
            <p className="text-sm text-charcoal/60 font-sans">Have a venue to recommend? Or want to partner with us?</p>
          </div>

          <div className="space-y-4 font-sans text-sm text-charcoal/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream border border-gold/30 flex items-center justify-center text-maroon">
                <Mail className="w-4 h-4" />
              </div>
              <span>contact@navras.in</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream border border-gold/30 flex items-center justify-center text-maroon">
                <Phone className="w-4 h-4" />
              </div>
              <span>+91 99999 99999</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream border border-gold/30 flex items-center justify-center text-maroon">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Delhi • Mumbai • Bangalore</span>
            </div>
          </div>

          {/* Clickable Banner Image linking to contact options */}
          <div className="space-y-2">
            <p className="text-xs uppercase font-bold text-gold tracking-widest font-sans">Quick Connect</p>
            <a 
              href="https://wa.me/919999999999?text=Hello%20Navras%20Team!" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block relative rounded-2xl overflow-hidden shadow-md group border border-gold/30 cursor-pointer"
            >
              <img 
                src={navrasImg} 
                alt="Navras Gathering banner" 
                className="w-full h-48 object-cover group-hover:scale-102 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-maroon/70 flex flex-col justify-end p-4 text-cream">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-saffron-light fill-current" />
                  <span className="text-[10px] uppercase font-bold tracking-widest font-sans">WhatsApp Chat</span>
                </div>
                <h4 className="font-serif text-base font-bold">Click to start conversation</h4>
                <p className="text-[10px] text-cream/70 font-sans mt-0.5">Direct chat with our community team</p>
              </div>
            </a>
          </div>

          {/* Social Media Handles */}
          <div className="space-y-3">
            <p className="text-xs uppercase font-bold text-gold tracking-widest font-sans">Follow the Journey</p>
            <div className="flex gap-3">
              <a 
                href="https://instagram.com/navras" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Instagram"
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <InstagramIcon className="w-7 h-7" />
              </a>
              <a 
                href="https://wa.me/919999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <WhatsAppIcon className="w-7 h-7" />
              </a>
              <a 
                href="https://youtube.com/navras" 
                target="_blank" 
                rel="noopener noreferrer"
                title="YouTube"
                className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              >
                <YouTubeIcon className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-card-white border border-gold/20 rounded-2xl p-6 sm:p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal/80">Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full bg-cream border border-gold/30 rounded-xl px-4 py-2.5 text-sm focus:border-maroon focus:outline-none transition-colors"
                  placeholder="Karan Malhotra"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal/80">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-cream border border-gold/30 rounded-xl px-4 py-2.5 text-sm focus:border-maroon focus:outline-none transition-colors"
                  placeholder="karan@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal/80">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  className="w-full bg-cream border border-gold/30 rounded-xl px-4 py-2.5 text-sm focus:border-maroon focus:outline-none transition-colors"
                  placeholder="+91 99999 99999"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-charcoal/80">Purpose</label>
                <select className="w-full bg-cream border border-gold/30 rounded-xl px-4 py-2.5 text-sm focus:border-maroon focus:outline-none transition-colors">
                  <option>General Inquiry</option>
                  <option>Host an Event</option>
                  <option>Suggest a Venue</option>
                  <option>Sponsorship / Partnership</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal/80">Message</label>
              <textarea 
                rows="4" 
                required 
                className="w-full bg-cream border border-gold/30 rounded-xl px-4 py-2.5 text-sm focus:border-maroon focus:outline-none transition-colors"
                placeholder="Share your thoughts or tell us about your project..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 rounded-full bg-maroon text-cream font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-maroon-dark transition-colors cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
