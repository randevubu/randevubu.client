import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceName?: string;
  deviceType?: string;
}

interface VapidKeyResponse {
  publicKey: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey: string | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Check if push notifications are supported in this browser
   */
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Check current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      throw new Error('Push notifications are blocked. Please enable them in your browser settings.');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Get VAPID public key from backend (User Level)
   */
  async getVapidPublicKey(): Promise<string> {
    if (this.vapidPublicKey) {
      return this.vapidPublicKey;
    }

    try {
      const response = await apiClient.get<ApiResponse<VapidKeyResponse>>('/api/v1/notifications/push/vapid-key');

      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to get VAPID public key');
      }

      this.vapidPublicKey = response.data.data.publicKey;
      return this.vapidPublicKey;
    } catch (error) {
      console.error('Error getting VAPID public key:', error);

      // TEMPORARY: Use VAPID key from environment for development testing
      // Replace this with your actual backend endpoint in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('[DEV] Using VAPID key from environment - replace with real backend endpoint');
        this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BN6yWsGKd4MpPimb4VyGBdUt2nz5uOd6Pmi2KTz8SeR6Z37VYVjpBkKxSsln1ZgivnZL6LFNLoeP-azWtIH6PcI';
        return this.vapidPublicKey;
      }

      throw new Error('Failed to get VAPID public key');
    }
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
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

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Service Worker not supported');
    }

    try {
      // Check if service worker is already registered
      const existingRegistration = await navigator.serviceWorker.getRegistration('/');
      if (existingRegistration) {
        console.log('Service Worker already registered:', existingRegistration);
        return existingRegistration;
      }

      // Try to register our custom service worker with push support
      const registration = await navigator.serviceWorker.register('/sw-custom.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });

      console.log('Service Worker registered:', registration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker is ready');

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw new Error(`Failed to register service worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current push subscription
   */
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  /**
   * Check if user is subscribed to push notifications
   */
  async isSubscribed(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    return !!subscription;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<ApiResponse<any>> {
    try {
      // 1. Check browser support
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported in this browser');
      }

      // 2. Register service worker
      await this.registerServiceWorker();

      // 3. Check if already subscribed and unsubscribe first (to fix VAPID mismatch)
      const existingSubscription = await this.getCurrentSubscription();
      if (existingSubscription) {
        console.log('Found existing subscription, unsubscribing first to prevent VAPID mismatch...');
        try {
          await this.unsubscribe();
          console.log('Successfully unsubscribed from existing subscription');
        } catch (unsubscribeError) {
          console.warn('Failed to unsubscribe properly, continuing with new subscription:', unsubscribeError);
        }
      }

      // 4. Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Notification permission denied');
      }

      // 5. Get VAPID public key
      const vapidPublicKey = await this.getVapidPublicKey();

      // 6. Subscribe to push manager with current VAPID key
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      console.log('Created new push subscription with current VAPID key');

      // 7. Send subscription to server
      return await this.sendSubscriptionToServer(subscription);

    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Send subscription data to backend (User Level)
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<ApiResponse<any>> {
    try {
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        throw new Error('Unable to get subscription keys');
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
          auth: btoa(String.fromCharCode(...new Uint8Array(authKey)))
        },
        deviceName: navigator.userAgent,
        deviceType: 'web'
      };

      // Use the correct user-level push subscription endpoint
      const response = await apiClient.post<ApiResponse<any>>('/api/v1/notifications/push/subscribe', subscriptionData);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to subscribe');
      }

      console.log('Successfully subscribed to push notifications (User Level):', response.data);
      return response.data;

    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log('No subscription found');
        return;
      }

      let browserUnsubscribed = false;
      let serverNotified = false;

      // Unsubscribe from browser
      try {
        await subscription.unsubscribe();
        browserUnsubscribed = true;
        console.log('Successfully unsubscribed from browser push manager');
      } catch (browserError) {
        console.error('Failed to unsubscribe from browser:', browserError);
      }

      // Notify server (even if browser unsubscribe failed) - User Level endpoint
      try {
        await apiClient.post('/api/v1/notifications/push/unsubscribe', {
          endpoint: subscription.endpoint
        });
        serverNotified = true;
        console.log('Successfully notified server of unsubscription (User Level)');
      } catch (serverError) {
        console.error('Failed to notify server of unsubscription:', serverError);
        // Don't throw - browser unsubscribe is more important
      }

      if (browserUnsubscribed) {
        console.log('Successfully unsubscribed from push notifications');
      } else {
        throw new Error('Failed to unsubscribe from browser push manager');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }

  /**
   * Test push notification (Business Level)
   */
  async testNotification(message?: string): Promise<ApiResponse<any>> {
    try {
      // Use the business-level test endpoint
      const response = await apiClient.post<ApiResponse<any>>('/api/v1/businesses/my-business/test-reminder', {
        channels: ['PUSH'],
        customMessage: message || 'Bu, push bildirim ayarlarınızın test mesajıdır.'
      });

      return response.data;
    } catch (error) {
      console.error('Error testing notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();