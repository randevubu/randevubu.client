'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../services/subscription';
import { TrialSubscriptionRequest, TrialSubscriptionResponse } from '../../types/subscription';
import { useDashboardBusiness } from '../../context/DashboardContext';

export interface UseTrialSubscriptionResult {
  createTrialSubscription: (trialData: TrialSubscriptionRequest) => Promise<TrialSubscriptionResponse>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Custom hook for creating trial subscriptions
 * 
 * Features:
 * - Creates trial subscriptions with card verification
 * - Handles trial-specific API calls
 * - Invalidates subscription queries on success
 * - Provides loading and error states
 */
export function useTrialSubscription(): UseTrialSubscriptionResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();
  const business = useDashboardBusiness();
  const businessId = business?.id || '';
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (trialData: TrialSubscriptionRequest): Promise<TrialSubscriptionResponse> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const response = await subscriptionService.createTrialSubscription(businessId, trialData);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create trial subscription');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['business-subscription', businessId] });
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
    },
    onError: (error) => {
      console.error('Trial subscription error:', error);
    },
  });

  return {
    createTrialSubscription: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error as Error | null,
  };
}

/**
 * Hook for trial notifications and countdown
 */
export function useTrialNotifications(subscription: any) {
  const getTrialInfo = () => {
    if (subscription?.status === 'TRIAL' && subscription?.trialEnd) {
      const trialEndDate = new Date(subscription.trialEnd);
      const now = new Date();
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        daysLeft,
        trialEndDate,
        isExpiringSoon: daysLeft <= 3,
        isExpiringToday: daysLeft === 0,
        isExpired: daysLeft < 0,
      };
    }
    return null;
  };

  const getNotificationMessage = () => {
    const trialInfo = getTrialInfo();
    if (!trialInfo) return null;

    if (trialInfo.isExpired) {
      return 'Your trial has expired. Please subscribe to continue using the service.';
    } else if (trialInfo.isExpiringToday) {
      return 'Your trial ends today. You will be charged automatically.';
    } else if (trialInfo.daysLeft === 1) {
      return 'Your trial ends tomorrow. You will be charged automatically.';
    } else if (trialInfo.daysLeft === 3) {
      return 'Your trial ends in 3 days. Update your payment method if needed.';
    }

    return null;
  };

  return {
    trialInfo: getTrialInfo(),
    notificationMessage: getNotificationMessage(),
  };
}

/**
 * Hook to check if a plan has trial
 */
export function usePlanTrialInfo(plan: any) {
  const hasTrial = plan?.features?.trialDays > 0;
  const isBasicPlan = plan?.name?.includes('basic');
  const trialDays = plan?.features?.trialDays || 0;

  return {
    hasTrial,
    isBasicPlan,
    trialDays,
    shouldShowTrialOffer: hasTrial && isBasicPlan,
  };
}




