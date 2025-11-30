"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaFire, FaDumbbell } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-daily-bg relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <Header />
        
        <main className="pt-24 pb-20 px-4">
          {/* Hero Section */}
          <section className="max-w-6xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight text-white">
                Daily motivation & an honest place to vent
              </h1>
              <p className="text-3xl md:text-4xl font-black text-daily-accent">
                Unlimited venting • Private reflections • Bite-sized audio boosts
              </p>
            </motion.div>

            {/* Two Big Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-16 max-w-6xl mx-auto">
                {/* Daily Boost Card (primary) */}
                <Link href="/app">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    whileHover={{ scale: 1.06, y: -12 }}
                    className="card border-4 border-daily-primary cursor-pointer h-full min-h-[360px] md:min-h-[400px] flex flex-col justify-between bg-gradient-to-br from-daily-primary/10 via-daily-accent/6 to-daily-bg hover:shadow-[0_0_48px_rgba(124,58,237,0.28)] transition-all duration-300"
                  >
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8">
                      <motion.div
                        whileHover={{ scale: 1.18, rotate: -6 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-6xl sm:text-7xl md:text-8xl emoji-enhanced"
                      >
                        ⚡️
                      </motion.div>
                      <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-white break-words whitespace-normal text-center">
                        DAILY VENT
                      </h2>
                      <p className="text-xl md:text-2xl text-white font-bold break-words whitespace-normal text-center">
                        Unlimited venting • Bite-sized motivation
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="btn-secondary w-full text-xl py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-daily-primary to-daily-primary/90 hover:from-daily-primary/90 hover:to-daily-primary">
                        <span>Open Daily</span>
                        <FaDumbbell />
                      </div>
                    </div>
                  </motion.div>
                </Link>

                {/* History / Previous Vents Card */}
                <Link href="/app?tab=history">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    whileHover={{ scale: 1.03, y: -6 }}
                    className="card border-4 border-white/10 cursor-pointer h-full min-h-[360px] md:min-h-[400px] flex flex-col justify-between bg-gradient-to-br from-daily-bg via-daily-bg to-daily-bg transition-all duration-300"
                  >
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 p-8">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="text-6xl sm:text-7xl md:text-8xl emoji-enhanced"
                      >
                        📚
                      </motion.div>
                      <h2 className="text-4xl md:text-5xl font-black text-white break-words whitespace-normal text-center">
                        HISTORY
                      </h2>
                      <p className="text-xl md:text-2xl text-white font-bold break-words whitespace-normal text-center">
                        Browse your previous vents and motivation prompts
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="btn-primary w-full text-xl py-4 flex items-center justify-center gap-3">
                        <span>View History</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
            </div>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="pt-12 text-gray-400 text-lg"
            >
              <p className="font-bold">
                New here? Pick one above • Already have a streak?{" "}
                <Link href="/auth" className="text-daily-accent hover:text-daily-pink underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
