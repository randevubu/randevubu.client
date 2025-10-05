import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { initializeServiceWorkerNavigation } from '../utils/serviceWorkerNavigation';

interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  isRegistered: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  isActive: boolean;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    registration: null,
    isSupported: false,
    isRegistered: false,
    isInstalling: false,
    isWaiting: false,
    isActive: false,
    error: null,
  });

  useEffect(() => {
    // Check if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setState(prev => ({ ...prev, isSupported: true }));

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        // In development, use sw-custom.js to avoid stale build manifest errors
        // In production, use the generated sw.js with workbox precaching
        const swPath = process.env.NODE_ENV === 'development' ? '/sw-custom.js' : '/sw.js';
        console.log('[useServiceWorker] Registering:', swPath);
        
        const registration = await navigator.serviceWorker.register(swPath, {
          scope: '/',
        });

        setState(prev => ({
          ...prev,
          registration,
          isRegistered: true,
          isInstalling: registration.installing !== null,
          isWaiting: registration.waiting !== null,
          isActive: registration.active !== null,
          error: null,
        }));

        // Listen for service worker state changes
        if (registration.installing) {
          registration.installing.addEventListener('statechange', handleStateChange);
        }

        if (registration.waiting) {
          registration.waiting.addEventListener('statechange', handleStateChange);
        }

        if (registration.active) {
          registration.active.addEventListener('statechange', handleStateChange);
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            setState(prev => ({ ...prev, isInstalling: true }));
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  toast.success('Yeni güncelleme mevcut! Sayfayı yenileyebilirsiniz.', {
                    duration: 6000,
                  });
                } else {
                  // Content is cached for offline use
                  toast.success('Uygulama çevrimdışı kullanım için hazırlandı!');
                }
                setState(prev => ({ ...prev, isInstalling: false, isWaiting: true }));
              }
            });
          }
        });

      } catch (error) {
        console.error('Service worker registration failed:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Registration failed',
        }));
        toast.error('Service worker kayıt edilemedi');
      }
    };

    // Handle service worker state changes
    const handleStateChange = (event: Event) => {
      const worker = event.target as ServiceWorker;
      setState(prev => ({
        ...prev,
        isInstalling: worker.state === 'installing',
        isWaiting: worker.state === 'installed',
        isActive: worker.state === 'activated',
      }));
    };

    // Initialize service worker navigation
    initializeServiceWorkerNavigation();
    
    // Register the service worker
    registerServiceWorker();

    // Listen for controller changes (when a new service worker takes control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (state.isWaiting) {
        window.location.reload();
      }
    });

  }, [state.isWaiting]);

  // Function to update service worker
  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Function to unregister service worker
  const unregisterServiceWorker = async () => {
    if (state.registration) {
      const success = await state.registration.unregister();
      if (success) {
        setState(prev => ({
          ...prev,
          registration: null,
          isRegistered: false,
          isInstalling: false,
          isWaiting: false,
          isActive: false,
        }));
        toast.success('Service worker kaldırıldı');
      }
    }
  };

  return {
    ...state,
    updateServiceWorker,
    unregisterServiceWorker,
  };
}