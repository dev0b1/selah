"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScreenHeader } from "./ScreenHeader";
import { FaPlay, FaShare, FaFilter } from "react-icons/fa";

interface PrayerItem {
  id: string;
  text: string;
  audioUrl?: string;
  need?: string;
  createdAt: string;
  type: "prayer" | "song";
}

interface FeedHistoryScreenProps {
  userId: string;
  onRequireSignup?: () => void;
}

export function FeedHistoryScreen({ userId, onRequireSignup }: FeedHistoryScreenProps) {
  const [items, setItems] = useState<PrayerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "prayer" | "song">("all");

  useEffect(() => {
    // TODO: Fetch user's prayer/song history from API
    const fetchHistory = async () => {
      try {
        // Placeholder - replace with actual API call
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const filteredItems = items.filter(
    (item) => filter === "all" || item.type === filter
  );

  if (isLoading) {
    return (
      <>
        <ScreenHeader
          title="History"
          showBack={false}
          rightElement={
            <button
              onClick={() => {
                setFilter(filter === "all" ? "prayer" : filter === "prayer" ? "song" : "all");
              }}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors touch-manipulation"
              aria-label="Filter"
            >
              <FaFilter className="text-xl" />
            </button>
          }
        />
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="text-[#8B9DC3]">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Removed header - filter button moved inline */}
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 pb-24 pt-6">
        {/* Filter button - floating top right */}
        <div className="flex justify-end mb-6">
          <motion.button
            onClick={() => {
              setFilter(filter === "all" ? "prayer" : filter === "prayer" ? "song" : "all");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 flex items-center justify-center text-[#8B9DC3] hover:text-[#D4A574] bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-[#D4A574]/30 transition-all duration-300 touch-manipulation relative shadow-lg"
            aria-label="Filter"
          >
            <FaFilter className="text-xl" />
            {filter !== "all" && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4A574] rounded-full ring-2 ring-[#0A1628]"></span>
            )}
          </motion.button>
        </div>
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20">
            <div className="text-7xl mb-2">📜</div>
            <h3 className="text-3xl font-light text-[#F5F5F5] tracking-tight">
              No prayers or songs yet
            </h3>
            <p className="text-[#8B9DC3] max-w-md text-base font-light leading-relaxed">
              Your generated prayers and songs will appear here. Start by creating your first prayer!
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="card p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 text-[#F5F5F5]">
                        {item.type === "song" ? "🎵 Song" : "🙏 Prayer"} {item.type === "prayer" && item.need ? `• ${item.need}` : ""}
                      </span>
                    </div>
                    <p className="text-[#F5F5F5]/90 text-base font-elegant leading-relaxed line-clamp-3 mt-3">
                      {item.text}
                    </p>
                    <p className="text-sm text-[#8B9DC3]/70 font-light mt-4">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {item.audioUrl && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-base min-h-[48px] touch-manipulation"
                    >
                      <FaPlay />
                      <span>Play</span>
                    </motion.button>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3 text-base min-h-[48px] touch-manipulation"
                  >
                    <FaShare />
                    <span>Share</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

