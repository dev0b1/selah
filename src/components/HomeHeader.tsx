"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBell, FaSignOutAlt } from "react-icons/fa";

interface HomeHeaderProps {
  userName?: string;
  onNotificationsClick?: () => void;
  onSignOut?: () => void;
}

const calmingMessages = [
  "A quiet moment with God",
  "God is near today",
  "Let's bring today to Him",
  "Peace begins here",
];

export function HomeHeader({ userName, onNotificationsClick, onSignOut }: HomeHeaderProps) {
  const [secondaryMessage, setSecondaryMessage] = useState<string>("");

  useEffect(() => {
    // Select a random message based on day to keep it consistent per day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const messageIndex = dayOfYear % calmingMessages.length;
    setSecondaryMessage(calmingMessages[messageIndex]);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌞";
    if (hour < 18) return "☀️";
    return "🌙";
  };

  const displayName = userName || "Friend";

  return (
    <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-lg border-b border-[#8B9DC3]/20">
      <div className="max-w-7xl mx-auto px-4 h-auto py-3 flex items-center justify-between">
        {/* Left: Greeting */}
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#F5F5F5]">
            {getGreeting()}, {displayName} {getEmoji()}
          </h1>
          {secondaryMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs text-[#8B9DC3] mt-0.5"
            >
              {secondaryMessage}
            </motion.p>
          )}
        </div>

        {/* Right: Bell Icon and Sign Out */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNotificationsClick}
            className="w-10 h-10 flex items-center justify-center text-[#8B9DC3] hover:text-[#F5F5F5] transition-colors touch-manipulation relative"
            aria-label="Notifications"
          >
            <FaBell className="text-xl" />
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-10 h-10 flex items-center justify-center text-[#8B9DC3] hover:text-red-400 transition-colors touch-manipulation"
              aria-label="Sign Out"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

