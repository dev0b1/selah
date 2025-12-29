/**
 * Dodo Payment SDK wrapper for client-side initialization
 * 
 * This module provides a wrapper around the Dodo Payments SDK.
 * The SDK is loaded via the DodoLoader component in the app layout.
 * 
 * Usage:
 * - Ensure NEXT_PUBLIC_DODO_API_KEY is set in environment
 * - DodoLoader component loads the SDK from CDN
 * - This wrapper provides type-safe access to Dodo SDK methods
 */

export interface DodoCheckoutPayload {
  items: Array<{
    priceId: string;
    quantity: number;
  }>;
  settings?: {
    successUrl?: string;
    cancelUrl?: string;
    theme?: 'light' | 'dark';
  };
  customData?: Record<string, any>;
  customer?: {
    email?: string;
    name?: string;
  };
}

export interface DodoSDK {
  Checkout: {
    open: (payload: DodoCheckoutPayload) => void;
    close: () => void;
  };
  on: (event: string, callback: (data: any) => void) => void;
  Initialize: (config: { apiKey: string; environment: 'sandbox' | 'production' }) => void;
}

/**
 * Initialize Dodo SDK
 * Returns the Dodo SDK instance from window or a fallback shim
 */
export default async function initializeDodo(opts?: { 
  environment?: 'sandbox' | 'production'; 
  apiKey?: string; 
  eventCallback?: (ev: any) => void 
}): Promise<DodoSDK> {
  // Check if Dodo SDK is loaded in window (via DodoLoader)
  if (typeof window !== 'undefined' && (window as any).Dodo) {
    const dodo = (window as any).Dodo as DodoSDK;
    
    // Initialize if not already initialized
    if (opts?.apiKey && opts?.environment) {
      try {
        dodo.Initialize({
          apiKey: opts.apiKey,
          environment: opts.environment,
        });
        console.log('[Dodo SDK] Initialized successfully');
      } catch (error) {
        console.warn('[Dodo SDK] Initialization failed:', error);
      }
    }
    
    // Register event callback if provided
    if (opts?.eventCallback) {
      dodo.on('*', opts.eventCallback);
    }
    
    return dodo;
  }
  
  // Fallback shim for development/testing when SDK is not loaded
  console.warn('[Dodo SDK] SDK not loaded, using fallback shim');
  
  const shim: DodoSDK = {
    Checkout: {
      open: (payload: DodoCheckoutPayload) => {
        console.info('[Dodo SDK Shim] Checkout.open called with:', {
          items: payload.items,
          successUrl: payload.settings?.successUrl,
          customData: payload.customData,
        });
        
        // In development, redirect to pricing page as fallback
        if (typeof window !== 'undefined') {
          console.warn('[Dodo SDK Shim] Redirecting to pricing page (SDK not loaded)');
          window.location.href = '/pricing';
        }
      },
      close: () => {
        console.info('[Dodo SDK Shim] Checkout.close called');
      }
    },
    on: (event: string, callback: (data: any) => void) => {
      console.info('[Dodo SDK Shim] Event listener registered:', event);
    },
    Initialize: (config) => {
      console.info('[Dodo SDK Shim] Initialize called with:', config.environment);
    }
  };
  
  return shim;
}

/**
 * Get Dodo SDK instance from window
 * Useful for components that need direct access to the SDK
 */
export function getDodoSDK(): DodoSDK | null {
  if (typeof window !== 'undefined' && (window as any).Dodo) {
    return (window as any).Dodo as DodoSDK;
  }
  return null;
}

