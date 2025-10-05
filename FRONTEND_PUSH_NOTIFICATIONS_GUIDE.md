# Frontend Push Notifications Implementation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Service Worker Setup](#service-worker-setup)
4. [Push Notification Manager](#push-notification-manager)
5. [Integration Points](#integration-points)
6. [User Experience Flow](#user-experience-flow)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Production Considerations](#production-considerations)
10. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This guide explains how to implement push notifications in your PWA frontend to work with your existing backend API. The goal is to provide a seamless user experience where customers are automatically subscribed to push notifications when they use your app.

### Key Components:
- **Service Worker**: Handles push events and displays notifications
- **Push Manager**: Manages subscription lifecycle
- **Permission Handler**: Manages browser permission requests
- **API Integration**: Communicates with your backend

## 🔧 Prerequisites

### Backend Requirements (Already Implemented):
- ✅ VAPID keys configured
- ✅ Push subscription endpoints (`/api/v1/notifications/push/*`)
- ✅ Notification sending infrastructure
- ✅ Database schema for subscriptions

### Frontend Requirements:
- PWA with service worker support
- HTTPS (required for push notifications)
- User authentication system
- API client for backend communication

## 🔧 Service Worker Setup

### 1. Create Service Worker File (`/public/sw.js`)

```javascript
// Service Worker for Push Notifications
const CACHE_NAME = 'randevu-pwa-v1';
const NOTIFICATION_ICON = '/icons/icon-192x192.png';
const NOTIFICATION_BADGE = '/icons/badge-72x72.png';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - This is where notifications are handled
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);
    
    const options = {
      body: data.body,
      icon: data.icon || NOTIFICATION_ICON,
      badge: data.badge || NOTIFICATION_BADGE,
      data: data.data || {},
      tag: data.tag || 'randevu-notification',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      vibrate: data.vibrate || [200, 100, 200],
      silent: data.silent || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const url = data.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (data.url) {
            client.navigate(data.url);
          }
          return;
        }
      }
      
      // Open new window if app is not open
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle offline notification queuing here
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### 2. Register Service Worker (`/src/utils/serviceWorker.js`)

```javascript
// Service Worker Registration
export class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
  }

  async register() {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);
      
      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available, notify user
            this.notifyUpdateAvailable();
          }
        });
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async waitForReady() {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }
    return navigator.serviceWorker.ready;
  }

  notifyUpdateAvailable() {
    // Notify user that app update is available
    if (confirm('A new version of the app is available. Reload to update?')) {
      window.location.reload();
    }
  }

  async unregister() {
    if (this.registration) {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    }
    return false;
  }
}
```

## 🔔 Push Notification Manager

### Create Push Manager (`/src/utils/pushNotificationManager.js`)

```javascript
import { apiClient } from './apiClient'; // Your API client

export class PushNotificationManager {
  constructor() {
    this.isSupported = this.checkSupport();
    this.vapidPublicKey = null;
    this.subscription = null;
    this.serviceWorkerManager = null;
  }

  // Check if push notifications are supported
  checkSupport() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Initialize push notifications
  async initialize(serviceWorkerManager) {
    this.serviceWorkerManager = serviceWorkerManager;
    
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return { success: false, reason: 'not_supported' };
    }

    try {
      // 1. Get VAPID public key
      await this.getVapidKey();
      
      // 2. Check existing subscription
      const existingSubscription = await this.getExistingSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        this.subscription = existingSubscription;
        return { success: true, reason: 'already_subscribed' };
      }

