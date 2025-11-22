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

  // If already loaded globally, try to initialize and return it
  if ((window as any).Paddle) {
    try {
      (window as any).Paddle.Initialize({ token });
    } catch (e) {
      // ignore
    }
    return (window as any).Paddle;
  }

  // Dynamically import the npm package which will inject the Paddle client
  // without us manually manipulating script tags.
  try {
    const mod = await import('@paddle/paddle-js');
    if (mod && typeof mod.initializePaddle === 'function') {
      // forward the options to the package initializer
      // @paddle/paddle-js returns a promise that resolves with the instance
      const instance = await mod.initializePaddle({ environment, token, eventCallback } as any);
        // Masked token log for runtime debugging (don't print full token)
        try {
          const masked = token ? `${String(token).slice(0,6)}...${String(token).slice(-4)}` : 'none';
          console.log('[Paddle Init] token present?', Boolean(token), 'mask:', masked);
        } catch (e) {}
        return instance || (window as any).Paddle;
    }
  } catch (e) {
    console.warn('Failed to initialize @paddle/paddle-js package', e);
    // fall back to any global Paddle object if present
    return (window as any).Paddle;
  }

  return (window as any).Paddle;
}
