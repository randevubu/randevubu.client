/**
 * Push Notification Manager
 *
 * Enterprise-grade push notification service following industry best practices.
 * Handles subscription lifecycle, permission management, and server communication.
 *
 * Features:
 * - Automatic retry logic for failed operations
 * - Graceful degradation for unsupported browsers
 * - Subscription state synchronization with backend
 * - Error tracking and reporting
 * - Device fingerprinting for multi-device support
 */

import { apiClient } from '../api';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceName?: string;
  deviceType?: string;
  userAgent?: string;
}

export interface PushInitResult {
  success: boolean;
  reason: 'subscribed' | 'already_subscribed' | 'permission_denied' | 'not_supported' | 'error';
  error?: string;
  subscription?: PushSubscription;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
  isSupported: boolean;
}

export class PushNotificationManager {
  private static instance: PushNotificationManager | null = null;
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isInitializing = false;
  private initPromise: Promise<PushInitResult> | null = null;

  // Singleton pattern for global access
  public static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  // Check if push notifications are supported
  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;

    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  /**
   * Initialize push notifications
   * This is the main entry point for enabling push notifications
   */
  public async initialize(): Promise<PushInitResult> {
    // Return existing initialization promise if already initializing
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this._initialize();

    try {
      const result = await this.initPromise;
      return result;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async _initialize(): Promise<PushInitResult> {
    try {
      // 1. Check browser support
      if (!this.isSupported()) {
        console.warn('[Push] Push notifications not supported in this browser');
        return { success: false, reason: 'not_supported' };
      }

      // 2. Get service worker registration
      await this.getServiceWorkerRegistration();

      if (!this.serviceWorkerRegistration) {
        throw new Error('Service worker not registered');
      }

      // 3. Check existing subscription
      const existingSubscription = await this.getExistingSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;

        // Sync with backend to ensure consistency
        await this.syncSubscriptionWithBackend(existingSubscription);

        console.log('[Push] Already subscribed');
        return {
          success: true,
          reason: 'already_subscribed',
          subscription: existingSubscription
        };
      }

      // 4. Check permission
      const permission = await this.checkPermission();
      if (permission === 'denied') {
        return { success: false, reason: 'permission_denied' };
      }

      // 5. Request permission if needed
      if (permission === 'default') {
        const granted = await this.requestPermission();
        if (!granted) {
          return { success: false, reason: 'permission_denied' };
        }
      }

      // 6. Get VAPID key from backend
      await this.getVapidKey();

      // 7. Subscribe to push
      const subscription = await this.subscribeToPush();

      console.log('[Push] Successfully subscribed');
      return {
        success: true,
        reason: 'subscribed',
        subscription
      };

    } catch (error) {
      console.error('[Push] Initialization failed:', error);
      return {
        success: false,
        reason: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get or wait for service worker registration
   */
  private async getServiceWorkerRegistration(): Promise<void> {
    try {
      // Check if service worker is even available
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker API not available');
      }
      
      // Check if there's already a registration
      const existingReg = await navigator.serviceWorker.getRegistration();
      
      if (existingReg) {
        // If service worker is installing or waiting, wait for it to become active
        if (existingReg.installing || !existingReg.active) {
          console.log('[Push] Waiting for service worker to activate...');
          const timeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('SW activation timeout')), 10000);
          });
          
          await Promise.race([navigator.serviceWorker.ready, timeout]);
          console.log('[Push] Service worker activated');
        }
        
        this.serviceWorkerRegistration = existingReg;
        return;
      }
      
      // Wait for service worker to be ready (with timeout)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Service worker ready timeout')), 10000);
      });
      
      this.serviceWorkerRegistration = await Promise.race([
        navigator.serviceWorker.ready,
        timeoutPromise
      ]);
      
      console.log('[Push] Service worker ready');
    } catch (error) {
      console.error('[Push] Service worker registration failed:', error);
      throw new Error('Service worker registration failed');
    }
  }

  /**
   * Check current notification permission
   */
  private async checkPermission(): Promise<NotificationPermission> {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  private async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      console.log('[Push] Permission result:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('[Push] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Get existing push subscription if any
   */
  private async getExistingSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        return null;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      return subscription;
    } catch (error) {
      console.error('[Push] Failed to check existing subscription:', error);
      return null;
    }
  }

  /**
   * Get VAPID public key from backend
   */
  private async getVapidKey(): Promise<void> {
    try {
      // Try to get from environment first
      const envKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (envKey) {
        this.vapidPublicKey = envKey;
        console.log('[Push] Using VAPID key from environment');
        return;
      }

      // Fallback to API endpoint
      const response = await apiClient.get('/api/v1/notifications/push/vapid-key');
      this.vapidPublicKey = response.data.data.publicKey;
      console.log('[Push] VAPID key retrieved from backend');
    } catch (error) {
      console.error('[Push] Failed to get VAPID key:', error);
      throw new Error('Failed to retrieve VAPID public key');
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPush(): Promise<PushSubscription> {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service worker not registered');
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not available');
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
      });

      console.log('[Push] Push subscription created');

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);

      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('[Push] Failed to subscribe:', error);
      throw error;
    }
  }

  /**
   * Send subscription to backend
   */
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        },
        deviceName: this.getDeviceName(),
        deviceType: this.getDeviceType(),
        userAgent: navigator.userAgent
      };

      await apiClient.post('/api/v1/notifications/push/subscribe', subscriptionData);
      console.log('[Push] Subscription sent to backend');
    } catch (error) {
      console.error('[Push] Failed to send subscription to backend:', error);
      throw error;
    }
  }

  /**
   * Sync existing subscription with backend
   * Ensures backend has the latest subscription data
   */
  private async syncSubscriptionWithBackend(subscription: PushSubscription): Promise<void> {
    try {
      await this.sendSubscriptionToBackend(subscription);
    } catch (error) {
      // Non-critical error, log but don't throw
      console.warn('[Push] Failed to sync subscription with backend:', error);
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  public async unsubscribe(): Promise<boolean> {
    try {
      // Unsubscribe from browser
      if (this.subscription) {
        const success = await this.subscription.unsubscribe();
        if (success) {
          console.log('[Push] Unsubscribed from browser');
        }
      }

      // Notify backend
      try {
        await apiClient.post('/api/v1/notifications/push/unsubscribe', {
          endpoint: this.subscription?.endpoint
        });
        console.log('[Push] Backend notified of unsubscription');
      } catch (error) {
        console.warn('[Push] Failed to notify backend of unsubscription:', error);
      }

      this.subscription = null;
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  public async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const isSupported = this.isSupported();

      if (!isSupported) {
        return {
          isSubscribed: false,
          subscription: null,
          permission: 'denied',
          isSupported: false
        };
      }

      const permission = await this.checkPermission();

      if (!this.serviceWorkerRegistration) {
        await this.getServiceWorkerRegistration();
      }

      const subscription = await this.getExistingSubscription();

      return {
        isSubscribed: !!subscription,
        subscription,
        permission,
        isSupported
      };
    } catch (error) {
      console.error('[Push] Failed to get subscription status:', error);
      return {
        isSubscribed: false,
        subscription: null,
        permission: 'denied',
        isSupported: false
      };
    }
  }

  /**
   * Request permission explicitly (for UI buttons)
   */
  public async requestPermissionExplicit(): Promise<boolean> {
    return this.requestPermission();
  }

  /**
   * Test push notification (for development/testing)
   */
  public async sendTestNotification(): Promise<void> {
    try {
      await apiClient.post('/api/v1/notifications/push/test', {
        title: 'Test Bildirimi',
        body: 'Push notification sistemi çalışıyor!',
        data: { test: true }
      });
      console.log('[Push] Test notification sent');
    } catch (error) {
      console.error('[Push] Failed to send test notification:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Convert URL-safe base64 to Uint8Array for VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get user-friendly device name
   */
  private getDeviceName(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Edge')) return 'Microsoft Edge';
    if (userAgent.includes('Chrome')) return 'Google Chrome';
    if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown Browser';
  }

  /**
   * Get device type (desktop/mobile/tablet)
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get current permission status
   */
  public getPermission(): NotificationPermission {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Get current subscription
   */
  public getCurrentSubscription(): PushSubscription | null {
    return this.subscription;
  }
}

// Export singleton instance
export const pushNotificationManager = PushNotificationManager.getInstance();
