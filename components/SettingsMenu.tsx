"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from "next/navigation";
import { openSingleCheckout, openTierCheckout } from '@/lib/checkout';

export default function SettingsMenu({ onClose }: { onClose?: () => void }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      try { localStorage.removeItem('intendedPurchase'); } catch (e) {}
      router.push('/');
    } catch (e) {
      console.error('Sign out failed', e);
    } finally {
      setLoading(false);
      onClose?.();
    }
  };

  // Focus + keyboard handling: focus first focusable on open, close on Escape,
  // and trap Tab within the menu. We'll render a centered modal overlay on
  // desktop and a full-screen modal on mobile. Clicking the overlay or the
  // close button will call onClose to dismiss.
  const [isMobile, setIsMobile] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);

  // fetch credits when menu opens
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/account/summary');
        if (!res.ok) throw new Error('no summary');
        const json = await res.json();
        if (!mounted) return;
        const c = Number(json?.credits ?? 0) || 0;
        setCredits(c);
      } catch (e) {
        if (mounted) setCredits(0);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // focus first button when mounted
    const el = document.getElementById('settings-menu');
    if (el) {
      const btn = el.querySelector('button');
      (btn as HTMLElement | null)?.focus?.();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
      if (e.key === 'Tab') {
        // focus trap
        const container = document.getElementById('settings-menu');
        if (!container) return;
        const focusable = Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
          .filter((n: any) => !n.hasAttribute('disabled')) as HTMLElement[];
        if (focusable.length === 0) return;
        const idx = focusable.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey) {
          if (idx === 0) {
            focusable[focusable.length - 1].focus();
            e.preventDefault();
          }
        } else {
          if (idx === focusable.length - 1) {
            focusable[0].focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // Render modal overlay (full-screen on mobile, centered modal on desktop)
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start md:items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div
        id="settings-menu"
        ref={containerRef}
        className="w-full max-w-lg bg-gray-900 border border-exroast-pink/30 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <div className="text-white font-black">Account & Settings</div>
            <div className="text-sm text-white/70">Credits: <span className="font-bold">{credits ?? 0}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { openSingleCheckout(); onClose?.(); }}
              className="bg-gradient-to-r from-[#ff006e] to-[#ffd23f] text-black font-bold px-4 py-2 rounded-full shadow-md hover:scale-105 transition-transform"
            >
              Upgrade 🔥
            </button>
            <button
              onClick={() => onClose?.()}
              aria-label="Close settings"
              className="text-white/60 hover:text-white p-2 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => { router.push('/account'); onClose?.(); }}
            className="w-full text-left px-3 py-3 rounded hover:bg-white/5"
          >
            Account
          </button>

          <div className="flex items-center justify-between bg-white/5 p-3 rounded">
            <div>
              <div className="text-sm text-white/80">Credits available</div>
              <div className="text-lg font-bold">{credits ?? 0}</div>
            </div>
            <div>
              <button
                onClick={() => { openTierCheckout('unlimited'); onClose?.(); }}
                className="bg-exroast-pink px-3 py-2 rounded font-bold"
              >
                Go Unlimited
              </button>
            </div>
          </div>

          <div className="border-t border-white/5" />

          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-3 rounded hover:bg-white/5 text-red-400"
            disabled={loading}
          >
            {loading ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}
