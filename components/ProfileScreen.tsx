"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCrown, FaBell, FaQuestionCircle, FaExternalLinkAlt, FaEdit } from "react-icons/fa";

interface ProfileScreenProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  isPremium?: boolean;
  isAuthenticated?: boolean;
  onManageSubscription?: () => void;
  onStartTrial?: () => void;
  onNameUpdate?: (newName: string) => void;
  onSignOut?: () => void;
}

export function ProfileScreen({
  userId,
  userName,
  userEmail,
  isPremium = false,
  isAuthenticated = false,
  onManageSubscription,
  onStartTrial,
  onNameUpdate,
  onSignOut,
}: ProfileScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userName || "");

  // Update editedName when userName prop changes
  useEffect(() => {
    setEditedName(userName || "");
  }, [userName]);

  const handleNameSave = () => {
    if (editedName.trim()) {
      const trimmedName = editedName.trim();
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selah_user_name', trimmedName);
      }
      // Notify parent component to update state
      onNameUpdate?.(trimmedName);
      // TODO: Save to backend if user is authenticated
      setIsEditingName(false);
    } else {
      // Reset if empty
      setEditedName(userName || "");
      setIsEditingName(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* User Info - Premium avatar with golden ring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="relative inline-block">
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-[#D4A574] to-[#B8935F] flex items-center justify-center text-[#0A1628] text-4xl font-bold mx-auto shadow-[0_8px_30px_rgba(212,165,116,0.3)] relative ${
                isPremium ? 'ring-4 ring-[#D4A574]/60' : ''
              }`}>
                {(isEditingName ? editedName : userName)?.[0]?.toUpperCase() || "?"}
              </div>
              {isPremium && (
                <div className="absolute -top-2 -right-2 w-9 h-9 bg-gradient-to-br from-[#D4A574] to-[#B8935F] rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(212,165,116,0.5)] ring-2 ring-[#0A1628]">
                  <span className="text-xl">✨</span>
                </div>
              )}
            </div>
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-[#1a2942] border-2 border-[#D4A574] rounded-lg px-4 py-2 text-[#F5F5F5] text-xl sm:text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#D4A574] max-w-[200px]"
                  autoFocus
                  maxLength={50}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNameSave();
                    } else if (e.key === 'Escape') {
                      setEditedName(userName || "");
                      setIsEditingName(false);
                    }
                  }}
                  onBlur={handleNameSave}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-[#F5F5F5]">{userName || "Guest"}</h2>
                <button
                  onClick={() => {
                    setEditedName(userName || "");
                    setIsEditingName(true);
                  }}
                  className="text-[#D4A574] hover:text-[#F5F5F5] transition-colors p-1.5 touch-manipulation rounded-full hover:bg-[#1a2942]/60"
                  aria-label="Edit name"
                >
                  <FaEdit className="text-sm" />
                </button>
              </div>
            )}
            {userEmail ? (
              <p className="text-[#8B9DC3] text-sm">{userEmail}</p>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8B9DC3]/20 rounded-full">
                <span className="text-[#8B9DC3] text-xs font-medium">👤 Guest User</span>
              </div>
            )}
          </motion.div>

          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card space-y-4"
          >
            <h2 className="text-xl font-bold text-[#F5F5F5]">Subscription</h2>
            <div className="flex items-center gap-3">
              <FaCrown className={`text-2xl ${isPremium ? 'text-[#D4A574]' : 'text-[#8B9DC3]'}`} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#F5F5F5]">
                  {isPremium ? "✨ Premium Member" : "Free"}
                </h3>
                {isPremium && (
                  <p className="text-sm text-[#8B9DC3]">
                    Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                )}
                {!isPremium && (
                  <p className="text-sm text-[#8B9DC3]">
                    Unlimited text prayers
                  </p>
                )}
              </div>
            </div>

            {!isPremium && (
              <button
                onClick={isAuthenticated ? onManageSubscription : onStartTrial}
                className="btn-primary w-full py-3 text-base min-h-[48px] touch-manipulation font-bold"
              >
                Start Free Trial
              </button>
            )}

            {isPremium && onManageSubscription && (
              <button
                onClick={onManageSubscription}
                className="btn-secondary w-full py-3 text-base min-h-[48px] touch-manipulation"
              >
                Manage Subscription
              </button>
            )}
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card space-y-4"
          >
            <h2 className="text-xl font-bold text-[#F5F5F5]">Settings</h2>
            
            {/* Notifications */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <FaBell className="text-[#8B9DC3]" />
                <div>
                  <p className="text-[#F5F5F5] font-medium">🔔 Daily Reminder</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-[#D4A574]' : 'bg-[#8B9DC3]/30'
                }`}
              >
                <div className={`w-5 h-5 bg-[#F5F5F5] rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </button>
            </div>

            {/* Dark Mode - Always On */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-[#8B9DC3]">🌙</span>
                <div>
                  <p className="text-[#F5F5F5] font-medium">Dark Mode</p>
                </div>
              </div>
              <span className="text-[#8B9DC3] text-sm">Always On</span>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <button className="w-full flex items-center justify-between p-3 text-[#F5F5F5] hover:bg-[#1a2942]/60 rounded-lg transition-colors touch-manipulation">
              <span>📧 Support</span>
              <FaExternalLinkAlt className="text-[#8B9DC3] text-sm" />
            </button>

            <button className="w-full flex items-center justify-between p-3 text-[#F5F5F5] hover:bg-[#1a2942]/60 rounded-lg transition-colors touch-manipulation">
              <span>📄 Privacy Policy</span>
              <FaExternalLinkAlt className="text-[#8B9DC3] text-sm" />
            </button>

            <button className="w-full flex items-center justify-between p-3 text-[#F5F5F5] hover:bg-[#1a2942]/60 rounded-lg transition-colors touch-manipulation">
              <span>⚖️ Terms of Service</span>
              <FaExternalLinkAlt className="text-[#8B9DC3] text-sm" />
            </button>

            <button className="w-full flex items-center justify-between p-3 text-[#F5F5F5] hover:bg-[#1a2942]/60 rounded-lg transition-colors touch-manipulation">
              <span>🔄 Restore Purchase</span>
              <FaExternalLinkAlt className="text-[#8B9DC3] text-sm" />
            </button>

            {isAuthenticated && (
              <button 
                onClick={onSignOut}
                className="w-full flex items-center justify-between p-3 text-red-400 hover:bg-[#1a2942]/60 rounded-lg transition-colors touch-manipulation"
              >
                <span>Sign Out</span>
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

