'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface LyricsOverlayProps {
  lyrics?: string | null;
  duration?: number;
  isPlaying: boolean;
  currentTime?: number;
}

export function LyricsOverlay({ lyrics, duration = 60, isPlaying, currentTime = 0 }: LyricsOverlayProps) {

  // Guard against undefined/null lyrics coming from the server
  const safeLyrics = typeof lyrics === 'string' ? lyrics : '';
  const lyricsLines = safeLyrics.split('\n').filter(line => line.trim() !== '');

  // We'll compute the active line based on currentTime to keep lyrics in sync
  // with the audio source. currentTime is passed in from the player.
  const lineHeight = 80; // pixels per line as used in the previous impl

  // Reset or react to duration/lyrics changes if needed in the future.
  useEffect(() => {
    // noop placeholder to ensure component updates when duration/lyrics change
  }, [duration, lyrics]);

  // compute active line from currentTime
  const totalLines = lyricsLines.length || 1;
  const secondsPerLine = (duration || 1) / totalLines;
  const activeIndex = Math.min(totalLines - 1, Math.max(0, Math.floor((currentTime || 0) / secondsPerLine)));
  const scrollPositionPx = activeIndex * lineHeight;

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-heartbreak-50 to-white border border-heartbreak-200">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white opacity-80"></div>
      </div>

      <div className="relative px-8 py-12">
        <div className="space-y-6" style={{ transform: `translateY(-${scrollPositionPx}px)`, transition: 'transform 400ms ease-out' }}>
          {lyricsLines.map((line, index) => {
            const isActive = index === activeIndex;
            return (
              <p
                key={index}
                className={`text-xl md:text-3xl font-bold text-center leading-relaxed transition-all duration-300 ${isActive ? 'text-gray-900 scale-105' : 'text-gray-700'}`} 
                style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <p className="text-2xl md:text-3xl font-bold text-gray-500">▶️ Press play to see lyrics</p>
          </motion.div>
        </div>
      )}

    </div>
  );
}
