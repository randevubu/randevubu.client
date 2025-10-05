'use client';

/**
 * Push Notification Context Provider
 *
 * Manages push notification state and operations across the application.
 * Integrates with authentication system and provides hooks for components.
 *
 * Features:
 * - Automatic initialization on authentication
 * - Permission state management
 * - Subscription lifecycle management
 * - Integration with TanStack Query for state management
 */

import React, { createContext, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  pushNotificationManager,
  PushInitResult,
  SubscriptionStatus
} from '../lib/services/pushNotificationManager';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface PushNotificationContextType {
  // State
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isInitializing: boolean;

  // Actions
  enableNotifications: () => Promise<PushInitResult>;
  disableNotifications: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

interface PushNotificationProviderProps {
  children: ReactNode;
}

export function PushNotificationProvider({ children }: PushNotificationProviderProps) {
  const { isAuthenticated, hasInitialized } = useAuth();
  const queryClient = useQueryClient();

  // Query: Get subscription status
  const {
    data: status,
    isLoading: isLoadingStatus,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['push-notification-status'],
      queryFn: async (): Promise<SubscriptionStatus> => {
        return await pushNotificationManager.getSubscriptionStatus();
      },
    enabled: hasInitialized, // Only run after auth is initialized
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Mutation: Enable push notifications
  const enableMutation = useMutation({
    mutationFn: async (): Promise<PushInitResult> => {
      return pushNotificationManager.initialize();
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch status
        queryClient.invalidateQueries({ queryKey: ['push-notification-status'] });

        // Show success message based on reason
        if (result.reason === 'subscribed') {
          toast.success('Bildirimler başarıyla etkinleştirildi!');
        } else if (result.reason === 'already_subscribed') {
          toast.success('Bildirimler zaten etkin');
        }
      } else {
        // Handle failure reasons
        if (result.reason === 'permission_denied') {
          toast.error('Bildirim izni reddedildi. Lütfen tarayıcı ayarlarınızdan izin verin.');
        } else if (result.reason === 'not_supported') {
          toast.error('Tarayıcınız push bildirimleri desteklemiyor');
        } else {
          toast.error('Bildirimler etkinleştirilemedi: ' + (result.error || 'Bilinmeyen hata'));
        }
      }
    },
    onError: (error: Error) => {
      console.error('[Push Context] Enable failed:', error);
      toast.error('Bildirimler etkinleştirilemedi');
    }
  });

  // Mutation: Disable push notifications
  const disableMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      return pushNotificationManager.unsubscribe();
    },
    onSuccess: (success) => {
      if (success) {
        // Invalidate and refetch status
        queryClient.invalidateQueries({ queryKey: ['push-notification-status'] });
        toast.success('Bildirimler devre dışı bırakıldı');
      } else {
        toast.error('Bildirimler devre dışı bırakılamadı');
      }
    },
    onError: (error: Error) => {
      console.error('[Push Context] Disable failed:', error);
      toast.error('Bildirimler devre dışı bırakılamadı');
    }
  });

  // Mutation: Test notification
  const testMutation = useMutation({
    mutationFn: async () => {
      return pushNotificationManager.sendTestNotification();
    },
    onSuccess: () => {
      toast.success('Test bildirimi gönderildi!');
    },
    onError: (error: Error) => {
      console.error('[Push Context] Test notification failed:', error);
      toast.error('Test bildirimi gönderilemedi');
    }
  });

  /**
   * Auto-initialize push notifications when user is authenticated
   * This provides a seamless experience without requiring explicit user action
   */
  useEffect(() => {
    // Only attempt auto-init if:
    // 1. Auth has initialized
    // 2. User is authenticated
    // 3. Push is supported
    // 4. We have status data
    // 5. Not already subscribed
    // 6. Permission is not denied
    if (
      hasInitialized &&
      isAuthenticated &&
      status?.isSupported &&
      !status?.isSubscribed &&
      status?.permission !== 'denied'
    ) {
      // Check if we should auto-initialize (not on first visit)
      const hasSeenPushPrompt = localStorage.getItem('push-prompt-seen');

      if (!hasSeenPushPrompt) {
        // First time - don't auto-init, wait for user action
        localStorage.setItem('push-prompt-seen', 'true');
        return;
      }

      // Auto-initialize silently (will only work if permission was previously granted)
      const autoInit = async () => {
        try {
          await pushNotificationManager.initialize();
          queryClient.invalidateQueries({ queryKey: ['push-notification-status'] });
        } catch (error) {
          // Silent failure - this is expected if permission isn't granted
          console.log('[Push Context] Auto-init skipped:', error);
        }
      };

      autoInit();
    }
  }, [hasInitialized, isAuthenticated, status, queryClient]);

  // Action handlers
  const enableNotifications = useCallback(async (): Promise<PushInitResult> => {
    return enableMutation.mutateAsync();
  }, [enableMutation]);

  const disableNotifications = useCallback(async (): Promise<boolean> => {
    return disableMutation.mutateAsync();
  }, [disableMutation]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await pushNotificationManager.requestPermissionExplicit();
      if (granted) {
        // After permission is granted, initialize
        await enableNotifications();
      }
      return granted;
    } catch (error) {
      console.error('[Push Context] Permission request failed:', error);
      return false;
    }
  }, [enableNotifications]);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    return testMutation.mutateAsync();
  }, [testMutation]);

  const refreshStatus = useCallback(async (): Promise<void> => {
    await refetchStatus();
  }, [refetchStatus]);

  // Context value
  const contextValue: PushNotificationContextType = useMemo(() => ({
    // State
    isSupported: status?.isSupported ?? false,
    isSubscribed: status?.isSubscribed ?? false,
    permission: status?.permission ?? 'default',
    subscription: status?.subscription ?? null,
    isInitializing: isLoadingStatus || enableMutation.isPending || disableMutation.isPending,

    // Actions
    enableNotifications,
    disableNotifications,
    requestPermission,
    sendTestNotification,
    refreshStatus,
  }), [
    status,
    isLoadingStatus,
    enableMutation.isPending,
    disableMutation.isPending,
    enableNotifications,
    disableNotifications,
    requestPermission,
    sendTestNotification,
    refreshStatus,
  ]);

  return (
    <PushNotificationContext.Provider value={contextValue}>
      {children}
    </PushNotificationContext.Provider>
  );
}

