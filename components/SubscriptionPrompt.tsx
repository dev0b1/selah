"use client";

import React from "react";
import { openDodoCheckout } from "@/lib/dodo-checkout";

type Props = {
  onClose: () => void;
};

export default function SubscriptionPrompt({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-[#1a2942] to-[#0A1628] border border-[#D4A574]/30 p-6 shadow-lg">
        <h3 className="mb-2 text-xl font-bold text-white">Unlock Premium</h3>
        <p className="mb-4 text-sm text-white/70">Get voice prayers, worship songs, and more.</p>

        <div className="space-y-3">
          <button
            className="w-full rounded-xl bg-gradient-to-r from-[#D4A574] to-[#c4965f] px-4 py-3 text-white font-medium hover:shadow-lg transition-all"
            onClick={() => {
              openDodoCheckout({ planType: 'monthly' });
              onClose();
            }}
          >
            Premium — $9.99/month
          </button>

          <button
            className="w-full rounded-xl border border-white/20 px-4 py-3 text-white/80 hover:bg-white/5 transition-all"
            onClick={() => {
              openDodoCheckout({ planType: 'yearly' });
              onClose();
            }}
          >
            Yearly — Save 20%
          </button>

          <button className="mt-2 w-full text-sm text-white/50 hover:text-white/70" onClick={onClose}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
