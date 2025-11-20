"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

interface RoastModeTabProps {
  userId: string;
}

export function RoastModeTab({ userId }: RoastModeTabProps) {
  const router = useRouter();
  const [previousRoasts, setPreviousRoasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreviousRoasts();
  }, [userId]);

  const fetchPreviousRoasts = async () => {
    try {
      const response = await fetch(`/api/user/roasts?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPreviousRoasts(data.roasts || []);
      }
    } catch (error) {
      console.error("Error fetching previous roasts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-12">
      {/* Create New Roast Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-gradient">
            Create Another Savage Roast
          </h2>
          <p className="text-xl text-white font-bold">
            Ready to roast someone new? 🔥
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            <button
              onClick={() => router.push("/story")}
              className="btn-primary w-full text-2xl py-8 flex items-center justify-center gap-4"
            >
              <span>Spill the Tea & Create Roast</span>
              <span className="text-4xl">🔥</span>
            </button>
            <p className="text-center text-gray-400 text-sm">
              Takes you to the full roast creation experience
            </p>
          </div>
        </div>
      </motion.div>

      {/* Previous Roasts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h3 className="text-3xl md:text-4xl font-black text-white">
            Your Previous Roasts
          </h3>
          <p className="text-lg text-gray-400">
            {previousRoasts.length > 0
              ? `${previousRoasts.length} savage track${previousRoasts.length !== 1 ? "s" : ""}`
              : "No roasts yet"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-exroast-gold text-4xl" />
          </div>
        ) : previousRoasts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-xl text-gray-400 font-bold">
              Create your first roast to see it here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousRoasts.map((roast, index) => (
              <motion.div
                key={roast.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="card border-2 border-exroast-pink hover:border-exroast-gold cursor-pointer transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="text-5xl text-center">🎵</div>
                  <h4 className="text-xl font-black text-white text-center line-clamp-2">
                    {roast.title || "Untitled Roast"}
                  </h4>
                  {roast.mode && (
                    <div className="text-center">
                      <span className="inline-block bg-exroast-pink/20 text-exroast-pink px-3 py-1 rounded-full text-sm font-bold">
                        {roast.mode === "petty" ? "🔥 Petty Roast" : "👑 Glow-Up Flex"}
                      </span>
                    </div>
                  )}
                  {roast.audioUrl && (
                    <audio
                      controls
                      className="w-full"
                      src={roast.audioUrl}
                    />
                  )}
                  <div className="text-xs text-gray-400 text-center">
                    {new Date(roast.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
