import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '../services/pushNotification';
import { showSuccessToast, showErrorToast } from '../utils/toast';

interface UsePushNotificationsState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePushNotificationsActions {
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  testNotification: (message?: string) => Promise<void>;
  requestPermission: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsState & UsePushNotificationsActions {
  const [state, setState] = useState<UsePushNotificationsState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null
  });

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      const isSupported = pushNotificationService.isSupported();
      const permission = pushNotificationService.getPermissionStatus();

      setState(prev => ({
        ...prev,
        isSupported,
        permission
      }));

      // Check subscription status if supported and permission granted (without loading state)
      if (isSupported && permission === 'granted') {
        try {
          const isSubscribed = await pushNotificationService.isSubscribed();
          setState(prev => ({
            ...prev,
            isSubscribed
          }));
        } catch (error: unknown) {
          console.error('Error checking subscription status during init:', error);
          const errorMessage = extractErrorMessage(error, 'Failed to check subscription status');
          setState(prev => ({
            ...prev,
            error: errorMessage
          }));
        }
      }
    };

    initialize();
  }, []);

  // Check current subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const isSubscribed = await pushNotificationService.isSubscribed();

      setState(prev => ({
        ...prev,
        isSubscribed,
        isLoading: false
      }));
    } catch (error: unknown) {
      console.error('Error checking subscription status:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to check subscription status');
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const hasPermission = await pushNotificationService.requestPermission();
      const newPermission = pushNotificationService.getPermissionStatus();

      if (hasPermission) {
        // Check subscription status after permission granted
        const isSubscribed = await pushNotificationService.isSubscribed();
        setState(prev => ({
          ...prev,
          permission: newPermission,
          isSubscribed,
          isLoading: false
        }));
        showSuccessToast('Bildirim izni verildi');
      } else {
        setState(prev => ({
          ...prev,
          permission: newPermission,
          isLoading: false
        }));
        throw new Error('Bildirim izni reddedildi');
      }
    } catch (error: unknown) {
      console.error('Error requesting permission:', error);
      const errorMessage = extractErrorMessage(error, 'Bildirim izni alınamadı');
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      showErrorToast(errorMessage);
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await pushNotificationService.subscribe();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isSubscribed: true,
          permission: pushNotificationService.getPermissionStatus(),
          isLoading: false
        }));
        showSuccessToast('Push bildirimleri aktifleştirildi');
      } else {
        throw new Error(result.error?.message || 'Subscription failed');
      }
    } catch (error: unknown) {
      console.error('Error subscribing:', error);
      let errorMessage = extractErrorMessage(error, 'Push bildirimler aktifleştirilemedi');
      
      // Handle development mode service worker issues
      if (errorMessage.includes('Service Worker not available in development mode')) {
        errorMessage = 'Push bildirimleri geliştirme modunda kullanılamıyor. Lütfen production modunda test edin.';
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      showErrorToast(errorMessage);
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      await pushNotificationService.unsubscribe();

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }));
      showSuccessToast('Push bildirimleri devre dışı bırakıldı');
    } catch (error: unknown) {
      console.error('Error unsubscribing:', error);
      const errorMessage = extractErrorMessage(error, 'Push bildirimler devre dışı bırakılamadı');

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      showErrorToast(errorMessage);
    }
  }, []);

  // Test push notification
  const testNotification = useCallback(async (message?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await pushNotificationService.testNotification(message);

      if (result.success) {
        const { summary } = result.data;
        showSuccessToast(`Test başarılı: ${summary.successful}/${summary.total} push bildirimi gönderildi`);
      } else {
        throw new Error(result.error?.message || 'Test failed');
      }
    } catch (error: unknown) {
      console.error('Error testing notification:', error);
      const errorMessage = extractErrorMessage(error, 'Test bildirimi gönderilemedi');

      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      showErrorToast(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    // State
    ...state,

    // Actions
    subscribe,
    unsubscribe,
    testNotification,
    requestPermission,
    checkSubscriptionStatus
  };
}

export default usePushNotifications;