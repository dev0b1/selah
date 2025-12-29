"use client";

import Script from "next/script";

export function DodoLoader() {
  const handleLoad = () => {
    if (typeof window !== "undefined" && (window as any).Dodo) {
      const apiKey = process.env.NEXT_PUBLIC_DODO_API_KEY;
      const environment = process.env.NEXT_PUBLIC_DODO_ENVIRONMENT === "production" ? "production" : "sandbox";

      if (!apiKey) {
        // Silently fail - payment functionality will be handled server-side
        return;
      }

      try {
        (window as any).Dodo.Initialize({
          apiKey: apiKey,
          environment: environment,
        });
        console.log(`Dodo initialized successfully (env: ${environment})`);
      } catch (error) {
        // Silently handle initialization errors
      }
    }
  };

  const handleError = () => {
    // Silently fail - SDK will be loaded when Dodo credentials are available
    // Payment functionality can work server-side in the meantime
  };

  // Only load Dodo SDK if API key is configured
  const apiKey = process.env.NEXT_PUBLIC_DODO_API_KEY;
  const dodoSdkUrl = process.env.NEXT_PUBLIC_DODO_SDK_URL || "https://cdn.dodopayments.com/dodo.js";

  if (!apiKey) {
    // Don't load SDK if API key isn't configured yet
    return null;
  }

  return (
    <Script
      src={dodoSdkUrl}
      strategy="afterInteractive"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
