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
}

export function FeedHistoryScreen({ userId }: FeedHistoryScreenProps) {
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
      <ScreenHeader
        title="Your Prayers & Songs"
        showBack={false}
        rightElement={
          <button
            onClick={() => {
              setFilter(filter === "all" ? "prayer" : filter === "prayer" ? "song" : "all");
            }}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors touch-manipulation relative"
            aria-label="Filter"
          >
            <FaFilter className="text-xl" />
            {filter !== "all" && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4A574] rounded-full"></span>
            )}
          </button>
        }
      />

      <div className="min-h-[calc(100vh-8rem)] p-4 pb-24">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
            <div className="text-6xl">📜</div>
            <h3 className="text-2xl font-bold text-[#F5F5F5]">
              No prayers or songs yet
            </h3>
            <p className="text-[#8B9DC3] max-w-sm">
              Your generated prayers and songs will appear here. Start by creating your first prayer!
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#8B9DC3]/20 text-[#F5F5F5]">
                        {item.type === "song" ? "🎵 Song" : "🙏 Prayer"} {item.type === "prayer" && item.need ? `• ${item.need}` : ""}
                      </span>
                    </div>
                    <p className="text-[#F5F5F5]/80 text-sm line-clamp-2 mt-2">
                      {item.text}
                    </p>
                    <p className="text-xs text-[#8B9DC3] mt-2">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {item.audioUrl && (
                    <button className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 text-sm min-h-[40px] touch-manipulation">
                      <FaPlay />
                      <span>Play</span>
                    </button>
                  )}
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 text-sm min-h-[40px] touch-manipulation">
                    <FaShare />
                    <span>Share</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