      // 3. Request permission
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return { success: false, reason: 'permission_denied' };
      }

      // 4. Subscribe to push
      await this.subscribeToPush();
      
      return { success: true, reason: 'subscribed' };
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return { success: false, reason: 'error', error: error.message };
    }
  }

  // Get VAPID public key from server
  async getVapidKey() {
    try {
      const response = await apiClient.get('/notifications/push/vapid-key');
      this.vapidPublicKey = response.data.publicKey;
      console.log('VAPID key retrieved');
    } catch (error) {
      console.error('Failed to get VAPID key:', error);
      throw new Error('Failed to get VAPID key');
    }
  }

  // Check if user already has a subscription
  async getExistingSubscription() {
    try {
      const registration = await this.serviceWorkerManager.waitForReady();
      const subscription = await registration.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      console.error('Failed to check existing subscription:', error);
      return null;
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return 'denied';
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    try {
      const registration = await this.serviceWorkerManager.waitForReady();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  }

  // Send subscription to your backend
  async sendSubscriptionToServer(subscription) {
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        },
        deviceName: this.getDeviceName(),
        deviceType: 'web',
        userAgent: navigator.userAgent
      };

      const response = await apiClient.post('/notifications/push/subscribe', subscriptionData);
      console.log('Subscription sent to server:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('Unsubscribed from push notifications');
      }

      // Notify server
      await apiClient.post('/notifications/push/unsubscribe', {
        endpoint: this.subscription?.endpoint
      });

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  // Check subscription status
  async getSubscriptionStatus() {
    try {
      const registration = await this.serviceWorkerManager.waitForReady();
      const subscription = await registration.pushManager.getSubscription();
      
      return {
        isSubscribed: !!subscription,
        subscription: subscription,
        permission: Notification.permission
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return {
        isSubscribed: false,
        subscription: null,
        permission: 'denied'
      };
    }
  }

  // Utility functions
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  getDeviceName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  }
}
```

## 🔗 Integration Points

### 1. App Initialization (`/src/App.js` or main component)

```javascript
import React, { useEffect, useState } from 'react';
import { ServiceWorkerManager } from './utils/serviceWorker';
import { PushNotificationManager } from './utils/pushNotificationManager';

