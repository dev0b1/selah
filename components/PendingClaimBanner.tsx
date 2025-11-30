"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PendingClaimBanner() {
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    try {
      // Read query params to detect purchase type on success page
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search || '');
      const type = params.get('type');
      const tier = params.get('tier');
      let credits = 0;

      if (type === 'single') credits = 1;
      else if (tier === 'weekly') credits = 3;

      if (credits > 0) {
        // Do not persist pending credits in browser storage; rely on server-side
        // fulfillment and require the user to sign in to claim credits.
        setPending(credits);
      }
    } catch (e) {
      console.error('PendingClaimBanner error', e);
    }
  }, []);

  if (!pending) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-green-900/60 to-green-700/40 rounded-lg border border-green-600">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-bold">You have a pending credit 🎉</div>
          <div className="text-sm text-white/80">Sign in to claim {pending} credit{pending > 1 ? 's' : ''} and use it to generate your personalized song.</div>
        </div>
        <div className="ml-4">
          <Link href={`/auth?redirectTo=/app`} className="btn-primary px-4 py-2">Sign in to claim</Link>
        </div>
      </div>
    </div>
  );
}
