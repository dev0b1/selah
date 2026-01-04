"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaPrayingHands } from "react-icons/fa";

interface NameInputScreenProps {
  onContinue: (name: string) => void;
}

export function NameInputScreen({ onContinue }: NameInputScreenProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selah_user_name', name.trim());
        // Clean up URL parameters
        window.history.replaceState({}, '', '/app');
      }
      onContinue(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1729] via-[#1a2942] to-[#2d3a5a]"></div>
      
      {/* Subtle Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-10 relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-[#D4A574]/20 flex items-center justify-center">
            <FaPrayingHands className="text-[#D4A574] text-3xl" />
          </div>
        </motion.div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-display text-white">
            What should we call you in prayer?
          </h2>
          <p className="text-sm text-white/50">
            Takes less than a minute
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white text-center text-xl placeholder-white/40 focus:border-[#D4A574]/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
              autoFocus
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!name.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 text-lg text-white font-medium rounded-full bg-gradient-to-r from-[#D4A574] via-[#c4965f] to-[#b8864a] shadow-[0_4px_25px_rgba(212,165,116,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            Continue
          </motion.button>
        </form>

        {/* Privacy note */}
        <p className="text-xs text-white/40">
          Your name is only used to personalize your prayers and stays private
        </p>
      </motion.div>
    </div>
  );
}

