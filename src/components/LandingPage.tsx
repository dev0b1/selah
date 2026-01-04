"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBook, FaPrayingHands } from "react-icons/fa";
import { getTodaysVerse } from "@/lib/bible-verses";
import { Moon } from "@/components/Moon";
import { StarField } from "@/components/StarField";

interface LandingPageProps {
  onContinue: () => void;
}

export function LandingPage({ onContinue }: LandingPageProps) {
  const verse = getTodaysVerse();
  const samplePrayer = "Lord, fill me with Your peace today. Amen.";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleContinue = () => {
    // Navigate to /app without URL parameters
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/app');
    }
    onContinue();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden gradient-celestial">
      {/* Star field background */}
      <StarField />
      
      {/* Nebula effects */}
      <div className="absolute inset-0 gradient-nebula opacity-50 pointer-events-none" />

      {/* Moon is rendered globally in the app layout */}

      <div className="max-w-xl w-full text-center space-y-12 md:space-y-16 relative z-10 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-display text-gradient-golden">
            Selah
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 font-body tracking-wide">
            Pause. Breathe. Pray.
          </p>
          <p className="text-base md:text-lg text-muted-foreground font-body">
            A quiet, personal moment with God
          </p>
        </motion.div>

        {/* Sample Prayer Preview */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-6 px-2"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaPrayingHands className="text-primary text-lg" />
            <span className="text-sm text-muted-foreground uppercase tracking-widest">
              Today's Prayer
            </span>
          </div>
          
          <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6 md:p-8">
            <p className="text-lg md:text-xl font-display text-foreground/90 leading-relaxed italic">
              "{samplePrayer}"
            </p>
          </div>

          <p className="text-sm text-muted-foreground italic">
            This prayer can be personalized just for you
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="space-y-4"
        >
          <button
            onClick={handleContinue}
            className="w-full max-w-sm mx-auto px-8 py-4 md:py-5 text-base md:text-lg font-semibold rounded-full shadow-lg hover:brightness-95 hover:scale-[1.02] transition-all duration-300 bg-selah-wood text-selah-wood-dark"
            aria-label="Make this prayer personalized"
            style={{ backgroundColor: '#E6D3B3', color: '#352714' }}
          >
            Make this prayer personalized
          </button>
          <p className="text-xs text-muted-foreground">
            Takes less than a minute
          </p>
        </motion.div>

        {/* Bible Verse - Subtle at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="pt-8 border-t border-border/30"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <FaBook className="text-primary/70 text-sm" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Today's Verse
            </span>
          </div>
          <p className="text-sm md:text-base text-muted-foreground font-display italic leading-relaxed">
            "{verse.text}"
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            — {verse.reference}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
