"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaApple, FaGoogle } from "react-icons/fa";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInApple?: () => void;
  onSignInGoogle?: () => void;
  selectedMood?: string;
  userName?: string;
}

export function PaywallModal({
  isOpen,
  onClose,
  onSignInApple,
  onSignInGoogle,
  selectedMood,
  userName,
}: PaywallModalProps) {
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
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

              <div className="space-y-6 pt-4">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-[#F5F5F5]">
                    Unlock Unlimited Peace
                  </h2>
                  {selectedMood && (
                    <p className="text-lg font-semibold text-[#D4A574] pt-2">
                      You've chosen: {selectedMood}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-xl">✓</span>
                    <span className="text-[#F5F5F5]">Voice prayers with music</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-xl">✓</span>
                    <span className="text-[#F5F5F5]">AI worship songs daily</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-xl">✓</span>
                    <span className="text-[#F5F5F5]">Pray as often as you need</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-xl">✓</span>
                    <span className="text-[#F5F5F5]">Full prayer history</span>
                  </div>
                </div>

                {/* Sign In Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={onSignInApple}
                    className="w-full btn-primary py-4 text-base min-h-[52px] touch-manipulation font-bold flex items-center justify-center gap-3"
                  >
                    <FaApple className="text-xl" />
                    <span>Sign in with Apple</span>
                  </button>

                  <button
                    onClick={onSignInGoogle}
                    className="w-full bg-[#F5F5F5] text-[#0A1628] py-4 text-base min-h-[52px] touch-manipulation font-bold rounded-lg flex items-center justify-center gap-3 hover:bg-[#E5E5E5] transition-colors"
                  >
                    <FaGoogle className="text-xl" />
                    <span>Sign in with Google</span>
                  </button>

                  <p className="text-xs text-[#8B9DC3] text-center">
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

