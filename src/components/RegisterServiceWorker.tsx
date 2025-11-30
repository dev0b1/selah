"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
          console.info('Service worker registered:', reg.scope);
        })
        .catch(err => {
          console.warn('Service worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
