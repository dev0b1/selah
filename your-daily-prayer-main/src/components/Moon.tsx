import React from 'react';

interface MoonProps {
  className?: string;
}

export function Moon({ className = '' }: MoonProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Moon body */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-moon via-moon/90 to-moon/70 moon-glow relative">
        {/* Craters */}
        <div className="absolute top-3 left-4 w-3 h-3 rounded-full bg-moon/40" />
        <div className="absolute top-8 right-5 w-2 h-2 rounded-full bg-moon/30" />
        <div className="absolute bottom-4 left-6 w-4 h-4 rounded-full bg-moon/25" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-moon/35 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Moon glow aura */}
      <div className="absolute inset-0 -m-4 rounded-full bg-moon/10 blur-xl" />
      <div className="absolute inset-0 -m-8 rounded-full bg-moon/5 blur-2xl" />
    </div>
  );
}
