"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScreenHeader } from "./ScreenHeader";
import { FaLock, FaCrown, FaMusic } from "react-icons/fa";
import { SongModeUpsell } from "./SongModeUpsell";

interface SongModeScreenProps {
  userId: string;
  userName?: string;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export function SongModeScreen({
  userId,
  userName,
  isPremium = false,
  onUpgrade,
}: SongModeScreenProps) {
  const [showUpsell, setShowUpsell] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Mood options - note: adding 'comfort' as mentioned in requirements
  const moods = [
    { id: 'peace', label: 'Peace', emoji: '🕊️' },
    { id: 'strength', label: 'Strength', emoji: '💪' },
    { id: 'hope', label: 'Hope', emoji: '✨' },
    { id: 'trust', label: 'Trust', emoji: '🤲' },
    { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
    { id: 'comfort', label: 'Comfort', emoji: '🕯️' },
  ];

  const getMoodLabel = (moodId: string | null): string => {
    if (!moodId) return '';
    const mood = moods.find(m => m.id === moodId);
    return mood?.label || moodId;
  };

  // For free users, show mood selection UI instead of immediate paywall
  if (!isPremium) {
    return (
      <>
        <div className="min-h-[calc(100vh-8rem)] p-4 sm:p-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 relative"
            >
              {/* Subtle musical staff decoration */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 opacity-20">
                <div className="flex gap-8 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-0.5 h-full bg-[#D4A574] rounded-full" />
                  ))}
                </div>
              </div>
              <div className="text-5xl sm:text-6xl mb-2">🎵</div>
              <h2 className="text-2xl sm:text-3xl font-light text-[#F5F5F5] tracking-tight">
                Create Worship Song
              </h2>
              <p className="text-base sm:text-lg text-[#8B9DC3] font-light">
                Choose the mood for your song:
              </p>
            </motion.div>

            {/* Mood Selection - Premium styling */}
            <div className="card space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300
                      touch-manipulation min-h-[110px] sm:min-h-[120px] flex flex-col items-center justify-center
                      ${selectedMood === mood.id
                        ? 'bg-gradient-to-br from-[#D4A574] to-[#B8935F] border-[#D4A574]/60 shadow-[0_8px_30px_rgba(212,165,116,0.4),0_0_0_2px_rgba(212,165,116,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]'
                        : 'bg-white/6 backdrop-blur-sm border-white/20 hover:border-[#D4A574]/40 hover:bg-white/10 hover:shadow-[0_4px_20px_rgba(212,165,116,0.15)]'
                      }
                    `}
                  >
                    <div className="text-4xl sm:text-5xl mb-3">{mood.emoji}</div>
                    <div className={`font-semibold text-sm sm:text-base text-center ${
                      selectedMood === mood.id ? 'text-[#0A1628]' : 'text-[#F5F5F5]'
                    }`}>
                      {mood.label}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Generate Button - triggers paywall for free users */}
              <motion.button
                onClick={() => {
                  if (selectedMood) {
                    setShowUpsell(true);
                  }
                }}
                disabled={!selectedMood}
                className={`
                  btn-primary w-full py-4 text-base sm:text-lg min-h-[52px] touch-manipulation font-bold
                  ${!selectedMood ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {!selectedMood ? (
                  'Select a mood first'
                ) : (
                  <>
                    <FaMusic className="mr-2" />
                    <span>Generate My Worship Song</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        <SongModeUpsell
          isOpen={showUpsell}
          onClose={() => setShowUpsell(false)}
          onUpgrade={() => {
            setShowUpsell(false);
            onUpgrade?.();
          }}
          userName={userName}
          selectedMood={selectedMood ? getMoodLabel(selectedMood) : undefined}
        />
      </>
    );
  }

  // Premium users see the full generation interface (actually generates songs)
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSong = async () => {
    if (!selectedMood || !userId || !userName) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/worship/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          mood: selectedMood,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // Paywall required - shouldn't happen for premium users, but handle gracefully
          setShowUpsell(true);
        } else {
          alert(data.error || 'Failed to generate song. Please try again.');
        }
        return;
      }

      if (data.success) {
        // Song generated successfully
        if (data.status === 'generating') {
          // Song is still generating (Suno async)
          alert('Your worship song is being generated! Check back in a few moments.');
        } else {
          // Song is ready
          alert('Your worship song is ready! Check your history to listen.');
        }
        // Reset selection
        setSelectedMood(null);
      }
    } catch (error) {
      console.error('Error generating song:', error);
      alert('Failed to generate song. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-8rem)] p-4 sm:p-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="text-4xl sm:text-5xl">🎵</div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
              Create Worship Song
            </h2>
            <p className="text-sm sm:text-base text-[#8B9DC3]">
              Choose the mood for your song:
            </p>
          </motion.div>

          {/* Mood Selection */}
          <div className="card space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {moods.map((mood) => (
                <motion.button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating}
                  className={`
                    relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-300
                    touch-manipulation min-h-[90px] sm:min-h-[100px] flex flex-col items-center justify-center
                    ${selectedMood === mood.id
                      ? 'bg-gradient-to-br from-[#D4A574] to-[#B8935F] border-[#F5F5F5] shadow-lg'
                      : 'bg-[#1a2942]/60 border-[#8B9DC3]/30 hover:border-[#8B9DC3]/50 hover:bg-[#1a2942]/80'
                    }
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="text-2xl sm:text-3xl mb-2">{mood.emoji}</div>
                  <div className={`font-bold text-xs sm:text-sm text-center ${
                    selectedMood === mood.id ? 'text-[#0A1628]' : 'text-[#F5F5F5]'
                  }`}>
                    {mood.label}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={handleGenerateSong}
              disabled={!selectedMood || isGenerating}
              className={`
                btn-primary w-full py-4 text-base sm:text-lg min-h-[52px] touch-manipulation font-bold
                ${!selectedMood || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isGenerating ? (
                <>
                  <FaMusic className="mr-2 animate-pulse" />
                  <span>Generating Your Song...</span>
                </>
              ) : !selectedMood ? (
                'Select a mood first'
              ) : (
                <>
                  <FaMusic className="mr-2" />
                  <span>Generate Worship Song</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