/**
 * Hook to use push notification context
 */
export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
}

/**
 * Hook to get permission instructions based on browser
 */
export function usePermissionInstructions(): string[] {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return [
      'Tarayıcı ayarlarından bildirim izinlerini kontrol edin',
      'Bu site için bildirimlere izin verin',
      'Sayfayı yenileyin'
    ];
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('chrome')) {
    return [
      'Adres çubuğundaki kilit simgesine tıklayın',
      '"Bildirimler" ayarını "İzin ver" olarak değiştirin',
      'Sayfayı yenileyin'
    ];
  }

  if (userAgent.includes('firefox')) {
    return [
      'Adres çubuğundaki bilgi simgesine tıklayın',
      '"İzinler" sekmesine gidin',
      '"Bildirimler" için "İzin ver" seçeneğini seçin',
      'Sayfayı yenileyin'
    ];
  }

  if (userAgent.includes('safari')) {
    return [
      'Safari > Tercihler > Web Siteleri menüsüne gidin',
      '"Bildirimler" sekmesini seçin',
      'Bu siteyi bulup "İzin ver" seçeneğini seçin',
      'Sayfayı yenileyin'
    ];
  }

  return [
    'Tarayıcı ayarlarından bildirim izinlerini kontrol edin',
    'Bu site için bildirimlere izin verin',
    'Sayfayı yenileyin'
  ];
}
