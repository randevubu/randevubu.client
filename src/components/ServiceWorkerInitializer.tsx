'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '../lib/hooks/useServiceWorker';

/**
 * Service Worker Initializer
 * 
 * Registers and initializes the service worker for PWA functionality
 * and push notifications. Must be a client component to use hooks.
 */
export function ServiceWorkerInitializer() {
  useServiceWorker();
  return null;
}


