"use client";

import { motion } from "framer-motion";
import { FaBook, FaPrayingHands } from "react-icons/fa";
import { getTodaysVerse } from "@/lib/bible-verses";

interface LandingPageProps {
  onContinue: () => void;
}

export function LandingPage({ onContinue }: LandingPageProps) {
  const verse = getTodaysVerse();
  const samplePrayer = "Lord, fill me with Your peace today. Quiet my anxious thoughts and help me trust in Your perfect plan. Guide my steps and let me feel Your presence in every moment. Amen.";

  const handleContinue = () => {
    // Navigate to /app without URL parameters
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/app');
    }
    onContinue();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Night Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1729] via-[#1a2942] to-[#2d3a5a]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a2942]/60 to-[#4a3a5f]/30"></div>
      </div>

      {/* Subtle Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Crescent Moon */}
      <motion.div 
        className="absolute top-12 right-8 md:top-16 md:right-16 w-14 h-14 md:w-16 md:h-16"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
        transition={{ 
          scale: { duration: 1 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="w-full h-full rounded-full bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)]"></div>
        <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-full bg-[#0f1729]"></div>
      </motion.div>

      <div className="max-w-xl w-full text-center space-y-12 md:space-y-16 relative z-10 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-script text-white">
            Selah
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide">
            Pause. Breathe. Pray.
          </p>
          <p className="text-base md:text-lg text-white/60 font-light">
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
            <FaPrayingHands className="text-[#D4A574] text-lg" />
            <span className="text-sm text-white/70 uppercase tracking-widest">
              Today's Prayer
            </span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
            <p className="text-lg md:text-xl font-serif text-white/90 leading-relaxed italic">
              "{samplePrayer}"
            </p>
          </div>

          <p className="text-sm text-white/50 italic">
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
            className="w-full max-w-sm mx-auto px-8 py-4 md:py-5 text-base md:text-lg text-white font-medium rounded-full bg-gradient-to-r from-[#D4A574] via-[#c4965f] to-[#b8864a] shadow-[0_4px_25px_rgba(212,165,116,0.4)] hover:shadow-[0_6px_35px_rgba(212,165,116,0.5)] hover:scale-[1.02] transition-all duration-300"
          >
            Make this prayer personal
          </button>
          <p className="text-xs text-white/40">
            Takes less than a minute
          </p>
        </motion.div>

        {/* Bible Verse - Subtle at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="pt-8 border-t border-white/10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <FaBook className="text-[#D4A574]/70 text-sm" />
            <span className="text-xs text-white/50 uppercase tracking-widest">
              Today's Verse
            </span>
          </div>
          <p className="text-sm md:text-base text-white/60 font-serif italic leading-relaxed">
            "{verse.text}"
          </p>
          <p className="text-xs text-white/40 mt-2">
            — {verse.reference}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

