"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaShare, FaMusic } from "react-icons/fa";

interface PrayerPlayerScreenProps {
  prayerText: string;
  audioUrl?: string;
  prayerIntent?: string;
  prayerId?: string;
  userName: string;
  isPremium?: boolean;
  onNewPrayer?: () => void;
  onShare?: () => void;
  onCreateWorshipSong?: () => void;
}

export function PrayerPlayerScreen({
  prayerText,
  audioUrl,
  prayerIntent,
  userName,
  isPremium = false,
  onNewPrayer,
  onShare,
  onCreateWorshipSong,
}: PrayerPlayerScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!isPremium) {
      onCreateWorshipSong?.(); // Show paywall
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const intentLabels: Record<string, string> = {
    peace: "Prayer for Peace",
    strength: "Prayer for Strength",
    guidance: "Prayer for Guidance",
    healing: "Prayer for Healing",
    gratitude: "Prayer of Gratitude",
    comfort: "Prayer for Comfort",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-6"
      >
        {/* Title */}
        <h2 className="text-2xl font-bold text-[#D4A574] text-center">
          {prayerIntent ? intentLabels[prayerIntent] || "Your Prayer" : "Your Prayer"}
        </h2>

        {/* Prayer Text with Animated Background */}
        <div className="card relative overflow-hidden">
          {/* Breathing background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/5 to-transparent animate-breathe"></div>
          
          <div className="relative p-6 md:p-8">
            <p className="text-base md:text-lg text-[#F5F5F5] leading-relaxed whitespace-pre-line font-serif">
              {prayerText}
            </p>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && isPremium && (
          <div className="flex items-center gap-4 card">
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D4A574] to-[#B8935F] active:scale-95 text-[#0A1628] font-bold flex items-center justify-center text-2xl transition-all touch-manipulation flex-shrink-0"
              aria-label={isPlaying ? "Pause prayer" : "Play prayer"}
            >
              {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <audio
                ref={(el) => {
                  if (el) {
                    audioRef.current = el;
                    el.onended = () => setIsPlaying(false);
                  }
                }}
                src={audioUrl}
                className="hidden"
              />
              <p className="text-[#F5F5F5] font-medium">Play Audio</p>
              <p className="text-[#8B9DC3] text-sm">Listen to your prayer</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onNewPrayer}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 min-h-[48px] touch-manipulation"
          >
            <span>🔁</span>
            <span>New Prayer</span>
          </button>
          
          <button
            onClick={onShare}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 min-h-[48px] touch-manipulation"
          >
            <FaShare />
            <span>Share</span>
          </button>
        </div>

        {/* Create Worship Song CTA */}
        <button
          onClick={onCreateWorshipSong}
          className="w-full card p-4 bg-[#1a2942]/60 border-2 border-[#8B9DC3]/30 hover:border-[#D4A574]/50 transition-all touch-manipulation text-left"
        >
          <div className="flex items-center gap-3">
            <FaMusic className="text-[#D4A574] text-xl" />
            <div className="flex-1">
              <p className="text-[#F5F5F5] font-bold">
                🎵 Create Worship Song
              </p>
              <p className="text-[#8B9DC3] text-sm">
                {isPremium ? "Generate your personalized song" : "Premium feature - Start free trial"}
              </p>
            </div>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

