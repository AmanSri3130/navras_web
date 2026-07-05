import React from 'react';

/** Official Instagram gradient logo SVG */
export function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="3.2" stroke="white" strokeWidth="1.8" />
      <circle cx="17.1" cy="6.9" r="1.1" fill="white" />
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

/** Official WhatsApp green logo SVG */
export function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5.5" fill="#25D366" />
      <path
        d="M12 4.5C7.86 4.5 4.5 7.86 4.5 12c0 1.5.41 2.9 1.12 4.1L4.5 19.5l3.52-1.08A7.47 7.47 0 0 0 12 19.5c4.14 0 7.5-3.36 7.5-7.5S16.14 4.5 12 4.5zm4.07 10.57c-.17.48-1 .93-1.38.96-.38.04-1.36.06-2.62-.5-1.26-.56-2.92-2.15-3.38-3.3-.46-1.15-.35-1.94-.1-2.35.25-.41.57-.52.77-.54.2-.02.4 0 .57 0 .18 0 .43-.07.66.5.24.57.8 1.97.87 2.12.07.14.12.31.02.5-.1.19-.15.3-.29.46-.14.16-.3.35-.42.47-.14.13-.28.27-.12.53.16.26.7 1.14 1.5 1.84.97.87 1.79 1.14 2.05 1.27.26.13.41.11.57-.06.16-.17.67-.78.85-1.04.18-.26.36-.22.6-.13.24.09 1.54.73 1.8.86.27.14.44.21.51.32.07.11.07.63-.1 1.11z"
        fill="white"
      />
    </svg>
  );
}

/** Official YouTube red logo SVG */
export function YouTubeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5.5" fill="#FF0000" />
      <path
        d="M19.6 8.2a2 2 0 0 0-1.4-1.4C16.8 6.5 12 6.5 12 6.5s-4.8 0-6.2.3a2 2 0 0 0-1.4 1.4C4.1 9.6 4.1 12 4.1 12s0 2.4.3 3.8a2 2 0 0 0 1.4 1.4c1.4.3 6.2.3 6.2.3s4.8 0 6.2-.3a2 2 0 0 0 1.4-1.4c.3-1.4.3-3.8.3-3.8s0-2.4-.3-3.8z"
        fill="white"
      />
      <polygon points="10.2,9.5 10.2,14.5 15,12" fill="#FF0000" />
    </svg>
  );
}

/** Globe / Website icon */
export function WebsiteIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="12" cy="12" rx="3.8" ry="9.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.5 12h19M4.5 7.5h15M4.5 16.5h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** X (Twitter) logo SVG */
export function XIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
