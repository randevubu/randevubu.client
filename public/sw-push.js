// Service Worker for Push Notifications
// This file handles push notifications for the RandevuBu application

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
        actions: payload.actions || []
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

  // Default click behavior - open the app
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

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated');
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
  self.skipWaiting();
});

console.log('[Service Worker] Push notification handler loaded');