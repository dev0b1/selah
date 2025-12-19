"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaShare, FaDownload, FaMusic, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { SongModeUpsell } from "./SongModeUpsell";

interface PrayerPlaybackProps {
  prayerText: string;
  audioUrl?: string;
  userName: string;
  need: string;
  onShare: () => void;
  onUpgradeToSong?: () => void;
  isPremium?: boolean;
  showSongModeUpsell?: boolean;
  onSongModeUpsellClose?: () => void;
}

export function PrayerPlayback({
  prayerText,
  audioUrl,
  userName,
  need,
  onShare,
  onUpgradeToSong,
  isPremium = false,
  showSongModeUpsell = false,
  onSongModeUpsellClose,
}: PrayerPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasBackgroundMusic, setHasBackgroundMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleToggleMusic = () => {
    setHasBackgroundMusic(!hasBackgroundMusic);
    // TODO: Toggle background music track
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card space-y-6"
      >
        {/* Prayer Text */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white">
            Your Personalized Prayer
          </h2>
          
          <div className="bg-white/5 border-2 border-white/10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
            <p className="text-lg md:text-xl text-white leading-relaxed whitespace-pre-line">
              {prayerText}
            </p>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handlePlayPause}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 active:scale-95 hover:from-amber-400 hover:to-yellow-400 text-black font-bold flex items-center justify-center text-xl sm:text-2xl transition-all touch-manipulation flex-shrink-0"
                aria-label={isPlaying ? "Pause prayer" : "Play prayer"}
              >
                {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <p className="text-white font-medium text-sm sm:text-base truncate">
                  Tap to listen to your prayer
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Personalized with your name
                </p>
              </div>

              <button
                onClick={handleToggleMusic}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg border-2 transition-all touch-manipulation flex-shrink-0 ${
                  hasBackgroundMusic
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-white/5 border-white/20 text-gray-400 active:border-white/40'
                }`}
                aria-label={hasBackgroundMusic ? "Turn off background music" : "Add background music"}
              >
                {hasBackgroundMusic ? <FaVolumeUp className="text-lg sm:text-xl" /> : <FaVolumeMute className="text-lg sm:text-xl" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onShare}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] text-base sm:text-base active:scale-95 touch-manipulation"
              >
                <FaShare />
                <span>Share Prayer</span>
              </button>
              
              {audioUrl && (
                <a
                  href={audioUrl}
                  download={`prayer-${userName}-${Date.now()}.mp3`}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 px-4 py-3.5 min-h-[48px] text-base sm:text-base active:scale-95 touch-manipulation"
                >
                  <FaDownload />
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Song Mode Upsell - Only show after first prayer is generated */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/30 rounded-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <FaMusic className="text-amber-400 text-3xl" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">
                  Want a Personalized Song?
                </h3>
                <p className="text-gray-300 text-sm">
                  Unlock Song Mode and get worship songs with your name
                </p>
              </div>
            </div>
            <button
              onClick={onUpgradeToSong}
              className="btn-primary w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-black font-bold py-3.5 min-h-[48px] text-base sm:text-base touch-manipulation"
            >
              Try 3-Day Free Trial
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Song Mode Upsell Modal */}
      {showSongModeUpsell && (
        <SongModeUpsell
          isOpen={showSongModeUpsell}
          onClose={() => onSongModeUpsellClose?.()}
          onUpgrade={() => onUpgradeToSong?.()}
          userName={userName}
        />
      )}
    </>
  );
}

