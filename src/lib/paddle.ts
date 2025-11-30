// Minimal Paddle initializer stub for client builds.
export default async function initializePaddle(opts?: { environment?: string; token?: string; eventCallback?: (ev: any)=>void }) {
  // In the real implementation this would load the Paddle SDK and return the global.
  // For build-time and dev without the SDK, provide a minimal shim.
  const shim: any = {
    Checkout: {
      open: (payload: any) => {
        console.info('[Paddle Shim] Checkout.open called', payload && payload.items);
      }
    }
  };
  return shim;
}
