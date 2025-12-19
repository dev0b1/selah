"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaSpinner, FaHeart } from "react-icons/fa";

export type PrayerIntentType = 
  | 'peace' 
  | 'strength' 
  | 'guidance' 
  | 'healing' 
  | 'gratitude' 
  | 'comfort';

interface PrayerIntentOption {
  id: PrayerIntentType;
  label: string;
  emoji: string;
}

const PRAYER_INTENTS: PrayerIntentOption[] = [
  { id: 'peace', label: 'Peace', emoji: '🕊️' },
  { id: 'strength', label: 'Strength', emoji: '💪' },
  { id: 'guidance', label: 'Guidance', emoji: '🧭' },
  { id: 'healing', label: 'Healing', emoji: '💚' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { id: 'comfort', label: 'Comfort', emoji: '🤗' },
];

interface PrayerIntentScreenProps {
  onGenerate: (intent: PrayerIntentType, customMessage?: string) => void;
  isGenerating?: boolean;
}

export function PrayerIntentScreen({ onGenerate, isGenerating = false }: PrayerIntentScreenProps) {
  const [selectedIntent, setSelectedIntent] = useState<PrayerIntentType | null>(null);
  const [customMessage, setCustomMessage] = useState("");

  const handleGenerate = () => {
    if (!selectedIntent) return;
    onGenerate(selectedIntent, customMessage.trim() || undefined);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[#F5F5F5]">
          What do you need prayer for?
        </h2>
        <p className="text-[#8B9DC3]">
          Select a category or share something specific
        </p>
      </motion.div>

      {/* Intent Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRAYER_INTENTS.map((intent) => (
            <motion.button
              key={intent.id}
              onClick={() => setSelectedIntent(intent.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300
                touch-manipulation min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center
                ${selectedIntent === intent.id
                  ? 'bg-gradient-to-br from-[#D4A574] to-[#B8935F] border-[#F5F5F5] shadow-lg'
                  : 'bg-[#1a2942]/60 border-[#8B9DC3]/30 active:border-[#8B9DC3]/50 active:bg-[#1a2942]/80'
                }
              `}
              aria-label={`Select ${intent.label}`}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-2">{intent.emoji}</div>
              <div className={`font-bold text-xs sm:text-sm text-center leading-tight ${
                selectedIntent === intent.id ? 'text-[#0A1628]' : 'text-[#F5F5F5]'
              }`}>
                {intent.label}
              </div>
              {selectedIntent === intent.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                >
                  <span className="text-green-500 text-lg">✓</span>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Optional Custom Message - Always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <label className="block text-[#F5F5F5] font-bold text-lg">
          Or describe what's on your heart... (optional)
        </label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Share what's on your heart..."
          className="w-full h-24 sm:h-28 bg-[#1a2942] border-2 border-[#8B9DC3]/30 rounded-lg px-4 py-3 text-[#F5F5F5] placeholder-[#8B9DC3] focus:border-[#D4A574] focus:outline-none resize-none text-base"
          maxLength={120}
        />
        <div className="text-right text-[#8B9DC3] text-sm">
          {customMessage.length}/120
        </div>
      </motion.div>

      {/* Generate Button - Always visible */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleGenerate}
        disabled={isGenerating || !selectedIntent}
        className="btn-primary w-full py-5 text-lg sm:text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-h-[56px] touch-manipulation font-bold"
      >
        {isGenerating ? (
          <>
            <FaSpinner className="animate-spin text-xl" />
            <span>Generating Prayer...</span>
          </>
        ) : (
          <>
            <FaHeart />
            <span>Generate Prayer</span>
          </>
        )}
      </motion.button>
    </div>
  );
}

