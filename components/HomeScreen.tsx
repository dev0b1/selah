"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaMusic, FaLock, FaHeadphones, FaBook, FaBell, FaCopy, FaStop } from "react-icons/fa";
import { getTodaysVerse, type BibleVerse } from "@/lib/bible-verses";
import { isVoiceTestMode, getRandomBackgroundMusic, generateTestPrayer } from "@/lib/test-mode";

interface HomeScreenProps {
  userName: string;
  todaysPrayer?: {
    text: string;
    audioUrl?: string;
  };
  onPrayForSomething: () => void;
  onCreateWorshipSong: () => void;
  onListenToPrayer?: () => void;
  onSelectIntent?: (intent: string) => void;
  onNotificationsClick?: () => void;
  isPremium?: boolean;
}

type HeartIntent = 'peace' | 'guidance' | 'anxious' | 'grateful' | 'specific';

const HEART_INTENTS: { id: HeartIntent; label: string; need: string }[] = [
  { id: 'peace', label: 'I need peace', need: 'peace' },
  { id: 'guidance', label: 'I need guidance', need: 'guidance' },
  { id: 'anxious', label: 'I feel anxious', need: 'anxiety' },
  { id: 'grateful', label: 'I\'m grateful', need: 'gratitude' },
  { id: 'specific', label: 'Share something specific', need: 'custom' },
];

