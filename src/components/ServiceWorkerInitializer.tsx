'use client';

/**
 * Service Worker Initializer
 * 
 * Registers and initializes the service worker for PWA functionality
 * using industry-standard module-level initialization.
 * 
 * The actual initialization happens at module import time in
 * serviceWorkerRegistration.ts, following patterns used by
 * Google, Facebook, and other major PWAs.
 * 
 * This component exists only to ensure the module is imported
 * in client-side contexts.
 */
import '../lib/utils/serviceWorkerRegistration';

export function ServiceWorkerInitializer() {
  // Module-level initialization happens automatically on import
  // No runtime logic needed here
  return null;
}


