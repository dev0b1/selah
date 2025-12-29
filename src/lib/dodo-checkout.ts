"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import initializeDodo from '@/lib/dodo';

interface SingleCheckoutOpts {
  prayerId?: string | null;
  planType?: 'monthly' | 'yearly';
}

// Helper to resolve user session
async function resolveUser() {
  const supabase = createClientComponentClient();
  
  try {
    const { data } = await supabase.auth.getSession();
    const sessionData = (data as any)?.session;
    const userFromSession = sessionData?.user;
    if (userFromSession) return userFromSession;
  } catch (e) {
    console.debug('[resolveUser] supabase.auth.getSession() failed', e);
  }

  try {
    const res = await fetch('/api/session');
    if (res.ok) {
      const body = await res.json();
      if (body?.user) return body.user;
    }
  } catch (e) {
    console.debug('[resolveUser] /api/session fetch failed', e);
  }

  try {
    const { data: { user: clientUser } } = await supabase.auth.getUser();
    return clientUser || null;
  } catch (e) {
    console.warn('Failed to get user via client SDK', e);
    return null;
  }
}

// Initialize Dodo once and cache the instance
let dodoInstance: any = null;
let dodoInitPromise: Promise<any> | null = null;

async function ensureDodoInitialized() {
  if (dodoInstance) {
    return dodoInstance;
  }

  if (dodoInitPromise) {
    return dodoInitPromise;
  }

  dodoInitPromise = (async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_DODO_API_KEY;
      const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT || 'sandbox';

      if (!apiKey) {
        console.warn('[Dodo] API key not configured');
        // Return a shim that redirects to pricing page
        return {
          Checkout: {
            open: (payload: any) => {
              console.warn('[Dodo] SDK not configured, redirecting to pricing');
              if (typeof window !== 'undefined') {
                window.location.href = '/pricing';
              }
            },
            close: () => {}
          }
        };
      }

      // Wait a bit for DodoLoader to load the SDK if it hasn't yet
      let attempts = 0;
      while (typeof window !== 'undefined' && !(window as any).Dodo && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Check if Dodo is available in window (loaded by DodoLoader)
      if (typeof window !== 'undefined' && (window as any).Dodo) {
        try {
          const Dodo = (window as any).Dodo;
          
          // Initialize if not already initialized
          if (Dodo.Initialize) {
            Dodo.Initialize({
              apiKey: apiKey,
              environment: environment === 'production' ? 'production' : 'sandbox',
            });
            console.log('[Dodo] Initialized via window.Dodo');
          }
          
          dodoInstance = Dodo;
          return Dodo;
        } catch (e) {
          console.warn('[Dodo] Window.Dodo initialization failed:', e);
        }
      }

      // Fallback to our wrapper
      try {
        const instance = await initializeDodo({
          environment: environment === 'production' ? 'production' : 'sandbox',
          apiKey: apiKey,
          eventCallback: (ev) => {
            console.log('[Dodo Event]', ev?.name);
          }
        });

        dodoInstance = instance;
        return instance;
      } catch (wrapperError) {
        console.warn('[Dodo] Wrapper initialization failed:', wrapperError);
        throw wrapperError;
      }
    } catch (e) {
      console.warn('[Dodo] Initialization failed, using fallback shim:', e);
      dodoInitPromise = null;
      // Return a shim that redirects to pricing
      return {
        Checkout: {
          open: (payload: any) => {
            console.warn('[Dodo] Using fallback shim, redirecting to pricing');
            if (typeof window !== 'undefined') {
              window.location.href = '/pricing';
            }
          },
          close: () => {
            console.log('[Dodo] Close called on shim');
          }
        },
        on: (event: string, callback: (data: any) => void) => {
          console.log('[Dodo] Event listener registered on shim:', event);
        }
      };
    }
  })();

  return dodoInitPromise;
}

export async function openDodoCheckout(opts?: SingleCheckoutOpts) {
  console.log('[openDodoCheckout] Starting with opts:', opts);
  
  const user = await resolveUser();
  console.log('[openDodoCheckout] User resolved:', user ? `${user.email} (${user.id})` : 'null');

  if (!user) {
    console.log('[openDodoCheckout] No authenticated user — redirecting to auth');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth?redirectTo=/app';
    }
    return;
  }

  let dodo: any;
  try {
    dodo = await ensureDodoInitialized();
  } catch (e) {
    console.error('[openDodoCheckout] Failed to initialize Dodo:', e);
    alert('Payment system failed to load. Please refresh and try again.');
    return;
  }

  // Get price ID based on plan type
  const planType = opts?.planType || 'monthly';
  const priceId = planType === 'yearly' 
    ? (process.env.NEXT_PUBLIC_DODO_PRICE_YEARLY || '')
    : (process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY || '');

  console.log('[openDodoCheckout] priceId:', priceId);

  if (!priceId) {
    console.error('Price ID not configured');
    alert('Payment system not configured. Please contact support.');
    return;
  }

  const payload: any = {
    items: [{ priceId: priceId, quantity: 1 }],
    settings: {
      successUrl: `${window.location.origin}/success?type=subscription&plan=${planType}`,
      cancelUrl: `${window.location.origin}/pricing`,
      theme: 'light',
    },
    customData: {
      userId: user.id,
      ...(opts?.prayerId && { prayerId: opts.prayerId })
    },
    customer: {
      email: user.email,
      name: user.user_metadata?.name || user.email
    }
  };

  console.log('[openDodoCheckout] Opening checkout with payload:', {
    successUrl: payload.settings.successUrl,
    customData: payload.customData
  });

  try {
    dodo.Checkout.open(payload);
    console.log('[openDodoCheckout] Checkout opened successfully');
  } catch (error) {
    console.error('[openDodoCheckout] Error opening checkout:', error);
    alert('Failed to open payment system. Please try again.');
  }
}

