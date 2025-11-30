"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

// This component shows a banner when the checkout success page indicates
// there are pending credits to claim; users must sign in to claim them.

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
        // Show a banner indicating there are pending credits to claim after sign-in.
        setPending(credits);
      }
    } catch (e) {
      console.error('PendingClaimBanner error', e);
    }
  }, []);
  // Note: auto-claim for guest purchases has been removed. Users should sign in
  // to claim credits or single purchases via server-side fulfillment.

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
