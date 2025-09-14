import { apiClient } from '../api';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationSettings {
  enableAppointmentReminders: boolean;
  enableBusinessNotifications: boolean;
  enablePromotionalMessages: boolean;
  reminderTiming: {
    hours: number[];
  };
  preferredChannels: {
    channels: string[];
  };
  quietHours: {
    start: string;
    end: string;
    timezone: string;
  } | null;
  timezone: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey: string | null = null;

  // Initialize the notification service
  async initialize(registration: ServiceWorkerRegistration): Promise<boolean> {
    try {
      this.registration = registration;
      
      // Get VAPID key from backend
      this.vapidPublicKey = await this.getVapidPublicKey();
      if (!this.vapidPublicKey) {
        throw new Error('Failed to get VAPID key from server');
      }
      
      // Check if we already have a subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
      }
      
      return true;
    } catch (error) {
      console.error('Notification service initialization failed:', error);
      return false;
    }
  }

  // Get VAPID public key from backend
  private async getVapidPublicKey(): Promise<string | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/notifications/push/vapid-key`);
      const data = await response.json();
      return data.success ? data.data.publicKey : null;
    } catch (error) {
      console.error('Failed to get VAPID key:', error);
      return null;
    }
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    if (this.getPermissionStatus() !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      if (!this.vapidPublicKey) {
        throw new Error('VAPID key not available');
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      this.subscription = subscription;

      // Send subscription to your backend
      await this.sendSubscriptionToBackend(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe for push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<void> {
    if (!this.subscription) {
      return;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Remove subscription from backend
      await this.removeSubscriptionFromBackend(this.subscription);
      
      this.subscription = null;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // Get current subscription
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Check if user is subscribed
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  // Send subscription to backend
  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    const subscriptionPayload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
      },
      deviceName: this.getDeviceName(),
      deviceType: 'web',
      userAgent: navigator.userAgent,
    };

    try {
      await apiClient.post('/api/v1/notifications/push/subscribe', subscriptionPayload);
    } catch (error) {
      console.error('Failed to send subscription to backend:', error);
      throw error;
    }
  }

  // Remove subscription from backend
  private async removeSubscriptionFromBackend(subscription: PushSubscription): Promise<void> {
    try {
      await apiClient.post('/api/v1/notifications/push/unsubscribe', {
        endpoint: subscription.endpoint,
      });
    } catch (error) {
      console.error('Failed to remove subscription from backend:', error);
      // Don't throw error here as local unsubscribe should still work
    }
  }

  // Update notification settings
  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      await apiClient.put('/api/v1/notifications/push/preferences', settings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get('/api/v1/notifications/push/preferences');
      return response.data.success ? response.data.data : this.getDefaultSettings();
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Get default settings
  private getDefaultSettings(): NotificationSettings {
    return {
      enableAppointmentReminders: true,
      enableBusinessNotifications: true,
      enablePromotionalMessages: false,
      reminderTiming: {
        hours: [1, 24],
      },
      preferredChannels: {
        channels: ['PUSH'],
      },
      quietHours: null,
      timezone: 'Europe/Istanbul',
    };
  }

  // Send a test notification
  async sendTestNotification(data?: { title?: string; body?: string }): Promise<void> {
    if (!this.isSupported() || !this.isSubscribed()) {
      throw new Error('Notifications not available');
    }

    try {
      // Don't include icon field - let the backend handle it or use its default
      await apiClient.post('/api/v1/notifications/push/test', {
        title: data?.title || 'Test Notification',
        body: data?.body || 'This is a test push notification from your PWA!',
        data: { test: true },
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  // Show a local notification (for immediate feedback)
  showLocalNotification(payload: NotificationPayload): void {
    if (!this.isSupported() || this.getPermissionStatus() !== 'granted') {
      console.warn('Cannot show local notification: not supported or permission denied');
      return;
    }

    // Use absolute URLs for icons, or omit them
    const getAbsoluteIconUrl = (iconPath?: string) => {
      if (!iconPath || typeof window === 'undefined') return undefined;
      if (iconPath.startsWith('http')) return iconPath;
      return `${window.location.origin}${iconPath}`;
    };

    const options: NotificationOptions = {
      body: payload.body,
      icon: getAbsoluteIconUrl(payload.icon),
      badge: getAbsoluteIconUrl(payload.badge),
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
    };

    // Note: actions are handled by service worker, not direct Notification constructor
    new Notification(payload.title, options);
  }

  // Convert VAPID key to Uint8Array
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

  // Convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return window.btoa(binary);
  }

  // Get device name for registration
  private getDeviceName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }
}

// Export singleton instance
export const notificationService = new NotificationService();


// Notification error handling
export class NotificationError extends Error {
  public code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'NotificationError';
    this.code = code;
  }
}

export function handleNotificationError(error: any): string {
  console.error('Notification error:', error);
  
  switch (error.code || error.name) {
    case 'NotAllowedError':
      return 'Lütfen tarayıcı ayarlarından bildirimlere izin verin';
    case 'AbortError':
      return 'Bildirim isteği iptal edildi';
    case 'NotSupportedError':
      return 'Push bildirimleri bu cihazda desteklenmiyor';
    default:
      return 'Bildirimlerle ilgili bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

export function formatNotificationPayload(
  type: 'appointment_reminder' | 'new_appointment' | 'cancellation' | 'promotion',
  data: any
): NotificationPayload {
  // Helper function to get absolute icon URL if needed
  const getIconUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/icon-192.svg`;
    }
    return undefined; // Let backend handle icon
  };

  switch (type) {
    case 'appointment_reminder':
      return {
        title: 'Randevu Hatırlatması',
        body: `${data.serviceName} randevunuz ${data.time} saatinde`,
        tag: `appointment-${data.id}`,
        data: { appointmentId: data.id, url: '/dashboard/appointments' },
        actions: [
          { action: 'view', title: 'Görüntüle' },
          { action: 'reschedule', title: 'Yeniden Planla' },
        ],
      };
    
    case 'new_appointment':
      return {
        title: 'Yeni Randevu',
        body: `${data.customerName} tarafından ${data.serviceName} için randevu alındı`,
        tag: `new-appointment-${data.id}`,
        data: { appointmentId: data.id, url: '/dashboard/appointments' },
        actions: [
          { action: 'accept', title: 'Onayla' },
          { action: 'view', title: 'Görüntüle' },
        ],
      };
    
    case 'cancellation':
      return {
        title: 'Randevu İptal Edildi',
        body: `${data.serviceName} randevunuz iptal edildi`,
        tag: `cancellation-${data.id}`,
        data: { appointmentId: data.id, url: '/dashboard/appointments' },
      };
    
    case 'promotion':
      return {
        title: data.title || 'Özel Kampanya',
        body: data.message,
        tag: 'promotion',
        data: { url: data.url || '/dashboard' },
      };
    
    default:
      return {
        title: 'RandevuBu',
        body: 'Yeni bir bildirim aldınız',
      };
  }
}