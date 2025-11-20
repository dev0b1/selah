"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { DailyCheckInTab } from "@/components/DailyCheckInTab";
import { RoastModeTab } from "@/components/RoastModeTab";
import { FaSpinner } from "react-icons/fa";

type Tab = "daily" | "roast";

export default function AppPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [currentTab, setCurrentTab] = useState<Tab>("daily");
  const [user, setUser] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth?redirectTo=/app");
        return;
      }
      setUser(session.user);
      await fetchStreak(session.user.id);
      setIsLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const fetchStreak = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/streak?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStreak(data.currentStreak || 0);
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  const handleStreakUpdate = (newStreak: number) => {
    setStreak(newStreak);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <FaSpinner className="animate-spin text-exroast-gold text-6xl" />
      </div>
    );
  }

  const getFireEmojis = (streakCount: number) => {
    const count = Math.min(streakCount, 10);
    return "🔥".repeat(count);
  };

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b-2 border-exroast-gold">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black text-gradient">🔥 ExRoast.fm</h1>
            <Header />
          </div>
          
          {/* Huge Streak Counter */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center py-4"
          >
            <motion.div
              key={streak}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl md:text-8xl font-black"
            >
              <span className="text-gradient">Day {streak}</span>{" "}
              <span className="text-white">strong</span>{" "}
              <span className="inline-block">{getFireEmojis(streak)}</span>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setCurrentTab("daily")}
              className={`flex-1 py-4 px-6 rounded-xl font-black text-xl transition-all duration-300 ${
                currentTab === "daily"
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Daily Check-In
            </button>
            <button
              onClick={() => setCurrentTab("roast")}
              className={`flex-1 py-4 px-6 rounded-xl font-black text-xl transition-all duration-300 ${
                currentTab === "roast"
                  ? "bg-gradient-to-r from-exroast-pink to-red-600 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Roast Mode
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10 pt-80 pb-20">
        <AnimatePresence mode="wait">
          {currentTab === "daily" && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DailyCheckInTab userId={user?.id} onStreakUpdate={handleStreakUpdate} />
            </motion.div>
          )}
          {currentTab === "roast" && (
            <motion.div
              key="roast"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RoastModeTab userId={user?.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
