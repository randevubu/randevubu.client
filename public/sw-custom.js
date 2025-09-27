// RandevuBu Custom Service Worker with Push Notification Support
// This combines PWA caching with push notification handling

const CACHE_NAME = 'randevubu-v1';
const API_CACHE_NAME = 'randevubu-api-v1';

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential assets');
      return cache.addAll([
        '/',
        '/offline.html'
      ].filter(url => {
        // Only cache if files exist
        return true;
      })).catch(err => {
        console.warn('[Service Worker] Some assets failed to cache:', err);
      });
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

  // API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }

  // Other requests - cache first
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      })
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
    icon: '/icon-192.png',
    badge: '/badge-72.png',
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