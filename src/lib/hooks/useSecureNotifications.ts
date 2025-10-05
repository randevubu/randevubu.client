/**
 * useSecureNotifications Hook
 *
 * React hook for sending secure notifications with TanStack Query.
 * Follows industry best practices for mutation management, error handling,
 * and user feedback.
 *
 * Features:
 * - Type-safe mutations
 * - Loading states
 * - Error handling
 * - Success callbacks
 * - Optimistic updates support
 * - Rate limit awareness
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { secureNotificationService } from '../services/secureNotifications';
import toast from 'react-hot-toast';
import type {
  SecureNotificationRequest,
  SecureNotificationResponse,
  BroadcastNotificationRequest,
  BroadcastNotificationResponse,
  ClosureNotificationRequest,
  ClosureNotificationResponse,
  TestNotificationRequest,
  TestNotificationResponse,
} from '@/src/types/notification';

// ============================================
// MUTATION OPTIONS TYPES
// ============================================

interface NotificationMutationOptions {
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

// ============================================
// HOOK RETURN TYPE
// ============================================

export interface UseSecureNotificationsReturn {
  // Send notification to specific recipients
  sendNotification: {
    mutate: (data: SecureNotificationRequest) => void;
    mutateAsync: (data: SecureNotificationRequest) => Promise<SecureNotificationResponse>;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: SecureNotificationResponse | undefined;
    reset: () => void;
  };

  // Send broadcast notification
  sendBroadcast: {
    mutate: (data: BroadcastNotificationRequest) => void;
    mutateAsync: (data: BroadcastNotificationRequest) => Promise<BroadcastNotificationResponse>;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: BroadcastNotificationResponse | undefined;
    reset: () => void;
  };

  // Send closure notification
  sendClosureNotification: {
    mutate: (params: { businessId: string; closureId: string; data: ClosureNotificationRequest }) => void;
    mutateAsync: (params: { businessId: string; closureId: string; data: ClosureNotificationRequest }) => Promise<ClosureNotificationResponse>;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: ClosureNotificationResponse | undefined;
    reset: () => void;
  };

  // Send test notification
  sendTestNotification: {
    mutate: (data: TestNotificationRequest) => void;
    mutateAsync: (data: TestNotificationRequest) => Promise<TestNotificationResponse>;
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: TestNotificationResponse | undefined;
    reset: () => void;
  };

  // Combined loading state
  isLoading: boolean;
}

// ============================================
// MAIN HOOK
// ============================================

export function useSecureNotifications(
  options: NotificationMutationOptions = {}
): UseSecureNotificationsReturn {
  const queryClient = useQueryClient();
  const { showToast = true } = options;

  // ============================================
  // SEND NOTIFICATION MUTATION
  // ============================================

  const sendNotificationMutation = useMutation({
    mutationFn: async (data: SecureNotificationRequest) => {
      return secureNotificationService.sendNotification(data);
    },
    onSuccess: (response) => {
      // Show success toast
      if (showToast) {
        const { sentCount, failedCount, totalRecipients } = response.data;
        if (failedCount > 0) {
          toast.success(
            `Notification sent to ${sentCount} of ${totalRecipients} recipients. ${failedCount} failed.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`Notification sent successfully to ${sentCount} recipients!`);
        }
      }

      // Invalidate stats query
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });

      // Call custom success handler
      options.onSuccess?.(response);
    },
    onError: (error: Error) => {
      // Show error toast
      if (showToast) {
        toast.error(error.message || 'Failed to send notification');
      }

      // Call custom error handler
      options.onError?.(error);

      console.error('[useSecureNotifications] Send notification failed:', error);
    },
  });

  // ============================================
  // SEND BROADCAST MUTATION
  // ============================================

  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: BroadcastNotificationRequest) => {
      return secureNotificationService.sendBroadcast(data);
    },
    onSuccess: (response) => {
      // Show success toast
      if (showToast) {
        const { sentCount, failedCount, totalRecipients } = response.data;
        if (failedCount > 0) {
          toast.success(
            `Broadcast sent to ${sentCount} of ${totalRecipients} customers. ${failedCount} failed.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`Broadcast sent successfully to ${sentCount} customers!`);
        }
      }

      // Invalidate stats query
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });

      // Call custom success handler
      options.onSuccess?.(response);
    },
    onError: (error: Error) => {
      // Show error toast
      if (showToast) {
        toast.error(error.message || 'Failed to send broadcast');
      }

      // Call custom error handler
      options.onError?.(error);

      console.error('[useSecureNotifications] Send broadcast failed:', error);
    },
  });

  // ============================================
  // SEND CLOSURE NOTIFICATION MUTATION
  // ============================================

  const sendClosureNotificationMutation = useMutation({
    mutationFn: async (params: {
      businessId: string;
      closureId: string;
      data: ClosureNotificationRequest;
    }) => {
      return secureNotificationService.sendClosureNotification(
        params.businessId,
        params.closureId,
        params.data
      );
    },
    onSuccess: (response) => {
      // Show success toast
      if (showToast) {
        const { sentCount } = response.data;
        toast.success(`Closure notification sent to ${sentCount} affected customers!`);
      }

      // Invalidate stats query
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });

      // Call custom success handler
      options.onSuccess?.(response);
    },
    onError: (error: Error) => {
      // Show error toast
      if (showToast) {
        toast.error(error.message || 'Failed to send closure notification');
      }

      // Call custom error handler
      options.onError?.(error);

      console.error('[useSecureNotifications] Send closure notification failed:', error);
    },
  });

  // ============================================
  // SEND TEST NOTIFICATION MUTATION
  // ============================================

  const sendTestNotificationMutation = useMutation({
    mutationFn: async (data: TestNotificationRequest) => {
      return secureNotificationService.sendTestNotification(data);
    },
    onSuccess: (response) => {
      // Show success toast
      if (showToast) {
        toast.success('Test notification sent!');
      }

      // Call custom success handler
      options.onSuccess?.(response);
    },
    onError: (error: Error) => {
      // Show error toast
      if (showToast) {
        toast.error(error.message || 'Failed to send test notification');
      }

      // Call custom error handler
      options.onError?.(error);

      console.error('[useSecureNotifications] Send test notification failed:', error);
    },
  });

  // ============================================
  // RETURN HOOK API
  // ============================================

  return {
    sendNotification: {
      mutate: sendNotificationMutation.mutate,
      mutateAsync: sendNotificationMutation.mutateAsync,
      isPending: sendNotificationMutation.isPending,
      isSuccess: sendNotificationMutation.isSuccess,
      isError: sendNotificationMutation.isError,
      error: sendNotificationMutation.error,
      data: sendNotificationMutation.data,
      reset: sendNotificationMutation.reset,
    },
    sendBroadcast: {
      mutate: sendBroadcastMutation.mutate,
      mutateAsync: sendBroadcastMutation.mutateAsync,
      isPending: sendBroadcastMutation.isPending,
      isSuccess: sendBroadcastMutation.isSuccess,
      isError: sendBroadcastMutation.isError,
      error: sendBroadcastMutation.error,
      data: sendBroadcastMutation.data,
      reset: sendBroadcastMutation.reset,
    },
    sendClosureNotification: {
      mutate: sendClosureNotificationMutation.mutate,
      mutateAsync: sendClosureNotificationMutation.mutateAsync,
      isPending: sendClosureNotificationMutation.isPending,
      isSuccess: sendClosureNotificationMutation.isSuccess,
      isError: sendClosureNotificationMutation.isError,
      error: sendClosureNotificationMutation.error,
      data: sendClosureNotificationMutation.data,
      reset: sendClosureNotificationMutation.reset,
    },
    sendTestNotification: {
      mutate: sendTestNotificationMutation.mutate,
      mutateAsync: sendTestNotificationMutation.mutateAsync,
      isPending: sendTestNotificationMutation.isPending,
      isSuccess: sendTestNotificationMutation.isSuccess,
      isError: sendTestNotificationMutation.isError,
      error: sendTestNotificationMutation.error,
      data: sendTestNotificationMutation.data,
      reset: sendTestNotificationMutation.reset,
    },
    isLoading:
      sendNotificationMutation.isPending ||
      sendBroadcastMutation.isPending ||
      sendClosureNotificationMutation.isPending ||
      sendTestNotificationMutation.isPending,
  };
}
