import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Official TikTok Logo SVG
 */
export function TikTokIcon({ className = "w-4 h-4", size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className} 
      style={style}
      aria-label="TikTok"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46 6.27 6.27 0 0 0 1.88-4.46V8.75a8.28 8.28 0 0 0 4.85 1.54V6.84a4.83 4.83 0 0 1-1-.15z" />
    </svg>
  );
}

/**
 * Official Google 4-Color Logo SVG
 */
export function GoogleIcon({ className = "w-4 h-4", size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      style={style}
      aria-label="Google"
    >
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  );
}

/**
 * Official Google Maps Pin Logo SVG
 */
export function GoogleMapsIcon({ className = "w-4 h-4", size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      style={style}
      aria-label="Google Maps"
    >
      <path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  );
}

/**
 * Official Meta Ribbon Infinity Logo SVG
 */
export function MetaIcon({ className = "w-4 h-4", size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      style={style}
      fill="#0081FB"
      aria-label="Meta"
    >
      <path d="M12 10.158c-1.309-1.854-2.852-2.983-4.66-2.983-3.09 0-5.34 2.47-5.34 6.137 0 3.896 2.502 6.513 5.748 6.513 1.884 0 3.486-.967 4.252-2.435.766 1.468 2.368 2.435 4.252 2.435 3.246 0 5.748-2.617 5.748-6.513 0-3.667-2.25-6.137-5.34-6.137-1.808 0-3.351 1.129-4.66 2.983zm-4.66 7.427c-1.858 0-3.385-1.564-3.385-4.252 0-2.529 1.396-4.045 3.385-4.045 1.517 0 2.827 1.176 3.642 3.125-.794 2.42-2.036 5.172-3.642 5.172zm9.32 0c-1.606 0-2.848-2.752-3.642-5.172.815-1.949 2.125-3.125 3.642-3.125 1.989 0 3.385 1.516 3.385 4.045 0 2.688-1.527 4.252-3.385 4.252z"/>
    </svg>
  );
}

/**
 * Official Instagram Gradient Logo SVG
 */
export function InstagramIcon({ className = "w-4 h-4", size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      style={style}
      aria-label="Instagram"
    >
      <defs>
        <radialGradient id="fp-ig-gradient" r="150%" cx="30%" cy="107%">
          <stop stopColor="#fdf497" offset="0%" />
          <stop stopColor="#fdf497" offset="5%" />
          <stop stopColor="#fd5949" offset="45%" />
          <stop stopColor="#d6249f" offset="60%" />
          <stop stopColor="#285AEB" offset="90%" />
        </radialGradient>
      </defs>
      <path 
        fill="url(#fp-ig-gradient)" 
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

/**
 * Official Facebook Blue Logo SVG
 */
export function FacebookIcon({ className = "w-4 h-4", size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      style={style}
      aria-label="Facebook"
    >
      <path 
        fill="#1877F2" 
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
      <path 
        fill="#ffffff" 
        d="M16.671 15.543l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.513V4.996s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.643H7.078v3.47h3.047v8.385a12.09 12.09 0 0 0 3.75 0v-8.385h2.796z"
      />
    </svg>
  );
}
