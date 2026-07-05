import React, { useState } from 'react';
import navrasLogo from '../assets/navraslogo.jpeg';
import { Menu, X, User, LogOut, LayoutDashboard, Compass, Sparkles, ShieldCheck, UserPlus } from 'lucide-react';

export default function Navbar({ currentView, setView, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigation = [
    { name: 'Explore Mehfils', view: 'explore', icon: Compass },
    { name: 'About & Contact', view: 'about', icon: Sparkles },
  ];

  const handleNavClick = (view) => {
    setView(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-gold/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('landing')}>
            <img src={navrasLogo} alt="Navras logo" className="h-20 w-auto object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center gap-1.5 font-sans font-medium text-sm transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-maroon border-b-2 border-saffron pb-1' : 'text-charcoal/80 hover:text-maroon'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gold" />
                  {item.name}
                </button>
              );
            })}

            {/* Admin link — only for admins */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 font-sans font-medium text-sm transition-colors cursor-pointer ${
                  currentView === 'admin' ? 'text-maroon border-b-2 border-saffron pb-1' : 'text-purple-800 hover:text-maroon'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin Panel
              </button>
            )}

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer focus:outline-none p-1 rounded-full hover:bg-gold/10 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full border border-gold bg-maroon flex items-center justify-center text-cream font-bold text-sm">
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-charcoal font-sans hidden lg:inline">{currentUser.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card-white border border-gold/30 shadow-xl py-1 ring-1 ring-black/5 animate-fade-in origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-gold/10 text-left">
                      <p className="text-xs text-gold uppercase tracking-wider font-semibold">Logged in as</p>
                      <p className="text-sm font-semibold text-maroon font-serif truncate">{currentUser.name}</p>
                      <p className="text-xs text-charcoal/60 truncate">{currentUser.email}</p>
                      {currentUser.role === 'admin' && (
                        <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">Admin</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleNavClick('profile')}
                      className="flex w-full items-center px-4 py-2 text-sm text-charcoal hover:bg-cream hover:text-maroon transition-colors text-left"
                    >
                      <User className="mr-3 h-4 w-4 text-gold" />
                      My Profile & Passes
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="flex w-full items-center px-4 py-2 text-sm text-charcoal hover:bg-cream hover:text-maroon transition-colors text-left"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-gold" />
                        Host Dashboard
                      </button>
                    )}

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="flex w-full items-center px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors text-left"
                      >
                        <ShieldCheck className="mr-3 h-4 w-4" />
                        Admin Panel
                      </button>
                    )}

                    <button
                      onClick={() => { onLogout(); setDropdownOpen(false); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors text-left border-t border-gold/10"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setView('login'); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-maroon text-maroon font-sans font-medium text-sm hover:bg-maroon hover:text-cream transition-all duration-300 shadow-sm cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setView('login'); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-maroon/10 border border-maroon/30 text-maroon font-sans font-medium text-sm hover:bg-maroon hover:text-cream transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>
              </div>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-saffron text-cream font-sans font-semibold text-sm hover:bg-saffron-dark transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 fill-cream" />
                Host a Mehfil
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-3">
            {currentUser && (
              <button onClick={() => handleNavClick('profile')} className="flex items-center">
                <div className="h-8 w-8 rounded-full border border-gold bg-maroon flex items-center justify-center text-cream font-bold text-sm">
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-maroon hover:bg-gold/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream border-b border-gold/20 px-2 pt-2 pb-4 space-y-1 shadow-lg animate-fade-in">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.view)}
                className={`flex w-full items-center px-4 py-3 rounded-lg text-base font-medium font-sans ${
                  isActive ? 'bg-maroon text-cream' : 'text-charcoal hover:bg-gold/10 hover:text-maroon'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 text-gold" />
                {item.name}
              </button>
            );
          })}

          {currentUser ? (
            <>
              <button onClick={() => handleNavClick('profile')} className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium font-sans text-charcoal hover:bg-gold/10 hover:text-maroon">
                <User className="w-5 h-5 mr-3 text-gold" /> My Profile & Passes
              </button>
              {currentUser.role === 'admin' && (
                <button onClick={() => handleNavClick('dashboard')} className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium font-sans text-charcoal hover:bg-gold/10 hover:text-maroon">
                  <LayoutDashboard className="w-5 h-5 mr-3 text-gold" /> Host Dashboard
                </button>
              )}
              {currentUser.role === 'admin' && (
                <button onClick={() => handleNavClick('admin')} className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium font-sans text-purple-700 hover:bg-purple-50">
                  <ShieldCheck className="w-5 h-5 mr-3" /> Admin Panel
                </button>
              )}
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium font-sans text-red-700 hover:bg-red-50">
                <LogOut className="w-5 h-5 mr-3" /> Log out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavClick('login')} className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium font-sans text-maroon border border-maroon/20 hover:bg-maroon/10">
                Sign In
              </button>
              <button onClick={() => handleNavClick('login')} className="flex w-full items-center gap-2 px-4 py-3 rounded-lg text-base font-medium font-sans text-maroon border border-maroon/20 hover:bg-maroon/10">
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </>
          )}

          {currentUser?.role === 'admin' && (
            <div className="pt-2 px-2">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full text-center py-3 rounded-lg bg-saffron text-cream font-sans font-bold shadow-md hover:bg-saffron-dark block"
              >
                Host a Mehfil
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
