"use client";

import { motion } from "framer-motion";
import { FaCheck, FaStar, FaCrown } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { openDodoCheckout } from "@/lib/dodo-checkout";

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  icon: any;
  planType: 'monthly' | 'yearly';
}

// Selah subscription tiers
const tiers: SubscriptionTier[] = [
  {
    id: "monthly",
    name: "Premium Monthly",
    price: 9.99,
    interval: "month",
    planType: "monthly",
    icon: FaStar,
    features: [
      "Voice prayers with background music",
      "AI-generated worship songs",
      "Unlimited prayer history",
      "Personalized daily prayers",
    ],
  },
  {
    id: "yearly",
    name: "Premium Yearly",
    price: 95.88,
    interval: "year",
    planType: "yearly",
    icon: FaCrown,
    popular: true,
    features: [
      "Everything in Monthly",
      "Save 20% annually",
      "Priority support",
      "Early access to new features",
    ],
  },
];

interface SubscriptionCTAProps {
  songId?: string | null;
  // autoOpenSingle: when true and songId present, immediately open the single-song checkout
  autoOpenSingle?: boolean;
}

export function SubscriptionCTA({ songId, autoOpenSingle }: SubscriptionCTAProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase]);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setIsLoading(tier.id);
    try {
      await openDodoCheckout({ planType: tier.planType });
    } catch (err) {
      console.error('handleSubscribe error', err);
      alert('Unable to open checkout. Please try again or contact support.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Unlock Full Songs
        </h2>
        <p className="text-gray-600 text-lg">
          Choose the plan that fits your heartbreak journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isPopular = tier.popular;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative rounded-3xl p-8 ${
                    tier.id === 'one-time'
                      ? "bg-gray-900/90 text-white shadow-2xl border-2 border-gray-800"
                      : isPopular
                      ? "bg-gradient-to-br from-heartbreak-500 to-heartbreak-600 text-white shadow-2xl border-4 border-heartbreak-400 transform scale-105"
                      : "bg-white border-2 border-gray-200 shadow-lg"
                  }`}>
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-full ${tier.id === 'one-time' ? "bg-white/5" : isPopular ? "bg-white/20" : "bg-heartbreak-100"}`}>
                  <Icon className={`text-2xl ${(isPopular || tier.id === 'one-time') ? "text-white" : "text-heartbreak-500"}`} />
                </div>
                <h3 className={`text-2xl font-bold ${(isPopular || tier.id === 'one-time') ? "text-white" : "text-gray-900"}`}>
                  {tier.name}
                </h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className={`text-5xl font-bold ${(isPopular || tier.id === 'one-time') ? "text-white" : "text-gray-900"}`}>
                    ${tier.price}
                  </span>
                  <span className={`ml-2 ${(isPopular || tier.id === 'one-time') ? "text-white/80" : "text-gray-500"}`}>
                    {tier.interval === 'month' ? `/${tier.interval}` : ''}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FaCheck className={`text-lg mt-0.5 flex-shrink-0 ${(isPopular || tier.id === 'one-time') ? "text-white" : "text-heartbreak-500"}`} />
                    <span className={(isPopular || tier.id === 'one-time') ? "text-white" : "text-gray-600"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(tier)}
                disabled={isLoading === tier.id}
                className={
                  isPopular
                    ? 'btn-primary w-full'
                    : 'w-full py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 bg-gradient-to-r from-[#D4A574] to-[#c4965f] text-white hover:shadow-xl'
                }
              >
                {isLoading === tier.id ? "Loading..." : `Subscribe to ${tier.name}`}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
      
    </div>
  );
}
