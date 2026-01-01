"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaTrash, FaCopy, FaSpinner } from "react-icons/fa";

interface Prayer {
  id: string;
  text: string;
  audioUrl?: string;
  need: string;
  createdAt: string;
}

interface PrayersHistoryScreenProps {
  userId: string;
  userName: string;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export function PrayersHistoryScreen({
  userId,
  userName,
  isPremium = false,
}: PrayersHistoryScreenProps) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadPrayers();
  }, [userId]);

  const loadPrayers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/prayer/history?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setPrayers(data.prayers || []);
      }
    } catch (error) {
      console.error("Error loading prayers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrayer = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Prayer copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy prayer:", err);
    }
  };

  const handleDeletePrayer = async (prayerId: string) => {
    if (!confirm("Are you sure you want to delete this prayer?")) return;

    try {
      const res = await fetch(`/api/prayer/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerId, userId }),
      });

      if (res.ok) {
        setPrayers(prayers.filter((p) => p.id !== prayerId));
      }
    } catch (error) {
      console.error("Error deleting prayer:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNeedLabel = (need: string) => {
    const labels: Record<string, string> = {
      peace: "Peace",
      guidance: "Guidance",
      anxious: "Anxiety",
      grateful: "Gratitude",
      strength: "Strength",
      healing: "Healing",
      comfort: "Comfort",
    };
    return labels[need] || need;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="text-4xl text-[#D4A574] animate-spin" />
      </div>
    );
  }

  if (prayers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-2xl text-white font-light mb-2">No prayers yet</h2>
          <p className="text-[#8B9DC3] text-sm">
            Your prayer history will appear here
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl text-white font-light mb-1">Your Prayers</h2>
        <p className="text-[#8B9DC3] text-sm">
          {prayers.length} prayer{prayers.length !== 1 ? "s" : ""} saved
        </p>
      </motion.div>

      {prayers.map((prayer, index) => (
        <motion.div
          key={prayer.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/5 backdrop-blur-md border border-[#8B9DC3]/20 rounded-2xl p-5 space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#D4A574]/20 text-[#D4A574] rounded-full text-xs font-medium">
                {getNeedLabel(prayer.need)}
              </span>
              <span className="text-[#8B9DC3] text-xs">
                {formatDate(prayer.createdAt)}
              </span>
            </div>
          </div>

          {/* Prayer Text */}
          <p className="text-[#F5F5F5] leading-relaxed text-sm">
            {prayer.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => handleCopyPrayer(prayer.text)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4A574]/20 hover:bg-[#D4A574]/30 text-[#D4A574] rounded-lg transition-colors text-sm"
            >
              <FaCopy className="text-xs" />
              Copy
            </button>

            <button
              onClick={() => handleDeletePrayer(prayer.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm ml-auto"
            >
              <FaTrash className="text-xs" />
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
