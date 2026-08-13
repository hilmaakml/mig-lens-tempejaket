'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker in production only.
 *
 * The worker itself caches the public shell and static assets exclusively; the offer flow
 * routes are on its deny list (SECURITY.md 10, `public/sw.js`).
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    const register = () => {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // A failed registration only means no offline shell; the app still works online.
      });
    };
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
