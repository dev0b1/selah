"use client";

import { motion } from "framer-motion";
import { FaCheck, FaCrown, FaShieldAlt, FaLock, FaHeadphones, FaMusic, FaHistory, FaBook, FaPrayingHands } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { openDodoCheckout } from '@/lib/dodo-checkout';

const PREMIUM_AMOUNT = 9.99;
const FREE_TRIAL_DAYS = 3;

export default function PricingPage() {
  const handleStartTrial = () => {
    if (typeof window !== 'undefined') {
      openDodoCheckout({ planType: 'monthly' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#1a2942]">
      <AnimatedBackground />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-script text-white mb-6">
              Unlock Unlimited Peace
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Pause. Breathe. Pray. Experience personalized prayers and worship songs that speak your name.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-4">
              <div className="flex items-center gap-2 text-white bg-black/40 px-6 py-3 rounded-full border border-[#D4A574]/30">
                <FaShieldAlt className="text-[#D4A574]" />
                <span className="text-sm">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2 text-white bg-black/40 px-6 py-3 rounded-full border border-[#D4A574]/30">
                <FaLock className="text-[#D4A574]" />
                <span className="text-sm">Secure Payments</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card text-center relative overflow-hidden bg-black/40 border border-white/10"
            >
              <div className="p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FaBook className="text-[#D4A574] text-3xl" />
                  <h3 className="text-3xl font-bold text-white">Free</h3>
                </div>
                <div className="text-6xl font-bold text-white mb-6">
                  $0
                </div>
                <p className="text-white/70 text-sm mb-8">Everything you need to start your journey</p>
                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-start space-x-3">
                    <FaCheck className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Daily Bible verse</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheck className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Unlimited text prayers</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheck className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Personalized prayers with your name</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheck className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Generate specific prayers</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheck className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Share prayers</span>
                  </li>
                </ul>
                <div className="text-center">
                  <p className="text-white/50 text-sm">Start with free features</p>
                </div>
              </div>
            </motion.div>

            {/* Premium Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card text-center relative overflow-hidden bg-gradient-to-br from-[#D4A574]/20 to-[#D4A574]/5 border-2 border-[#D4A574]/50 shadow-[0_0_40px_rgba(212,165,116,0.3)]"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#D4A574] to-[#c4965f] text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                Most Popular
              </div>
              <div className="absolute top-12 right-4 bg-black/60 text-[#D4A574] px-3 py-1 rounded-full text-xs font-bold z-10 border border-[#D4A574]/30">
                {FREE_TRIAL_DAYS}-Day Free Trial
              </div>
              <div className="p-8 pt-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FaCrown className="text-[#D4A574] text-3xl" />
                  <h3 className="text-3xl font-bold text-white">Premium</h3>
                </div>
                <div className="text-6xl font-bold text-white mb-2">
                  ${PREMIUM_AMOUNT.toFixed(2)}
                  <span className="text-2xl text-white/70">/month</span>
                </div>
                <p className="text-white/70 text-sm mb-8">Unlock the full Selah experience</p>
                <ul className="space-y-4 text-left mb-8">
                  <li className="flex items-start space-x-3">
                    <FaCheck className="text-[#D4A574] mt-1 flex-shrink-0 text-lg" />
                    <span className="text-white font-medium">Everything in Free</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaHeadphones className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Voice prayers with music</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaMusic className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">AI worship songs (1 per day)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaHistory className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Full prayer history</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaPrayingHands className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Save favorite prayers</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FaCheck className="text-[#D4A574] mt-1 flex-shrink-0" />
                    <span className="text-white">Share worship songs</span>
                  </li>
                </ul>
                <button
                  onClick={handleStartTrial}
                  className="btn-primary w-full bg-gradient-to-r from-[#D4A574] to-[#c4965f] hover:from-[#c4965f] hover:to-[#b8864a] text-black font-bold py-4 text-lg shadow-[0_4px_20px_rgba(212,165,116,0.4)]"
                >
                  Start {FREE_TRIAL_DAYS}-Day Free Trial
                </button>
                <p className="text-white/60 text-xs mt-3">Then ${PREMIUM_AMOUNT.toFixed(2)}/month • Cancel anytime</p>
              </div>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-5xl mx-auto mb-16"
          >
            <div className="card bg-black/40 border border-white/10">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">
                Feature Comparison
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#D4A574]/30">
                      <th className="pb-4 text-white font-bold text-lg">Feature</th>
                      <th className="pb-4 text-white/70 font-bold text-lg text-center">Free</th>
                      <th className="pb-4 text-[#D4A574] font-bold text-lg text-center">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <td className="py-4 text-white">Daily Bible Verse</td>
                      <td className="py-4 text-white/70 text-center">✓</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">✓</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Text Prayers</td>
                      <td className="py-4 text-white/70 text-center">Unlimited</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Personalized Prayers</td>
                      <td className="py-4 text-white/70 text-center">✓</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">✓</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Voice Prayers (TTS + Music)</td>
                      <td className="py-4 text-white/70 text-center">—</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">✓</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">AI Worship Songs</td>
                      <td className="py-4 text-white/70 text-center">—</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">1 per day</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Prayer History</td>
                      <td className="py-4 text-white/70 text-center">Limited</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">Full Access</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Save Favorites</td>
                      <td className="py-4 text-white/70 text-center">—</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">✓</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Share Worship Songs</td>
                      <td className="py-4 text-white/70 text-center">—</td>
                      <td className="py-4 text-[#D4A574] text-center font-medium">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="card bg-black/40 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-white mb-2">What happens after my free trial?</h4>
                  <p className="text-white/80">
                    After your {FREE_TRIAL_DAYS}-day free trial, your subscription will automatically continue at ${PREMIUM_AMOUNT.toFixed(2)}/month. You can cancel anytime before the trial ends with no charges.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Can I use Selah without subscribing?</h4>
                  <p className="text-white/80">
                    Yes! The free tier includes daily Bible verses and unlimited personalized text prayers. Premium features like voice prayers and worship songs require a subscription.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">How do worship songs work?</h4>
                  <p className="text-white/80">
                    Premium users can generate one AI-powered worship song per day. Each song is personalized with your name and inspired by your prayers. You can share these songs with friends and family.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Can I cancel anytime?</h4>
                  <p className="text-white/80">
                    Absolutely. You can cancel your subscription at any time. You'll continue to have access to premium features until the end of your current billing period.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
