"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheckCircle, FaDownload, FaMusic } from "react-icons/fa";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import PendingClaimBanner from '@/components/PendingClaimBanner';
import AuthAwareCTA from "@/components/AuthAwareCTA";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useEffect } from 'react';

export default function SuccessPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const songId = params.get('songId');
      if (type === 'single' && songId) {
        // show a minimal success message then redirect to the unlocked page
        setTimeout(() => {
          window.location.replace(`/song-unlocked?songId=${encodeURIComponent(songId)}`);
        }, 1200);
      }
    } catch (e) {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-white">Payment successful</h1>
        <p className="text-gray-400 mt-2">Redirecting you to your full song…</p>
      </div>
    </div>
  );
}
