'use client';

// Handle navigation messages from service worker
export function setupServiceWorkerNavigation() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NAVIGATE') {
      const url = event.data.url;
      
      // Use Next.js router or window.location for navigation
      if (url && typeof window !== 'undefined') {
        // Check if we're already on the target page
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== url) {
          window.location.href = url;
        }
      }
    }
  });
}

// Initialize service worker navigation on app start
export function initializeServiceWorkerNavigation() {
  if (typeof window !== 'undefined') {
    // Set up navigation handling when the app loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupServiceWorkerNavigation);
    } else {
      setupServiceWorkerNavigation();
    }
  }
}