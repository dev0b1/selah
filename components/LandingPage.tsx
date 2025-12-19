"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBook, FaPrayingHands } from "react-icons/fa";
import { getTodaysVerse } from "@/lib/bible-verses";

interface LandingPageProps {
  onContinue: () => void;
}

export function LandingPage({ onContinue }: LandingPageProps) {
  const verse = getTodaysVerse();
  const samplePrayer = "Lord, fill me with Your peace and guide me through this day. Amen.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Night Background Gradient - Always night theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332] via-[#2d3a5a] to-[#6b4d57]">
        {/* Sunset/sunrise gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4a3a5f]/40 to-[#8b5a4f]/60"></div>
      </div>

      {/* Crescent Moon - Upper Right */}
      <motion.div 
        className="absolute top-12 right-8 md:top-16 md:right-16 w-16 h-16 md:w-20 md:h-20"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: [0, -5, 0],
        }}
        transition={{ 
          scale: { duration: 1 },
          rotate: { duration: 1 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="w-full h-full rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.3)]"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
        {/* Crescent shape for moon */}
        <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-full bg-gradient-to-br from-[#1a2332] to-transparent"></div>
      </motion.div>

      {/* City Lights Bokeh Effect - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 overflow-hidden">
        {/* Distant mountains/silhouette */}
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

      <div className="max-w-2xl w-full text-center space-y-10 md:space-y-12 relative z-10 py-12">
        {/* Logo - White Script */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-script text-white">
            Selah
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-light tracking-wide">
            Pause. Breathe. Pray.
          </p>
        </motion.div>

        {/* Today's Bible Verse - No card, direct on background */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 px-4"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <FaBook className="text-[#D4A574] text-xl md:text-2xl" />
            <h2 className="text-base md:text-lg text-white/90 italic font-normal">
              Today's Bible Verse
            </h2>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl font-serif text-white leading-relaxed italic px-2">
            "{verse.text}"
          </p>
          <p className="text-sm md:text-base text-white/80 font-serif italic text-right pr-4">
            — {verse.reference}
          </p>
        </motion.div>

        {/* Visual Break */}
        <div className="h-px bg-white/20 w-full max-w-md mx-auto"></div>

        {/* Sample Prayer - No card, direct on background */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 px-4"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <FaPrayingHands className="text-[#D4A574] text-xl md:text-2xl" />
            <h2 className="text-base md:text-lg text-white/90 italic font-normal">
              Sample Prayer
            </h2>
          </div>
          <p className="text-lg md:text-xl lg:text-2xl font-serif text-white leading-relaxed italic px-2">
            {samplePrayer}
          </p>
        </motion.div>

        {/* CTA Button - Gold/Bronze Gradient */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4"
        >
          <button
            onClick={onContinue}
            className="w-full max-w-sm mx-auto px-8 py-4 md:py-5 text-base md:text-lg lg:text-xl text-white font-medium rounded-full bg-gradient-to-r from-[#d4a574] via-[#c4965f] to-[#b8864a] shadow-[0_4px_20px_rgba(212,165,116,0.4),0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_30px_rgba(212,165,116,0.5),0_0_0_1px_rgba(255,255,255,0.2)] transition-all duration-300 touch-manipulation"
          >
            Make this prayer personal
          </button>
        </motion.div>
      </div>
    </div>
  );
}

