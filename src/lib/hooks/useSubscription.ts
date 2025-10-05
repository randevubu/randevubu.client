'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../services/subscription';
import { BusinessSubscription } from '../../types/subscription';
import { useMyBusiness } from './useMyBusiness';

export interface UseSubscriptionResult {
  subscription: BusinessSubscription | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage business subscription data with TanStack Query
 *
 * Features:
 * - Automatic caching and background refetching
 * - Request deduplication across components
 * - Built-in loading and error states
 * - Stale-while-revalidate behavior
 * - Only fetches when user is authenticated and business is available
 */
export function useSubscription(): UseSubscriptionResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();
  const { businesses, isLoading: businessLoading } = useMyBusiness();

  // Get the primary business ID
  const businessId = businesses?.[0]?.id || '';

  const queryResult: UseQueryResult<BusinessSubscription, Error> = useQuery({
    queryKey: ['business-subscription', businessId],
    queryFn: async (): Promise<BusinessSubscription> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const response = await subscriptionService.getBusinessSubscriptionWithPlan(businessId);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch subscription');
      }

      return response.data;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !businessLoading && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes - subscription data doesn't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus - subscription data is stable
    refetchOnReconnect: true, // Refetch when internet reconnects
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    subscription: data || null,
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    },
  };
}

/**
 * Hook for canceling a business subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      subscriptionId
    }: {
      businessId: string;
      subscriptionId: string;
    }) => {
      const response = await subscriptionService.cancelBusinessSubscription(businessId, subscriptionId);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to cancel subscription');
      }

      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate subscription query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['business-subscription', variables.businessId] });
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
    },
  });
}
