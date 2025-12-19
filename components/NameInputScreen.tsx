"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

interface NameInputScreenProps {
  onContinue: (name: string) => void;
}

export function NameInputScreen({ onContinue }: NameInputScreenProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Save name to localStorage for now (delayed auth)
      if (typeof window !== 'undefined') {
        localStorage.setItem('selah_user_name', name.trim());
      }
      onContinue(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#0A1628] to-[#1a2942]"
    >
      <div className="max-w-md w-full">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card space-y-6"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-[#F5F5F5]">
              Welcome to Selah
            </h2>
            <p className="text-xl text-[#8B9DC3]">
              What should we call you in prayer?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-4 bg-[#1a2942] border-2 border-[#8B9DC3]/30 rounded-lg text-[#F5F5F5] placeholder-[#8B9DC3] focus:border-[#D4A574] focus:outline-none text-lg min-h-[52px]"
                autoFocus
                required
                minLength={2}
                maxLength={50}
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation font-bold"
            >
              <span>Continue to App</span>
              <FaArrowRight />
            </button>
          </form>

          <p className="text-sm text-[#8B9DC3] text-center">
            Your name stays private and is only used to personalize prayers
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