export function HomeScreen({
  userName,
  todaysPrayer,
  onPrayForSomething,
  onCreateWorshipSong,
  onListenToPrayer,
  onSelectIntent,
  onNotificationsClick,
  isPremium = false,
}: HomeScreenProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<HeartIntent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrayer, setGeneratedPrayer] = useState<{ text: string; audioUrl?: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const prayerSectionRef = useRef<HTMLDivElement | null>(null);
  const [isTestMode] = useState(() => isVoiceTestMode());
  const [testPrayerText, setTestPrayerText] = useState<string | null>(null);
  const [isPrayerExpanded, setIsPrayerExpanded] = useState(false);

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const res = await fetch('/api/verse/today');
        if (res.ok) {
          const data = await res.json();
          setVerse(data);
        } else {
          setVerse(getTodaysVerse());
        }
      } catch (error) {
        setVerse(getTodaysVerse());
      }
    };
    fetchVerse();
    
    // Generate test prayer on mount if in test mode
    if (isTestMode && !testPrayerText) {
      const newPrayer = generateTestPrayer(userName);
      setTestPrayerText(newPrayer);
    }
  }, [isTestMode, testPrayerText, userName]);

  // Use provided prayer, generated prayer, test prayer, or create default
  const fullPrayer = todaysPrayer?.text || generatedPrayer?.text || testPrayerText ||
    `Heavenly Father, I lift up ${userName} to You today. Fill them with Your peace and guide them through this day. Let them feel Your presence in every moment. In Jesus' name, Amen.`;
  const displayAudioUrl = todaysPrayer?.audioUrl || generatedPrayer?.audioUrl;
  
  // Truncate prayer for initial display (show only ~50-60 words for compact card)
  const getTruncatedPrayer = (text: string) => {
    const words = text.split(/\s+/);
    const maxWords = 55; // Approximately 3-4 lines of text
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };
  
  const displayPrayer = isPrayerExpanded ? fullPrayer : getTruncatedPrayer(fullPrayer);

  const handleIntentSelect = async (intent: HeartIntent) => {
    if (intent === 'specific') {
      onPrayForSomething();
      return;
    }

    setSelectedIntent(intent);
    setIsGenerating(true);

    // Smooth scroll to prayer section
    setTimeout(() => {
      prayerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const intentData = HEART_INTENTS.find(i => i.id === intent);
      const res = await fetch('/api/prayer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous',
          need: intentData?.need || 'peace',
          userName: userName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPrayer({
          text: data.prayerText,
          audioUrl: data.audioUrl,
        });
      }
    } catch (error) {
      console.error('Error generating prayer:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy prayer text to clipboard
  const handleCopyPrayer = async () => {
    try {
      await navigator.clipboard.writeText(fullPrayer);
      alert('Prayer copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy prayer:', err);
    }
  };

  // Test mode: Browser TTS with background music
  const handleTestModePlay = () => {
    if (isPlaying) {
      // Stop TTS and background music
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
        speechSynthesisRef.current = null;
      }
      backgroundAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Expand prayer card to show full text
      setIsPrayerExpanded(true);
      
      // Use the full prayer text for TTS (same as what's displayed)
      const prayerText = fullPrayer;
      
      // Load and play background music from public/bg folder
      const bgUrl = getRandomBackgroundMusic();
      console.log('[Test Mode] Loading background music:', bgUrl);
      
      if (!backgroundAudioRef.current) {
        const bgAudio = new Audio(bgUrl);
        bgAudio.loop = true;
        bgAudio.volume = 0.3; // 30% volume for background
        backgroundAudioRef.current = bgAudio;
        console.log('[Test Mode] Created new audio element');
      } else {
        backgroundAudioRef.current.src = bgUrl;
        console.log('[Test Mode] Updated audio source');
      }
      
      // Start background music first
      backgroundAudioRef.current.currentTime = 0;
      console.log('[Test Mode] Attempting to play background music...');
      const playPromise = backgroundAudioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('[Test Mode] ✅ Background music started successfully');
        }).catch(err => {
          console.error('[Test Mode] ❌ Background music play failed:', err);
          alert('Background music failed to play. Check browser console for details.');
        });
      }
      
      // Start browser TTS after a short delay to ensure background music is playing
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(prayerText);
          utterance.rate = 0.85; // Slower for prayer
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onend = () => {
            backgroundAudioRef.current?.pause();
            setIsPlaying(false);
            speechSynthesisRef.current = null;
          };
          
          utterance.onerror = () => {
            backgroundAudioRef.current?.pause();
            setIsPlaying(false);
            speechSynthesisRef.current = null;
          };
          
          speechSynthesisRef.current = utterance;
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      }, 200); // 200ms delay to ensure background music starts
    }
  };

  const handlePlayPause = async () => {
    // If we have server-generated audio URL, use it
    if (displayAudioUrl) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          backgroundAudioRef.current?.pause();
        } else {
          audioRef.current.play();
          // Start background music if available
          if (backgroundAudioRef.current) {
            backgroundAudioRef.current.currentTime = 0;
            backgroundAudioRef.current.play();
          }
        }
        setIsPlaying(!isPlaying);
      }
      return;
    }

    // Fallback: Browser TTS with background music (for logged in users without ElevenLabs)
    if (isPremium && !displayAudioUrl) {
      if (isPlaying) {
        // Stop TTS and background music
        if (speechSynthesisRef.current) {
          window.speechSynthesis.cancel();
          speechSynthesisRef.current = null;
        }
        backgroundAudioRef.current?.pause();
        setIsPlaying(false);
      } else {
        // Start browser TTS with background music
        const prayerText = displayPrayer;
        
        // Load and play background music
        const bgFile = getRandomBackgroundMusic();
        const bgUrl = `/bg/${bgFile}`;
        
        if (!backgroundAudioRef.current) {
          const bgAudio = new Audio(bgUrl);
          bgAudio.loop = true;
          bgAudio.volume = 0.3; // 30% volume for background
          backgroundAudioRef.current = bgAudio;
        }
        
        // Start background music
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.play().catch(err => {
          console.warn('Background music play failed:', err);
        });
        
        // Start browser TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(prayerText);
          utterance.rate = 0.9; // Slightly slower for prayer
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onend = () => {
            backgroundAudioRef.current?.pause();
            setIsPlaying(false);
            speechSynthesisRef.current = null;
          };
          
          utterance.onerror = () => {
            backgroundAudioRef.current?.pause();
            setIsPlaying(false);
            speechSynthesisRef.current = null;
          };
          
          speechSynthesisRef.current = utterance;
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        } else {
          // Fallback if speech synthesis not available
          alert('Text-to-speech is not available in your browser.');
          backgroundAudioRef.current?.pause();
        }
      }
    } else {
      // Not premium or no audio - show paywall
      if (onListenToPrayer) {
        onListenToPrayer();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
      backgroundAudioRef.current?.pause();
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 pb-32 pt-6 space-y-12">
      {/* Greeting Section - More breathing room */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 pt-2"
      >
        <h2 className="text-3xl md:text-4xl text-white font-light tracking-tight">
          {getGreeting()}, {userName}
        </h2>
        <p className="text-base text-white/60 font-light">Here's today's prayer</p>
      </motion.div>

      {/* SECTION 1: TODAY'S PERSONALIZED PRAYER - Focal Point */}
      <motion.div
        ref={prayerSectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-white/80 uppercase tracking-[0.15em] font-medium">
            Today's Personalized Prayer
          </span>
        </div>

        {/* Prayer Card - Glassmorphic, radiant focal point */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="relative bg-white/5 backdrop-blur-[40px] border border-[#D4A574]/30 rounded-3xl p-10 md:p-12 space-y-8 shadow-[0_12px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(212,165,116,0.2),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_0_80px_rgba(212,165,116,0.12),0_0_120px_rgba(212,165,116,0.08)] animate-float"
        >
          {/* Radial glow behind card */}
          <div className="absolute -inset-20 rounded-3xl bg-gradient-radial from-[#D4A574]/10 via-[#D4A574]/5 to-transparent pointer-events-none blur-3xl animate-pulse-glow" />
          
          {/* Inner warm glow layers */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#D4A574]/8 via-transparent to-transparent pointer-events-none animate-inner-glow" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#D4A574]/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A574]/60 to-transparent rounded-t-3xl" />
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-5 relative z-10">
              <div className="w-10 h-10 border-3 border-[#D4A574] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70 text-base font-light">Creating your prayer...</p>
            </div>
          ) : (
            <>
              {/* Prayer Text - Illuminated, elegant, centered */}
              <div className="relative z-10">
                <p className="text-xl md:text-2xl font-elegant text-white/98 leading-[2.1] text-center px-3">
                  {displayPrayer.split(/(\s+)/).map((segment, i) => {
                    const trimmed = segment.trim().toLowerCase();
                    const isName = trimmed === userName.toLowerCase();
                    const isAmen = trimmed === 'amen' || trimmed.includes('amen');
                    
                    if (isName || isAmen) {
                      return (
                        <span
                          key={i}
                          className="text-illuminated font-semibold"
                        >
                          {segment}
                        </span>
                      );
                    }
                    return <span key={i}>{segment}</span>;
                  })}
                </p>
                
                {/* Expand/Collapse button - only show if prayer is truncated */}
                {!isPrayerExpanded && fullPrayer.split(/\s+/).length > Math.floor(fullPrayer.split(/\s+/).length * 0.3) && (
                  <button
                    onClick={() => setIsPrayerExpanded(true)}
                    className="mt-4 flex items-center gap-2 mx-auto text-[#D4A574] hover:text-[#F5F5F5] transition-colors text-sm"
                  >
                    <span>Continue prayer</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {isPrayerExpanded && fullPrayer.split(/\s+/).length > Math.floor(fullPrayer.split(/\s+/).length * 0.3) && (
                  <button
                    onClick={() => setIsPrayerExpanded(false)}
                    className="mt-4 flex items-center gap-2 mx-auto text-[#D4A574] hover:text-[#F5F5F5] transition-colors text-sm"
                  >
                    <span>Close prayer</span>
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Listen/Stop/Copy Buttons */}
              {isTestMode && isPlaying ? (
                // During playback in test mode: Show Stop and Copy buttons side by side
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTestModePlay}
                    className="relative flex items-center gap-3 flex-1 p-5 rounded-2xl bg-red-500/20 backdrop-blur-md border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative w-12 h-12 rounded-full bg-red-500/40 flex items-center justify-center">
                      <FaStop className="text-white text-base relative z-10" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">Pause Prayer</p>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCopyPrayer}
                    className="relative flex items-center gap-3 flex-1 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-[#D4A574]/25 hover:bg-white/15 hover:border-[#D4A574]/40 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative w-12 h-12 rounded-full bg-[#D4A574]/30 flex items-center justify-center">
                      <FaCopy className="text-white text-base relative z-10" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">Copy Prayer</p>
                    </div>
                  </motion.button>
                </div>
              ) : (
                // Listen Button - Glassmorphic with glow and play icon
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    // Test mode: Use browser TTS with background music
                    if (isTestMode) {
                      handleTestModePlay();
                    } else if (isPremium && displayAudioUrl) {
                      handlePlayPause();
                    } else {
                      // Production mode: Open upgrade modal for non-premium users
                      if (onListenToPrayer) {
                        onListenToPrayer();
                      } else {
                        onCreateWorshipSong(); // Fallback to worship song paywall
                      }
                    }
                  }}
                  className="relative flex items-center gap-4 w-full p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-[#D4A574]/25 hover:bg-white/15 hover:border-[#D4A574]/40 transition-all duration-300 group overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isTestMode || (isPremium && displayAudioUrl) ? (
                    <>
                      {/* Play/Pause Button Icon */}
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-r from-[#D4A574] to-[#c4965f] flex items-center justify-center shadow-[0_0_25px_rgba(212,165,116,0.6)] group-hover:shadow-[0_0_35px_rgba(212,165,116,0.8)] transition-all duration-300 ring-2 ring-[#D4A574]/30">
                        <FaPlay className="text-white text-base ml-0.5 relative z-10" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">Pray with audio</p>
                        <p className="text-white/50 text-xs">With gentle background music</p>
                      </div>
                      <audio
                        ref={audioRef}
                        src={displayAudioUrl}
                        onEnded={() => {
                          setIsPlaying(false);
                          backgroundAudioRef.current?.pause();
                        }}
                        className="hidden"
                      />
                      {/* Background music for browser TTS fallback */}
                      <audio
                        ref={backgroundAudioRef}
                        className="hidden"
                        loop
                      />
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center relative">
                        <FaPlay className="text-white/60 text-lg ml-0.5" />
                        <FaLock className="absolute -top-1 -right-1 text-[10px] text-white/60 bg-[#1a2942] rounded-full p-1" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">Listen to this prayer</p>
                        <p className="text-white/50 text-xs">🔒 Premium feature</p>
                      </div>
                    </>
                  )}
                </motion.button>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* SECTION 2: What's on your heart right now? - More spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6 pt-4"
      >
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl text-white font-light tracking-tight">
            What's on your heart right now?
          </h2>
          <p className="text-base text-white/60 font-light">
            Take a moment — God is listening.
          </p>
        </div>

        {/* Intent Pills - Glassmorphic with warm glow */}
        <div className="flex flex-wrap justify-center gap-4 px-2">
          {HEART_INTENTS.map((intent) => (
            <motion.button
              key={intent.id}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleIntentSelect(intent.id)}
              className={`px-6 py-3.5 rounded-full text-base font-medium transition-all duration-300 backdrop-blur-sm ${
                selectedIntent === intent.id
                  ? 'bg-gradient-to-r from-[#D4A574] to-[#c4965f] text-white shadow-[0_0_40px_rgba(212,165,116,0.6),0_6px_25px_rgba(212,165,116,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] border-2 border-[#D4A574]/60 animate-pulse-glow'
                  : 'bg-white/8 text-white/90 border-2 border-white/25 hover:bg-white/12 hover:border-[#D4A574]/40 hover:shadow-[0_6px_20px_rgba(212,165,116,0.2),0_0_30px_rgba(212,165,116,0.1)]'
              }`}
            >
              {intent.label}
            </motion.button>
          ))}
        </div>
        
        {/* Helper text to clarify what happens */}
        <p className="text-sm text-white/45 text-center mt-4 font-light leading-relaxed">
          Click any option to get a personalized prayer, or "Share something specific" for a custom prayer
        </p>
      </motion.div>

      {/* SECTION 3: Actions - Premium button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6 pt-4"
      >
        {/* Turn into a worship song - Radiant gold button */}
        <motion.button
          onClick={onCreateWorshipSong}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="relative w-full flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-[#D4A574] via-[#c4965f] to-[#b8864a] shadow-[0_8px_40px_rgba(212,165,116,0.6),0_0_0_1px_rgba(212,165,116,0.25),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_0_60px_rgba(255,255,255,0.1),0_0_100px_rgba(212,165,116,0.4)] hover:shadow-[0_12px_50px_rgba(212,165,116,0.7),0_0_0_1px_rgba(212,165,116,0.35),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_0_80px_rgba(255,255,255,0.15),0_0_140px_rgba(212,165,116,0.5)] transition-all duration-300 overflow-hidden group animate-pulse-glow"
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50" />
          <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <FaMusic className="text-white text-xl relative z-10" />
          </div>
          <div className="flex-1 text-left relative z-10">
            <p className="text-white font-semibold text-lg">Turn into a worship song</p>
            <p className="text-white/95 text-sm font-light">A gentle song with your name</p>
          </div>
        </motion.button>

        {/* Encouragement message - Elegant */}
        <p className="text-center text-white/55 text-base italic font-light leading-relaxed pt-2">
          You are not alone. God walks with you today.
        </p>
      </motion.div>

      {/* SECTION 4: TODAY'S BIBLE VERSE (AT BOTTOM) - Premium card */}
      {verse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-8 space-y-5"
        >
          <div className="flex items-center justify-center gap-2.5">
            <FaBook className="text-[#D4A574] text-sm" />
            <span className="text-xs text-white/60 uppercase tracking-[0.15em] font-medium">
              Today's Bible Verse
            </span>
          </div>
          {/* Verse Card - Glassmorphic with inner glow */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative bg-white/5 backdrop-blur-[40px] border border-[#D4A574]/25 rounded-3xl p-8 md:p-10 space-y-5 shadow-[0_8px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(212,165,116,0.15),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_60px_rgba(212,165,116,0.08)] animate-float"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#D4A574]/8 via-transparent to-transparent pointer-events-none animate-inner-glow" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A574]/50 to-transparent rounded-t-3xl" />
            <div className="text-center space-y-4 relative z-10">
              <p className="text-lg md:text-xl text-white/95 font-elegant leading-[2] px-2">
                "{verse.text}"
              </p>
              <p className="text-sm text-white/55 font-light italic tracking-wide">— {verse.reference}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

