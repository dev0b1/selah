"use client";

import { Suspense } from "react";
import AuthContent from "./auth-content";

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Night Background Gradient - Same as landing page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#2d3a5a] to-[#6b4d57]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4a3a5f]/40 to-[#8b5a4f]/60"></div>
      </div>
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Night Background Gradient - Same as landing page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#2d3a5a] to-[#6b4d57]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4a3a5f]/40 to-[#8b5a4f]/60"></div>
      </div>

      {/* Crescent Moon - Upper Right */}
      <div className="absolute top-12 right-8 md:top-16 md:right-16 w-16 h-16 md:w-20 md:h-20">
        <div className="w-full h-full rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)]"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-full bg-gradient-to-br from-[#1a2332] to-transparent"></div>
      </div>

      {/* City Lights Bokeh Effect - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f1a] to-transparent opacity-60"></div>
        {/* Twinkling city lights */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-around">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white/80 rounded-full blur-[1px] animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.6 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
        {/* Additional scattered lights */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-between px-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 h-0.5 md:w-1 md:h-1 bg-white/60 rounded-full blur-[0.5px]"
              style={{
                opacity: 0.4 + Math.random() * 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating stars - using animate-pulse instead of custom keyframe */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: '3s',
            }}
          />
        ))}
      </div>

      <Suspense fallback={<AuthLoading />}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
