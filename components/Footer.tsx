"use client";

import Link from "next/link";
import AuthAwareCTA from "./AuthAwareCTA";
import { FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-daily-bg border-t border-daily-pink/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🔥</span>
              <span className="text-2xl font-black bg-gradient-to-r from-daily-pink to-daily-accent bg-clip-text text-transparent">
                DailyMotiv
              </span>
            </div>
            <p className="text-gray-400 text-sm font-bold">
              Short daily check-ins, motivational nudges, and a saved personal history.
            </p>
          </div>

          <div>
            <h3 className="text-daily-accent font-black text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <AuthAwareCTA className="text-gray-400 hover:text-white transition-colors font-bold">
                  New Check-in
                </AuthAwareCTA>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors font-bold">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors font-bold">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-daily-accent font-black text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors font-bold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors font-bold">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-daily-accent font-black text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://tiktok.com/@dailymotiv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-daily-pink transition-colors text-2xl"
              >
                <FaTiktok />
              </a>
              <a
                href="https://instagram.com/dailymotiv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-daily-pink transition-colors text-2xl"
              >
                <FaInstagram />
              </a>
              <a
                href="https://twitter.com/dailymotiv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-daily-pink transition-colors text-2xl"
              >
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-daily-pink/20">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm font-bold">
              <span className="text-daily-pink">Daily motivation & short nudges — made for small habits ✨</span>
            </p>
          </div>
          <p className="text-gray-500 text-sm font-bold text-center">
            © {new Date().getFullYear()} DailyMotiv. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
