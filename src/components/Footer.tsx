"use client";

import Link from "next/link";
import AuthAwareCTA from "./AuthAwareCTA";
import { FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🙏</span>
              <span className="text-2xl font-script text-white">
                Selah
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              Pause. Breathe. Pray. Reconnect with God through daily Bible verses, personalized prayers, and AI-generated worship songs.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <AuthAwareCTA className="text-gray-400 hover:text-white transition-colors font-medium">
                  Create Prayer
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
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
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
            <h3 className="text-white font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://tiktok.com/@selah"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                <FaTiktok />
              </a>
              <a
                href="https://instagram.com/selah"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                <FaInstagram />
              </a>
              <a
                href="https://twitter.com/selah"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm font-medium">
              <span className="text-white">Pause. Breathe. Pray. — reconnect with God through personalized prayers 🙏</span>
            </p>
          </div>
          <p className="text-gray-500 text-sm font-medium text-center">
            © {new Date().getFullYear()} Selah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
