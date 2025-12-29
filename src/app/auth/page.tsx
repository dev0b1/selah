"use client";

import { Suspense } from "react";
import AuthContent from "./auth-content";
import { StarsBackground } from "@/components/StarsBackground";
import { CityLightsBackground } from "@/components/CityLightsBackground";

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Night Background Gradient - Same as landing page */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#2d3a5a] to-[#6b4d57]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4a3a5f]/40 to-[#8b5a4f]/60"></div>
      </div>
      {/* Stars background */}
      <StarsBackground count={30} />
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
      <CityLightsBackground />

      {/* Floating stars */}
      <StarsBackground count={30} />

      <Suspense fallback={<AuthLoading />}>
        <AuthContent />
      </Suspense>
    </div>
  );
}
