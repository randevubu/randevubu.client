// Randevubu Service Worker with Push Notifications Support - Development Version
console.log('[SW] Development service worker loaded');

// Skip Workbox precaching in development to avoid manifest issues
// self.skipWaiting();

// ================================
// PUSH NOTIFICATION HANDLERS
// ================================

// Handle push events
self.addEventListener('push', function (event) {
  console.log('[SW] Push event received:', event);

  if (!event.data) {
    console.log('[SW] Push event has no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('[SW] Failed to parse push data:', error);
    data = {
      title: 'Randevubu Bildirimi',
      body: event.data.text() || 'Yeni bir bildiriminiz var'
    };
  }

  console.log('[SW] Push notification data:', data);

  const options = {
    body: data.body || 'Yeni bir bildiriminiz var',
    icon: data.icon || '/icon-192.svg',
    badge: data.badge || '/icon-192.svg',
    image: data.image,
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: Date.now(),
    actions: data.actions || [],
    tag: data.tag || 'randevubu-notification',
    renotify: data.renotify || false,
    vibrate: data.vibrate || [200, 100, 200]
  };

  const title = data.title || 'Randevubu';

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[SW] Notification shown successfully');
      })
      .catch(error => {
        console.error('[SW] Failed to show notification:', error);
      })
  );
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
  console.log('[SW] Notification click received:', event);

  event.notification.close();

  // Get the URL to open (default to dashboard)
  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        console.log('[SW] Found clients:', clientList.length);

        // Check if app is already open and focus it
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            console.log('[SW] Focusing existing client');
            return client.focus();
          }
        }

        // Check if any client is open and navigate it
        for (const client of clientList) {
          if ('navigate' in client) {
            console.log('[SW] Navigating existing client to:', urlToOpen);
            return client.navigate(urlToOpen).then(() => client.focus());
          }
        }

        // Otherwise open new tab
        if (clients.openWindow) {
          console.log('[SW] Opening new window:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch(error => {
        console.error('[SW] Error handling notification click:', error);
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function (event) {
  console.log('[SW] Notification closed:', event);

  // You can track notification close events here
  // For example, send analytics data to your server
});

// Handle background sync (optional, for offline scenarios)
self.addEventListener('sync', function (event) {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'background-sync-notification') {
    event.waitUntil(
      // Handle offline notification sync if needed
      Promise.resolve()
    );
  }
});

console.log('[SW] Service Worker with push notifications loaded');