function App() {
  const [pushManager, setPushManager] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // 1. Register service worker
      const swManager = new ServiceWorkerManager();
      const swRegistered = await swManager.register();
      
      if (!swRegistered) {
        console.log('Service Worker registration failed');
        return;
      }

      // 2. Initialize push manager
      const pushMgr = new PushNotificationManager();
      const result = await pushMgr.initialize(swManager);
      
      setPushManager(pushMgr);
      setNotificationPermission(Notification.permission);
      
      console.log('Push notifications initialized:', result);
      
      // 3. Show success message to user
      if (result.success && result.reason === 'subscribed') {
        showNotificationSuccess();
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const showNotificationSuccess = () => {
    // Show a toast or message that notifications are enabled
    console.log('Push notifications enabled successfully!');
  };

  return (
    <div className="App">
      {/* Your app content */}
      <NotificationSettings 
        pushManager={pushManager}
        permission={notificationPermission}
        onPermissionChange={setNotificationPermission}
      />
    </div>
  );
}

export default App;
```

### 2. Login Integration (`/src/components/Login.js`)

```javascript
import { useEffect } from 'react';
import { PushNotificationManager } from '../utils/pushNotificationManager';

function Login({ onLoginSuccess }) {
  const handleLogin = async (credentials) => {
    try {
      // 1. Authenticate user
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // 2. Store token
      localStorage.setItem('authToken', token);
      
      // 3. Initialize push notifications after successful login
      await initializePushAfterLogin();
      
      // 4. Call success callback
      onLoginSuccess(user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const initializePushAfterLogin = async () => {
    try {
      const swManager = new ServiceWorkerManager();
      await swManager.register();
      
      const pushManager = new PushNotificationManager();
      const result = await pushManager.initialize(swManager);
      
      if (result.success) {
        console.log('Push notifications enabled after login');
      }
    } catch (error) {
      console.error('Failed to initialize push after login:', error);
    }
  };

  return (
    <div className="login-form">
      {/* Your login form */}
    </div>
  );
}
```

### 3. Settings Component (`/src/components/NotificationSettings.js`)

```javascript
import React, { useState, useEffect } from 'react';

function NotificationSettings({ pushManager, permission, onPermissionChange }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [pushManager]);

  const checkSubscriptionStatus = async () => {
    if (!pushManager) return;
    
    const status = await pushManager.getSubscriptionStatus();
    setIsSubscribed(status.isSubscribed);
  };

  const handleToggleNotifications = async () => {
    if (!pushManager) return;
    
    setIsLoading(true);
    
    try {
      if (isSubscribed) {
        await pushManager.unsubscribe();
        setIsSubscribed(false);
      } else {
        const result = await pushManager.initialize();
        if (result.success) {
          setIsSubscribed(true);
        }
      }
      
      onPermissionChange(Notification.permission);
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionText = () => {
    switch (permission) {
      case 'granted': return 'Notifications are enabled';
      case 'denied': return 'Notifications are blocked';
      case 'default': return 'Notifications not requested';
      default: return 'Unknown status';
    }
  };

  return (
    <div className="notification-settings">
      <h3>Notification Settings</h3>
      
      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={isSubscribed && permission === 'granted'}
            onChange={handleToggleNotifications}
            disabled={isLoading || !pushManager}
          />
          Enable Push Notifications
        </label>
        <p className="permission-status">{getPermissionText()}</p>
      </div>
      
      {permission === 'denied' && (
        <div className="permission-help">
          <p>Notifications are blocked. To enable them:</p>
          <ol>
            <li>Click the lock icon in your browser's address bar</li>
            <li>Set notifications to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default NotificationSettings;
```

## 🎭 User Experience Flow

### 1. First Visit Flow
```
User opens PWA
    ↓
App checks push support
    ↓
If supported → Show subtle notification prompt
    ↓
User clicks "Enable Notifications"
    ↓
Browser asks for permission
    ↓
If granted → Auto-subscribe + Show success
If denied → Remember choice, don't ask again
```

### 2. Returning User Flow
```
User opens PWA
    ↓
App checks existing subscription
    ↓
If subscribed → Continue normally
If not subscribed → Show enable button in settings
```

### 3. Permission Denied Flow
```
User denies permission
    ↓
App remembers choice
    ↓
Show settings option to enable later
    ↓
Provide instructions to change browser settings
```

## ⚠️ Error Handling

### Common Error Scenarios

```javascript
// Error handling in PushNotificationManager
class PushNotificationManager {
  async initialize(serviceWorkerManager) {
    try {
      // ... initialization code
    } catch (error) {
      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        return { success: false, reason: 'permission_denied' };
      } else if (error.name === 'NotSupportedError') {
        return { success: false, reason: 'not_supported' };
      } else if (error.message.includes('VAPID')) {
        return { success: false, reason: 'server_error' };
      } else {
        return { success: false, reason: 'unknown_error', error: error.message };
      }
    }
  }
}

// User-friendly error messages
const getErrorMessage = (reason) => {
  switch (reason) {
    case 'not_supported':
      return 'Your browser does not support push notifications';
    case 'permission_denied':
      return 'Notifications are blocked. Please enable them in your browser settings';
    case 'server_error':
      return 'Unable to connect to notification service. Please try again later';
    default:
      return 'Failed to enable notifications. Please try again';
  }
};
```

## 🧪 Testing

### 1. Development Testing

```javascript
// Test push notification functionality
class PushNotificationTester {
  static async testSubscription() {
    const pushManager = new PushNotificationManager();
    const swManager = new ServiceWorkerManager();
    
    await swManager.register();
    const result = await pushManager.initialize(swManager);
    
    console.log('Test result:', result);
    return result;
  }
  
  static async testNotification() {
    // Send test notification via your API
    try {
      const response = await apiClient.post('/notifications/push/test', {
        title: 'Test Notification',
        body: 'This is a test push notification',
        data: { test: true }
      });
      console.log('Test notification sent:', response.data);
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  }
}

// Use in browser console
PushNotificationTester.testSubscription();
PushNotificationTester.testNotification();
```

### 2. Browser Testing

1. **Chrome DevTools**:
   - Application → Service Workers
   - Application → Storage → IndexedDB
   - Console for error messages

2. **Service Worker Internals**:
   - `chrome://serviceworker-internals/`
   - Check if your domain appears
   - Verify push subscription exists

3. **Network Tab**:
   - Check API calls to subscription endpoints
   - Verify VAPID key retrieval
   - Monitor subscription requests

### 3. Manual Testing Steps

```bash
# 1. Test VAPID key endpoint
curl http://localhost:3000/api/v1/notifications/push/vapid-key

# 2. Test health check
curl http://localhost:3000/api/v1/notifications/push/health

# 3. Test subscription (after frontend implementation)
curl -X POST http://localhost:3000/api/v1/notifications/push/subscribe \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"...","keys":{...}}'

# 4. Test notification sending
curl -X POST http://localhost:3000/api/v1/notifications/push/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Testing"}'
```

## 🚀 Production Considerations

### 1. HTTPS Requirement
- Push notifications only work over HTTPS
- Ensure your production domain has valid SSL certificate
- Test on both HTTP (localhost) and HTTPS (production)

### 2. Service Worker Caching
```javascript
// Add caching strategy to service worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // API calls - network first
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  } else {
    // Static assets - cache first
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});
```

### 3. Error Monitoring
```javascript
// Add error tracking
class PushNotificationManager {
  async initialize(serviceWorkerManager) {
    try {
      // ... initialization
    } catch (error) {
      // Send error to monitoring service
      this.reportError('push_initialization_failed', error);
      throw error;
    }
  }
  
  reportError(type, error) {
    // Send to your error tracking service (Sentry, LogRocket, etc.)
    console.error(`Push notification error [${type}]:`, error);
  }
}
```

### 4. Performance Optimization
```javascript
// Lazy load push manager
const initializePushNotifications = async () => {
  // Only initialize when needed
  if (userIsLoggedIn && !pushManagerInitialized) {
    const { PushNotificationManager } = await import('./utils/pushNotificationManager');
    // ... initialize
  }
};
```

## 🔧 Troubleshooting

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Push notifications not supported" | Browser doesn't support push | Check browser compatibility |
| "Permission denied" | User denied permission | Guide user to browser settings |
| "VAPID key not found" | Server not configured | Check VAPID keys in environment |
| "Service worker not registered" | SW file not found | Ensure `/public/sw.js` exists |
| "Subscription failed" | Network/server error | Check API endpoints and authentication |
| "Notifications not showing" | SW not handling push events | Check service worker implementation |

### Debug Checklist

```javascript
// Debug function to check everything
async function debugPushNotifications() {
  console.log('=== Push Notification Debug ===');
  
  // 1. Check support
  console.log('Push supported:', 'serviceWorker' in navigator && 'PushManager' in window);
  
  // 2. Check permission
  console.log('Permission:', Notification.permission);
  
  // 3. Check service worker
  const registration = await navigator.serviceWorker.getRegistration();
  console.log('SW registered:', !!registration);
  
  // 4. Check subscription
  if (registration) {
    const subscription = await registration.pushManager.getSubscription();
    console.log('Subscribed:', !!subscription);
    console.log('Endpoint:', subscription?.endpoint);
  }
  
  // 5. Check VAPID key
  try {
    const response = await fetch('/api/v1/notifications/push/vapid-key');
    const data = await response.json();
    console.log('VAPID key available:', !!data.data.publicKey);
  } catch (error) {
    console.log('VAPID key error:', error.message);
  }
  
  console.log('=== End Debug ===');
}

// Run in browser console
debugPushNotifications();
```

## 📱 Mobile Considerations

### iOS Safari
- Limited push notification support
- Requires specific implementation
- May need additional configuration

### Android Chrome
- Full support for push notifications
- Works with PWA installation
- Background sync available

### Testing on Mobile
```javascript
// Detect mobile device
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  // Show mobile-specific instructions
  console.log('Mobile device detected - push notifications should work');
}
```

## 🎯 Implementation Checklist

- [ ] Create service worker file (`/public/sw.js`)
- [ ] Implement ServiceWorkerManager class
- [ ] Implement PushNotificationManager class
- [ ] Add service worker registration to app initialization
- [ ] Add push notification initialization after login
- [ ] Create notification settings UI component
- [ ] Add error handling and user feedback
- [ ] Test on different browsers and devices
- [ ] Test with your backend API endpoints
- [ ] Add production optimizations
- [ ] Set up error monitoring
- [ ] Test offline scenarios

## 🚀 Next Steps

1. **Start with Service Worker**: Implement the basic service worker first
2. **Add Push Manager**: Create the push notification manager class
3. **Integrate with App**: Add initialization to your main app component
4. **Test Thoroughly**: Use the testing checklist above
5. **Handle Edge Cases**: Implement proper error handling
6. **Optimize for Production**: Add caching and performance optimizations

This implementation will provide a seamless push notification experience for your users, automatically subscribing them when they use your PWA and handling all the technical complexity behind the scenes.
