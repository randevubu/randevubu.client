/**
 * Service Worker Registration Utility
 * Industry-standard approach: module-level initialization without React hooks
 * Based on patterns used by Google, Facebook, and other major PWAs
 * 
 * Follows project rules from rules.md:
 * - Error handling separated from business logic
 * - Toast fallback to console if providers not ready
 * - Type safety with proper error types
 */

import { initializeServiceWorkerNavigation } from './serviceWorkerNavigation';

// Type guard for requestIdleCallback (not available in all browsers)
interface WindowWithIdleCallback {
  requestIdleCallback?: typeof window.requestIdleCallback;
}

/**
 * Safe toast notification with fallback to console
 * Prevents errors if toast provider not yet mounted
 * Following error handling best practices from rules.md
 */
function notifyUser(message: string, type: 'success' | 'error' = 'success'): void {
  try {
    // Lazy import toast only when needed (prevents early binding issues)
    const { default: toast } = require('react-hot-toast');
    
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  } catch (error) {
    // Fallback to console if toast not available
    // This can happen if SW registers before React providers mount
    if (type === 'error') {
      console.error('[Service Worker]', message);
    } else {
      console.log('[Service Worker]', message);
    }
  }
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
      startHealthCheckInterval(); // Start health checks for existing SW
      return existingRegistration;
    }

    // Register new service worker
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
    });

    currentRegistration = registration;

    // Set up update listeners and health checks
    setupUpdateListeners(registration);
    startHealthCheckInterval(); // Monitor SW health

    return registration;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Service worker kayıt edilemedi';
    notifyUser(errorMessage, 'error');
    return null;
  }
}

/**
 * Check service worker health with timeout
 * Follows project rules: separation of concerns, error handling
 * Per rules.md: proper error handling without side effects in registration
 * 
 * @returns true if SW responds within timeout, false otherwise
 */
async function checkServiceWorkerHealth(): Promise<boolean> {
  try {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return false;

    // Send health check message and wait for response
    const response = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
        resolve(false); // Timeout = unhealthy
      }, 5000);

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'HEALTH_CHECK_RESPONSE') {
          clearTimeout(timeout);
          navigator.serviceWorker.removeEventListener('message', handleMessage);
          resolve(true);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      controller.postMessage({ type: 'HEALTH_CHECK' });
    });

    return response;
  } catch (error) {
    console.warn('[Service Worker] Health check failed:', error);
    return false;
  }
}

/**
 * Periodically check service worker health
 * Logs warnings if SW becomes unresponsive
 * Only started after successful registration
 */
function startHealthCheckInterval(): void {
  // Check every 30 minutes (1800000ms)
  setInterval(async () => {
    const isHealthy = await checkServiceWorkerHealth();
    if (!isHealthy) {
      console.warn('[Service Worker] Health check failed - SW may be unresponsive');
    }
  }, 30 * 60 * 1000);
}

/**
 * Set up listeners for service worker updates
 * Only shows notifications for actual updates, not first install or re-registrations
 * Uses safe notification fallback per rules.md error handling best practices
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
          notifyUser('Yeni güncelleme mevcut! Sayfayı yenileyebilirsiniz.', 'success');
        } else {
          // No active controller means this is the first install
          // Service worker state naturally prevents duplicate toasts:
          // - updatefound event only fires when a NEW service worker starts installing
          // - Once installed and activated, controller will never be null again
          notifyUser('Uygulama çevrimdışı kullanım için hazırlandı!', 'success');
        }
      }
    });
  });

  // Handle controller change - DON'T force reload, let user choose
  // Per rules.md error handling & UX best practices
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (registration.waiting) {
      notifyUser(
        'App updated! Refresh the page to see changes.',
        'success'
      );
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
        notifyUser('Service worker kaldırıldı', 'success');
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
