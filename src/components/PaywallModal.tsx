"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaApple, FaGoogle, FaSpinner } from "react-icons/fa";
import { createBrowserClient } from '@supabase/ssr';

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
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    setError(null);

    try {
      // Use localhost instead of 0.0.0.0 for redirect
      const origin = window.location.origin.replace('0.0.0.0', 'localhost');
      const redirectToFull = `${origin}/auth/callback`;

      // Set cookie for post-auth redirect
      document.cookie = `post_auth_redirect=${encodeURIComponent('/app')}; path=/; max-age=600`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectToFull }
      });

      if (error) {
        console.error('Google sign-in error:', error);
        setError(error.message || 'Failed to sign in');
        setLoadingProvider(null);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Failed to sign in with Google');
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoadingProvider('apple');
    setError(null);

    try {
      // Use localhost instead of 0.0.0.0 for redirect
      const origin = window.location.origin.replace('0.0.0.0', 'localhost');
      const redirectToFull = `${origin}/auth/callback`;

      // Set cookie for post-auth redirect
      document.cookie = `post_auth_redirect=${encodeURIComponent('/app')}; path=/; max-age=600`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: redirectToFull }
      });

      if (error) {
        console.error('Apple sign-in error:', error);
        setError(error.message || 'Failed to sign in');
        setLoadingProvider(null);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Failed to sign in with Apple');
      setLoadingProvider(null);
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
                <div className="text-center space-y-2 px-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
                    Unlock Unlimited Peace
                  </h2>
                  {selectedMood && (
                    <p className="text-base sm:text-lg font-semibold text-[#D4A574] pt-2">
                      You've chosen: {selectedMood}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-lg sm:text-xl flex-shrink-0">✓</span>
                    <span className="text-[#F5F5F5] text-sm sm:text-base">Voice prayers with music</span>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-lg sm:text-xl flex-shrink-0">✓</span>
                    <span className="text-[#F5F5F5] text-sm sm:text-base">Pray as often as you need</span>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a2942]/60 rounded-lg border border-[#8B9DC3]/20">
                    <span className="text-[#D4A574] text-lg sm:text-xl flex-shrink-0">✓</span>
                    <span className="text-[#F5F5F5] text-sm sm:text-base">Full prayer history</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-center text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Sign In Buttons */}
                <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
                  <button
                    onClick={handleAppleSignIn}
                    disabled={loadingProvider !== null}
                    className="w-full btn-primary py-3 sm:py-4 text-sm sm:text-base min-h-[44px] sm:min-h-[52px] touch-manipulation font-semibold flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingProvider === 'apple' ? (
                      <>
                        <FaSpinner className="animate-spin text-base sm:text-xl" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <FaApple className="text-base sm:text-xl" />
                        <span>Sign in with Apple</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loadingProvider !== null}
                    className="w-full bg-[#F5F5F5] text-[#0A1628] py-3 sm:py-4 text-sm sm:text-base min-h-[44px] sm:min-h-[52px] touch-manipulation font-semibold rounded-lg flex items-center justify-center gap-2 sm:gap-3 hover:bg-[#E5E5E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingProvider === 'google' ? (
                      <>
                        <FaSpinner className="animate-spin text-base sm:text-xl" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <FaGoogle className="text-base sm:text-xl" />
                        <span>Sign in with Google</span>
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

