type PaddleInitOpts = {
  environment?: 'sandbox' | 'production';
  token: string;
  eventCallback?: (event: any) => void;
};

/**
 * Lightweight wrapper that delegates to the official @paddle/paddle-js package.
 * The package exposes initializePaddle which returns a Promise resolving to the
 * paddle instance. We mirror that API so callers can remain unchanged.
 */
export default async function initializePaddle(opts: PaddleInitOpts) {
  const { environment = 'sandbox', token, eventCallback } = opts;
  
  if (typeof window === 'undefined') {
    throw new Error('initializePaddle can only run in the browser');
  }

  if (!token) {
    throw new Error('Paddle token is required');
  }

  // If already initialized globally, just return it (don't re-initialize)
  if ((window as any).Paddle?.Initialized) {
    console.log('[Paddle] Already initialized, returning existing instance');
    return (window as any).Paddle;
  }

  // Dynamically import the npm package which will inject the Paddle client
  try {
    const mod = await import('@paddle/paddle-js');
    
    if (mod && typeof mod.initializePaddle === 'function') {
      console.log('[Paddle Init] Initializing with environment:', environment);
      
      // Forward the options to the package initializer
      const instance = await mod.initializePaddle({
        environment,
        token,
        eventCallback
      });

      if (!instance) {
        console.error('[Paddle Init] initializePaddle returned null/undefined');
        // Fall back to global if it exists
        return (window as any).Paddle || null;
      }

      // Masked token log for runtime debugging
      const masked = `${token.slice(0, 6)}...${token.slice(-4)}`;
      console.log('[Paddle Init] Successfully initialized. Token mask:', masked);
      
      return instance;
    } else {
      console.error('[Paddle Init] @paddle/paddle-js module loaded but initializePaddle function not found');
      return (window as any).Paddle || null;
    }
  } catch (e) {
    console.error('[Paddle Init] Failed to initialize @paddle/paddle-js package:', e);
    
    // Fall back to any global Paddle object if present
    if ((window as any).Paddle) {
      console.warn('[Paddle Init] Using fallback global Paddle object');
      return (window as any).Paddle;
    }
    
    return null;
  }
}