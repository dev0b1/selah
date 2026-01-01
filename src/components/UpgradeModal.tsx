"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCrown, FaSpinner } from "react-icons/fa";
import { openDodoCheckout } from '@/lib/dodo-checkout';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  userName?: string;
  feature?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  userName,
  feature = "this feature",
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await openDodoCheckout({ planType: 'monthly' });
      // Close modal after opening checkout
      onClose();
    } catch (error) {
      console.error('Failed to open checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
            className="fixed inset-0 bg-[#0A1628]/90 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto py-8"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="card max-w-lg w-full bg-[#1a2942] border-2 border-[#D4A574]/50 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#8B9DC3] hover:text-[#F5F5F5] transition-colors touch-manipulation rounded-full hover:bg-[#1a2942]"
                aria-label="Close modal"
              >
                <FaTimes className="text-lg" />
              </button>

              <div className="space-y-4 sm:space-y-6 pt-4">
                {/* Header */}
                <div className="text-center space-y-2 sm:space-y-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-br from-[#D4A574] to-[#B8935F] flex items-center justify-center shadow-[0_8px_30px_rgba(212,165,116,0.4)]">
                    <FaCrown className="text-2xl sm:text-3xl text-[#0A1628]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] px-2">
                    Unlock Premium
                  </h2>
                  {userName && (
                    <p className="text-base sm:text-lg text-[#8B9DC3] px-2">
                      Hey {userName}, upgrade to access {feature}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-lg sm:text-xl flex-shrink-0">✓</span>
                    <div>
                      <p className="text-[#F5F5F5] font-medium text-sm sm:text-base">Voice Prayers with Music</p>
                      <p className="text-[#8B9DC3] text-xs sm:text-sm">Listen to your prayers with peaceful background ambience</p>
                    </div>
                  </div>


                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-lg sm:text-xl flex-shrink-0">✓</span>
                    <div>
                      <p className="text-[#F5F5F5] font-medium text-sm sm:text-base">Unlimited Prayers</p>
                      <p className="text-[#8B9DC3] text-xs sm:text-sm">Pray as often as you need throughout the day</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-lg sm:text-xl flex-shrink-0">✓</span>
                    <div>
                      <p className="text-[#F5F5F5] font-medium text-sm sm:text-base">Full History Access</p>
                      <p className="text-[#8B9DC3] text-xs sm:text-sm">Save and revisit all your prayers</p>
                    </div>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
                  <button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="w-full btn-primary py-3 sm:py-4 text-sm sm:text-base min-h-[44px] sm:min-h-[52px] touch-manipulation font-semibold flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-base sm:text-xl" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <FaCrown className="text-base sm:text-xl" />
                        <span>Start 3-Day Free Trial</span>
                      </>
                    )}
                  </button>

                  <p className="text-xs text-[#8B9DC3] text-center px-2">
                    3-day free trial, then $9.99/month
                    <br />
                    Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
