"use client";

import { motion } from "framer-motion";
import { FaHome, FaMusic, FaHistory, FaUser } from "react-icons/fa";

export type TabType = "home" | "song-mode" | "feed" | "profile";

// Alias for clarity
export type { TabType as Tab };

interface BottomTabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isPremium?: boolean;
}

export function BottomTabNavigation({
  currentTab,
  onTabChange,
  isPremium = false,
}: BottomTabNavigationProps) {
  const tabs = [
    {
      id: "home" as TabType,
      label: "Home",
      icon: FaHome,
    },
    {
      id: "song-mode" as TabType,
      label: "Worship",
      icon: FaMusic,
      premium: true,
    },
    {
      id: "feed" as TabType,
      label: "History",
      icon: FaHistory,
    },
    {
      id: "profile" as TabType,
      label: "Profile",
      icon: FaUser,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-lg border-t border-[#8B9DC3]/20 safe-area-bottom">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center justify-center gap-1 flex-1 h-full
                  transition-all duration-200 touch-manipulation relative
                  ${isActive
                    ? "text-[#D4A574]"
                    : "text-[#8B9DC3] hover:text-[#F5F5F5]"
                  }
                `}
              >
                <div className="relative">
                  <Icon 
                    className={`text-xl ${isActive ? "text-[#D4A574]" : ""}`}
                    style={isActive ? { filter: 'drop-shadow(0 0 8px #D4A574)' } : {}}
                  />
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-[#D4A574]" : ""}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A574]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

