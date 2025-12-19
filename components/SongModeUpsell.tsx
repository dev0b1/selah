"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaMusic, FaStar } from "react-icons/fa";
import { openDodoCheckout } from "@/lib/dodo-checkout";

interface SongModeUpsellProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  userName?: string;
  selectedMood?: string;
}

export function SongModeUpsell({ isOpen, onClose, onUpgrade, userName, selectedMood }: SongModeUpsellProps) {
  const handleStartTrial = async () => {
    try {
      await openDodoCheckout({ planType: 'monthly' });
      onUpgrade();
    } catch (error) {
      console.error('Failed to open checkout:', error);
      // Fallback to pricing page
      if (typeof window !== 'undefined') {
        window.location.href = '/pricing';
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="card max-w-lg w-full bg-black/95 border-2 border-amber-500/50 relative my-auto max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-gray-400 active:text-white transition-colors touch-manipulation rounded-full active:bg-white/10"
                aria-label="Close modal"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>

              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-4 pt-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-6xl mb-2"
                  >
                    🎵
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Unlock Song Mode
                  </h2>
                  <p className="text-xl text-gray-300">
                    Want a personalized worship song{userName ? `, ${userName}` : ''}?
                  </p>
                  {selectedMood && (
                    <div className="pt-2">
                      <p className="text-lg font-semibold text-amber-400">
                        You've chosen: {selectedMood}
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <FaMusic className="text-amber-400 text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Personalized Worship Songs
                      </h3>
                      <p className="text-gray-400">
                        30-60 second motivational songs with your name included
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <FaStar className="text-amber-400 text-2xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Unlimited Prayers & Songs
                      </h3>
                      <p className="text-gray-400">
                        Generate as many personalized prayers and songs as you need
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        Shareable Video Cards
                      </h3>
                      <p className="text-gray-400">
                        Share your personalized songs on TikTok, Instagram, and WhatsApp
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleStartTrial}
                    className="btn-primary w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-black font-bold py-4 text-base sm:text-lg min-h-[48px] touch-manipulation"
                  >
                    Start 3-Day Free Trial
                  </button>
                  <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
                    Enter your credit card to start. Cancel anytime during trial.
                  </p>
                  <button
                    onClick={onClose}
                    className="text-gray-400 active:text-white text-sm sm:text-base text-center w-full block py-2 touch-manipulation min-h-[44px]"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

