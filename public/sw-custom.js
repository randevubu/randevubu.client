// RandevuBu Custom Service Worker with Push Notification Support
// This combines PWA caching with push notification handling

const CACHE_NAME = 'randevubu-v1';
const API_CACHE_NAME = 'randevubu-api-v1';

// Workbox will inject the manifest here
// This is required when using InjectManifest mode
const manifest = self.__WB_MANIFEST || [];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential assets');
      // Cache manifest files from Workbox
      const manifestUrls = manifest.map(entry => entry.url || entry);
      // Add additional essential assets
      const essentialAssets = [
        '/',
        '/offline.html'
      ];
      
      // Cache files individually to prevent one failure from blocking all
      const allUrls = [...manifestUrls, ...essentialAssets];
      return Promise.allSettled(
        allUrls.map(url => 
          cache.add(url).catch(err => {
            console.warn('[Service Worker] Failed to cache:', url, err);
          })
        )
      );
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - network first, no caching in development
  if (url.pathname.startsWith('/api/')) {
    // In development (no Node globals in SW), detect via hostname instead of process.env
    const isDev = self.location && (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1');
    if (isDev) {
      event.respondWith(fetch(request));
      return;
    }
    
    event.respondWith(
      fetch(request)
        .then(response => {
          // Only cache successful GET API responses in production
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache (only for GET requests)
          if (request.method === 'GET') {
            return caches.match(request);
          }
          // For non-GET requests, return a network error response
          return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Other requests - network first in development, cache first in production
  event.respondWith(
    (() => {
      // In development, always try network first to avoid stale content
      const isDev = self.location && (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1');
      if (isDev) {
        return fetch(request)
          .then(response => {
            // Cache successful GET responses only (POST requests cannot be cached)
            if (response.ok && request.method === 'GET') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(request).then(response => {
              if (response) {
                return response;
              }
              // Return offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
              // Return a 404 response for other failed requests
              return new Response('Not found', { status: 404 });
            });
          });
      }
      
      // Production: cache first
      return caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          // Try to fetch from network
          return fetch(request).catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            // Return a 404 response for other failed requests
            return new Response('Not found', { status: 404 });
          });
        });
    })()
  );
});

// ============================================
// PUSH NOTIFICATION HANDLERS
// ============================================

// Push event - receive and display notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);

  let notificationData = {
    title: 'RandevuBu',
    body: 'Yeni bir bildiriminiz var',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[Service Worker] Push payload:', payload);

      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || payload.message || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || 'randevubu-notification',
        data: payload.data || {},
        requireInteraction: payload.requireInteraction || false,
        vibrate: [200, 100, 200],
        actions: payload.actions || [
          { action: 'view', title: 'Görüntüle' },
          { action: 'dismiss', title: 'Kapat' }
        ]
      };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push payload:', error);
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      actions: notificationData.actions
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  // Handle action buttons
  if (event.action) {
    console.log('[Service Worker] Notification action clicked:', event.action);

    switch (event.action) {
      case 'view':
        event.waitUntil(
          clients.openWindow(event.notification.data?.url || '/dashboard/appointments')
        );
        return;
      case 'reschedule':
        event.waitUntil(
          clients.openWindow(event.notification.data?.rescheduleUrl || '/dashboard/appointments')
        );
        return;
      case 'accept':
        event.waitUntil(
          clients.openWindow(event.notification.data?.acceptUrl || '/dashboard/appointments')
        );
        return;
      case 'dismiss':
        return;
      default:
        break;
    }
  }

  // Default click behavior - focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event);

  // Track notification dismissal if needed
  if (event.notification.data?.trackDismissal) {
    event.waitUntil(
      fetch('/api/v1/push-notifications/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: event.notification.data.id,
          action: 'dismissed'
        })
      }).catch(err => console.error('[Service Worker] Failed to track dismissal:', err))
    );
  }
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Push subscription changed');

  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey
    }).then(subscription => {
      console.log('[Service Worker] Re-subscribed:', subscription);

      // Send new subscription to server
      return fetch('/api/v1/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
          }
        })
      });
    }).catch(err => {
      console.error('[Service Worker] Failed to re-subscribe:', err);
    })
  );
});

console.log('[Service Worker] RandevuBu Service Worker with Push Notifications loaded');