"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FaSpinner } from "react-icons/fa";

const MOOD_OPTIONS = [
  { id: "hurting", label: "Still hurting", emoji: "💔", color: "from-red-500 to-pink-500" },
  { id: "confidence", label: "Need confidence", emoji: "✨", color: "from-purple-500 to-pink-500" },
  { id: "frustrated", label: "Fired up", emoji: "😤", color: "from-orange-500 to-red-600" },
  { id: "unstoppable", label: "Feeling unstoppable", emoji: "🚀", color: "from-green-500 to-blue-500" },
  { id: "anxious", label: "Feeling anxious", emoji: "😟", color: "from-indigo-500 to-gray-500" },
  { id: "calm", label: "Need calm", emoji: "🧘", color: "from-teal-400 to-blue-400" }
];

export default function DailyMotivationPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [motivation, setMotivation] = useState<string | null>(null);

  const handleGetMotivation = async () => {
    if (!selectedMood || !message.trim()) return;

    setIsLoading(true);

    setTimeout(() => {
      const motivations: Record<string, string> = {
        hurting: "Listen… it's okay to hurt. But don't let that pain define you. You're not broken — you're becoming. Keep choosing yourself.",
        confidence: "You know what? You're doing better than you think. Every day without them is a day you choose YOU. Keep that crown on — you earned it.",
        frustrated: "Channel that energy into power. Use it to move forward — workouts, wins, small victories. Turn the heat into momentum.",
        unstoppable: "THAT'S the energy! You're not just moving on — you're moving UP. Keep choosing yourself and thrive.",
        anxious: "Breathe. This moment doesn't define your future. Small steps, steady breaths — you have what it takes to keep moving forward.",
        calm: "Find a quiet moment to breathe and reset. You're allowed rest — it's part of getting stronger. Center, then continue."
      };

      setMotivation(motivations[selectedMood] || motivations.unstoppable);
      setIsLoading(false);
      // Removed guest/local persistence — encourage sign-up to save streaks/server-side.
    }, 2000);
  };

  const handleSignupToSave = () => {
    router.push("/auth?redirectTo=/app");
  };

  if (motivation) {
    return (
      <div className="min-h-screen bg-black relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <Header />
          
          <main className="pt-32 pb-20 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              <div className="card border-4 border-daily-accent bg-gradient-to-br from-purple-900/30 to-black space-y-8">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black text-center bg-gradient-to-r from-purple-400 to-daily-accent bg-clip-text text-transparent"
                >
                  Your Daily Boost 🔥
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 border-2 border-daily-accent rounded-xl p-8"
                >
                  <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
                    {motivation}
                  </p>
                </motion.div>

                <div className="space-y-4">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleSignupToSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary w-full text-xl py-4"
                  >
                    Sign Up to Save Your Streak 🔥
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center text-gray-400 text-sm"
                  >
                    Create an account to track your daily check-ins and build your streak!
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        
        <main className="pt-32 pb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 to-daily-accent bg-clip-text text-transparent drop-shadow-sm antialiased">
                How are you feeling today? 💭
              </h1>
              <p className="text-xl text-white font-bold">
                Pick your mood and let it out
              </p>
            </div>

            <div className="card space-y-8">
              {/* Mood Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MOOD_OPTIONS.map((mood) => (
                  <motion.button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-xl border-4 transition-all duration-300 ${
                      selectedMood === mood.id
                        ? `bg-gradient-to-br ${mood.color} border-white shadow-lg`
                        : "bg-white/5 border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <div className="text-white font-bold text-sm whitespace-normal leading-tight text-center">{mood.label}</div>
                  </motion.button>
                ))}
              </div>

              {/* Text Area */}
              <div>
                <label className="block text-white font-bold mb-3 text-lg">
                  What's on your mind?
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Let it all out... write as much as you need — this is your private space"
                  className="w-full min-h-[220px] bg-black border-2 border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:border-daily-accent focus:outline-none resize-vertical text-lg"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={handleGetMotivation}
                disabled={!selectedMood || !message.trim() || isLoading}
                whileHover={{ scale: selectedMood && message.trim() ? 1.05 : 1 }}
                whileTap={{ scale: selectedMood && message.trim() ? 0.95 : 1 }}
                className="btn-primary w-full text-2xl py-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Getting Your Motivation...</span>
                  </>
                ) : (
                  <>
                    <span>Get My Motivation</span>
                    <span>🔥</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
