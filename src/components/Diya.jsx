import React from 'react';

export default function Diya({ className = "w-10 h-10", flameSize = "w-4 h-6" }) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Flame */}
      <div 
        className={`absolute -top-3 w-3 h-5 bg-gradient-to-t from-saffron via-saffron-light to-amber-300 rounded-full blur-[0.5px] origin-bottom animate-diya-flicker`}
        style={{
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        }}
      />
      {/* Flame Glow */}
      <div 
        className="absolute -top-5 w-6 h-8 bg-saffron/20 rounded-full blur-md origin-bottom animate-pulse-slow pointer-events-none"
      />
      {/* Clay Lamp (Mitti ka Diya) base */}
      <svg 
        viewBox="0 0 100 50" 
        className="w-full h-auto text-maroon fill-current drop-shadow-md"
      >
        {/* Clay base */}
        <path d="M 10 25 Q 50 55 90 25 C 75 10, 25 10, 10 25 Z" />
        {/* Gold trim */}
        <path 
          d="M 12 24 Q 50 52 88 24" 
          fill="none" 
          stroke="#C5A880" 
          strokeWidth="2" 
          strokeDasharray="2,2"
        />
        {/* Inner shadow/hollow */}
        <path 
          d="M 15 22 Q 50 35 85 22 C 75 16, 25 16, 15 22 Z" 
          className="text-maroon-dark fill-current opacity-60" 
        />
      </svg>
    </div>
  );
}
