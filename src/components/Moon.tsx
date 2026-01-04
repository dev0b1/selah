import React from 'react';

interface MoonProps {
  className?: string;
  top?: string;
  right?: string;
  left?: string;
}

export function Moon({ className = '', top = '5.5rem', right = '2.5rem', left }: MoonProps) {
  const style: React.CSSProperties = {
    position: 'fixed',
    top: top,
    right: right,
    left: left,
    zIndex: 5,
    pointerEvents: 'none',
  };

  return (
    <div style={style} className={className}>
      {/* Moon body */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#F5E6D3] via-[#E8D4B8] to-[#D4A574] moon-glow relative">
        {/* Craters */}
        <div className="absolute top-3 left-4 w-3 h-3 rounded-full bg-[#D4A574]/40" />
        <div className="absolute top-8 right-5 w-2 h-2 rounded-full bg-[#D4A574]/30" />
        <div className="absolute bottom-4 left-6 w-4 h-4 rounded-full bg-[#D4A574]/25" />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#D4A574]/35 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Moon glow aura */}
      <div className="absolute inset-0 -m-4 rounded-full bg-[#D4A574]/10 blur-xl" />
      <div className="absolute inset-0 -m-8 rounded-full bg-[#D4A574]/5 blur-2xl" />
    </div>
  );
}

