type PaddleInitOpts = {
  environment?: 'sandbox' | 'production';
  token: string;
  eventCallback?: (event: any) => void;
};

/**
 * Lightweight wrapper that delegates to the official @paddle/paddle-js package.
 * Directly mirrors the API from @paddle/paddle-js without any fallback logic.
 */
export default async function initializePaddle(opts: PaddleInitOpts) {
  const { environment = 'sandbox', token, eventCallback } = opts;
  
  if (typeof window === 'undefined') {
    throw new Error('initializePaddle can only run in the browser');
  }

  if (!token) {
    throw new Error('Paddle token is required');
  }

  // Debug: verify token format
  console.log('[Paddle Debug] Token prefix:', token.substring(0, 10));
  console.log('[Paddle Debug] Environment:', environment);
  
  if (environment === 'sandbox' && !token.startsWith('test_')) {
    console.error('❌ Using sandbox but token does not start with test_');
  }
  if (environment === 'production' && !token.startsWith('live_')) {
    console.error('❌ Using production but token does not start with live_');
  }

  try {
    // Dynamically import the official @paddle/paddle-js package
    const mod = await import('@paddle/paddle-js');
    
    if (!mod.initializePaddle) {
      throw new Error('@paddle/paddle-js module loaded but initializePaddle function not found');
    }

    // Forward all options directly to the official package
    const instance = await mod.initializePaddle({
      environment,
      token,
      eventCallback
    });

    if (!instance) {
      throw new Error('Paddle initialization returned null or undefined');
    }

    // Optional: Masked token log for debugging
    if (process.env.NODE_ENV === 'development') {
      const masked = `${token.slice(0, 6)}...${token.slice(-4)}`;
      console.log('[Paddle] Initialized successfully. Token mask:', masked);
    }

    return instance;
  } catch (error) {
    console.error('[Paddle] Initialization failed:', error);
    throw error; // Re-throw so callers know it failed
  }
}