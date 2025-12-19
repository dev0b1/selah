"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaMusic, FaLock, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getTodaysVerse, type BibleVerse } from "@/lib/bible-verses";

interface HomeScreenProps {
  userName: string;
  todaysPrayer?: {
    text: string;
    audioUrl?: string;
  };
  onPrayForSomething: () => void;
  onCreateWorshipSong: () => void;
  isPremium?: boolean;
}

export function HomeScreen({
  userName,
  todaysPrayer,
  onPrayForSomething,
  onCreateWorshipSong,
  isPremium = false,
}: HomeScreenProps) {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [defaultPrayer, setDefaultPrayer] = useState<string | null>(null);
  const [isPrayerExpanded, setIsPrayerExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch today's verse
    const fetchVerse = async () => {
      try {
        const res = await fetch('/api/verse/today');
        if (res.ok) {
          const data = await res.json();
          setVerse(data);
        } else {
          // Fallback to client-side
          setVerse(getTodaysVerse());
        }
      } catch (error) {
        // Fallback to client-side
        setVerse(getTodaysVerse());
      }
    };

    fetchVerse();

    // Auto-generate default daily prayer on load
    const prayer = `Heavenly Father, I lift up ${userName} to You today. Fill them with Your peace and guide them through this day. Let them feel Your presence in every moment. Amen.`;
    setDefaultPrayer(prayer);
  }, [userName]);

  // Use provided prayer or default
  const displayPrayer = todaysPrayer?.text || defaultPrayer || `Heavenly Father, I lift up ${userName} to You today. Fill them with Your peace and guide them through this day. Let them feel Your presence in every moment. Amen.`;
  const displayAudioUrl = todaysPrayer?.audioUrl;

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Get preview of prayer (first 2-3 lines, approximately 150-200 chars)
  const getPrayerPreview = (text: string): string => {
    // Split by sentences and take first 2-3 sentences or ~150 characters
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let preview = '';
    
    // Take first 2-3 sentences
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i].trim();
      if (preview.length + sentence.length < 180) {
        preview += (preview ? ' ' : '') + sentence + '.';
      } else {
        break;
      }
    }
    
    // Fallback to character limit
    if (!preview) {
      preview = text.length > 180 ? text.substring(0, 180).trim() + '...' : text;
    }
    
    return preview;
  };

  const prayerPreview = getPrayerPreview(displayPrayer);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 pb-24 relative">
      {/* Today's Bible Verse - Sacred and calm */}
      {verse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-5 py-6"
        >
          <p className="text-xl md:text-2xl font-serif text-[#F5F5F5] leading-relaxed italic">
            "{verse.text}"
          </p>
          <p className="text-sm text-[#8B9DC3]/70 font-serif">— {verse.reference}</p>
        </motion.div>
      )}

      {/* Today's Prayer - Collapsed preview with gradient fade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card space-y-5"
      >
        {/* Prayer Text - Collapsible with gradient fade */}
        <div 
          className="relative bg-[#1a2942]/60 border border-[#8B9DC3]/15 rounded-lg p-6 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsPrayerExpanded(!isPrayerExpanded)}
        >
          <AnimatePresence mode="wait">
            {isPrayerExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-base md:text-lg text-[#F5F5F5] leading-[1.8] whitespace-pre-line"
              >
                {displayPrayer}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <p className="text-base md:text-lg text-[#F5F5F5] leading-[1.8] pb-4">
                  {prayerPreview}
                </p>
                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#1a2942]/60 via-[#1a2942]/30 to-transparent pointer-events-none rounded-b-lg" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Subtle expand indicator - only show when collapsed */}
          {!isPrayerExpanded && (
            <div className="flex items-center justify-center mt-4 pt-2 text-[#8B9DC3]/60">
              <FaChevronDown className="text-xs animate-pulse" />
            </div>
          )}
        </div>

        {/* Audio Button - Less paywall energy */}
        <button
          onClick={() => {
            if (isPremium && displayAudioUrl) {
              handlePlayPause();
            } else {
              onCreateWorshipSong();
            }
          }}
          className="flex items-center gap-4 w-full text-left hover:opacity-80 transition-opacity touch-manipulation"
        >
          {isPremium && displayAudioUrl ? (
            <>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#D4A574] to-[#B8935F] flex items-center justify-center text-[#0A1628] flex-shrink-0">
                {isPlaying ? (
                  <FaPause className="text-base sm:text-lg ml-0.5" />
                ) : (
                  <FaPlay className="text-base sm:text-lg ml-0.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <audio
                  ref={audioRef}
                  src={displayAudioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <p className="text-[#F5F5F5] font-medium text-sm sm:text-base">
                  Listen to today's prayer
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#8B9DC3]/40 bg-[#1a2942]/40 flex items-center justify-center text-[#8B9DC3] flex-shrink-0 relative">
                <FaPlay className="text-base sm:text-lg ml-0.5" />
                <FaLock className="absolute -top-0.5 -right-0.5 text-[9px] bg-[#1a2942] rounded-full p-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F5F5F5] font-medium text-sm sm:text-base">
                  Listen to today's prayer
                </p>
                <p className="text-[#8B9DC3] text-xs mt-0.5">
                  Included with Premium
                </p>
              </div>
            </>
          )}
        </button>

        {/* Worship Song Upsell - Subtle and special */}
        <div className="pt-4 border-t border-[#8B9DC3]/10">
          <button
            onClick={() => onCreateWorshipSong()}
            className="w-full text-left p-4 bg-[#1a2942]/40 border border-[#8B9DC3]/20 rounded-lg hover:bg-[#1a2942]/60 hover:border-[#8B9DC3]/30 transition-all touch-manipulation"
          >
            <div className="flex items-start gap-3">
              <FaMusic className="text-[#D4A574]/80 text-lg mt-0.5" />
              <div className="flex-1">
                <p className="text-[#F5F5F5] font-medium text-sm sm:text-base">
                  Turn this prayer into a worship song
                </p>
                <p className="text-[#8B9DC3] text-xs mt-1">
                  A gentle song with your name, inspired by today's prayer
                </p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Pray for Something Specific Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onPrayForSomething}
        className="btn-primary w-full py-4 text-lg min-h-[52px] touch-manipulation font-bold"
      >
        Pray for Something Specific
      </motion.button>
    </div>
  );
}

