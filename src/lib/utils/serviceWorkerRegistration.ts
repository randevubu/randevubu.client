/**
 * Service Worker Registration Utility
 * Industry-standard approach: module-level initialization without React hooks
 * Based on patterns used by Google, Facebook, and other major PWAs
 */

import toast from 'react-hot-toast';
import { initializeServiceWorkerNavigation } from './serviceWorkerNavigation';

// Type guard for requestIdleCallback (not available in all browsers)
interface WindowWithIdleCallback {
  requestIdleCallback?: typeof window.requestIdleCallback;
}

/**
 * Register service worker with proper update handling
 * Only shows toast on actual first install, not on updates
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const swPath = process.env.NODE_ENV === 'development' ? '/sw-custom.js' : '/sw.js';
    
    // Check if already registered
    const existingRegistration = await navigator.serviceWorker.getRegistration('/');
    if (existingRegistration) {
      // Already registered, just set up update listeners
      currentRegistration = existingRegistration;
      setupUpdateListeners(existingRegistration);
      return existingRegistration;
    }

    // Register new service worker
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
    });

    currentRegistration = registration;

    // Set up update listeners
    setupUpdateListeners(registration);

    return registration;
  } catch (error) {
    toast.error('Service worker kayıt edilemedi');
    return null;
  }
}

/**
 * Set up listeners for service worker updates
 * Only shows toast for actual updates, not first install or re-registrations
 */
function setupUpdateListeners(registration: ServiceWorkerRegistration): void {
  // Handle updatefound event (new service worker detected)
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;

    // Track if we've already handled this worker
    let hasHandledThisWorker = false;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && !hasHandledThisWorker) {
        hasHandledThisWorker = true;

        // Check if this is an update or first install
        if (navigator.serviceWorker.controller) {
          // There's already an active service worker, so this is an update
          toast.success('Yeni güncelleme mevcut! Sayfayı yenileyebilirsiniz.', {
            duration: 6000,
          });
        } else {
          // No active controller means this is the first install
          // Service worker state naturally prevents duplicate toasts:
          // - updatefound event only fires when a NEW service worker starts installing
          // - Once installed and activated, controller will never be null again
          toast.success('Uygulama çevrimdışı kullanım için hazırlandı!');
        }
      }
    });
  });

  // Handle controller change (new service worker activated)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Reload when new controller takes over if there was a waiting worker
    if (registration.waiting) {
      window.location.reload();
    }
  });
}

// Track current registration for access by other modules
let currentRegistration: ServiceWorkerRegistration | null = null;

// Track if initialization has already started to prevent duplicate calls
let initializationStarted = false;

/**
 * Initialize service worker registration
 * Should be called once on app load
 * Uses module-level singleton pattern to ensure single execution
 */
export function initializeServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Prevent duplicate initialization
  if (initializationStarted) {
    return;
  }
  initializationStarted = true;

  // Initialize navigation handling
  initializeServiceWorkerNavigation();

  // Register service worker when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerServiceWorker();
    });
  } else {
    // DOM already loaded
    registerServiceWorker();
  }
}

// Auto-initialize when module is imported (client-side only)
// This follows the industry pattern of module-level initialization
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available for better performance, otherwise use setTimeout
  const windowWithIdleCallback = window as WindowWithIdleCallback;
  if (windowWithIdleCallback.requestIdleCallback) {
    windowWithIdleCallback.requestIdleCallback(() => {
      initializeServiceWorker();
    }, { timeout: 2000 });
  } else {
    // Fallback: initialize after a short delay
    setTimeout(() => {
      initializeServiceWorker();
    }, 0);
  }
}

/**
 * Manual service worker update check
 */
export async function checkForServiceWorkerUpdate(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      await registration.update();
    }
  } catch (error) {
    // Silently fail - update check is not critical
  }
}

/**
 * Unregister service worker (for testing/cleanup)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      const success = await registration.unregister();
      if (success) {
        currentRegistration = null;
        toast.success('Service worker kaldırıldı');
      }
      return success;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Get current service worker registration
 * This provides access to registration without using React hooks
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  // Return cached registration if available
  if (currentRegistration) {
    return currentRegistration;
  }

  // Otherwise, try to get existing registration
  try {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      currentRegistration = registration;
      return registration;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if service worker is active
 */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await getServiceWorkerRegistration();
    return registration?.active !== null && registration?.active !== undefined;
  } catch {
    return false;
  }
}
