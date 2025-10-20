'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../services/business';
import { Business } from '../../types/business';
import { BusinessSubscription } from '../../types/subscription';
import { createApiError, shouldRetryError, getRetryDelay, ApiError } from '../utils/errorHandling';
import { SubscriptionStatus } from '@/src/types';

export interface MyBusinessData {
  businesses: Business[];
  subscriptions: BusinessSubscription[];
  hasBusinesses: boolean;
  isFirstTimeUser: boolean;
  canCreateBusiness: boolean;
  context?: {
    primaryBusinessId?: string;
    totalBusinesses: number;
    includesSubscriptionInfo: boolean;
  };
}

export interface UseMyBusinessResult {
  data: MyBusinessData | undefined;
  businesses: Business[];
  subscriptions: BusinessSubscription[];
  hasBusinesses: boolean;
  isFirstTimeUser: boolean;
  canCreateBusiness: boolean;
  context?: {
    primaryBusinessId?: string;
    totalBusinesses: number;
    includesSubscriptionInfo: boolean;
  };
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage user's business data with TanStack Query
 *
 * Features:
 * - Automatic caching and background refetching
 * - Request deduplication across components
 * - Built-in loading and error states
 * - Stale-while-revalidate behavior
 * - Only fetches when user is authenticated and initialized
 */
export function useMyBusiness(includeSubscription: boolean = true): UseMyBusinessResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();

  const queryResult: UseQueryResult<MyBusinessData, ApiError> = useQuery({
    queryKey: ['my-business', user?.id, includeSubscription],
    queryFn: async (): Promise<MyBusinessData> => {
      try {
        const response = await businessService.getMyBusiness(includeSubscription);

        // Handle API errors (401, 403, 500, etc.)
        if (!response.success) {
          const error = createApiError({
            message: response.error?.message || 'Failed to fetch business data',
            status: response.error?.code === 'UNAUTHORIZED' ? 401 : 
                   response.error?.code === 'BUSINESS_ACCESS_DENIED' ? 403 : 500,
            code: response.error?.code
          });
          throw error;
        }

        // Handle successful response with proper metadata
        const data = response.data;
        if (!data) {
          throw createApiError({
            message: 'No data received from API',
            status: 500,
            code: 'NO_DATA_RECEIVED'
          });
        }

        const businesses = data.businesses || [];
        const hasBusinesses = data.hasBusinesses || false;
        const isFirstTimeUser = data.isFirstTimeUser || false;
        const canCreateBusiness = data.canCreateBusiness || false;
        const context = data.context;

        // Extract subscriptions from business objects
        const subscriptions = businesses
          .filter(business => business.subscription)
          .map(business => {
            const subscription = business.subscription!;
            // Convert business subscription to full BusinessSubscription format
            return {
              id: subscription.id,
              businessId: business.id,
              planId: subscription.planId,
              status: subscription.status as SubscriptionStatus,
              currentPeriodStart: subscription.currentPeriodStart,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
              createdAt: new Date(),
              updatedAt: new Date()
            } as BusinessSubscription;
          });

        return {
          businesses,
          subscriptions,
          hasBusinesses,
          isFirstTimeUser,
          canCreateBusiness,
          context
        };
      } catch (error) {
        // Convert any error to our standardized ApiError format
        throw createApiError(error);
      }
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes (reduced for development)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (reduced)
    refetchOnWindowFocus: true, // Allow refetch on focus for fresh data
    refetchOnMount: true, // Allow refetch on mount for fresh data
    refetchOnReconnect: true, // Refetch when internet reconnects
    retry: (failureCount, error) => {
      return shouldRetryError(error as ApiError, failureCount);
    },
    retryDelay: (attemptIndex, error) => {
      return getRetryDelay(error as ApiError, attemptIndex);
    },
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  // Provide a clean interface with sensible defaults
  return {
    data,
    businesses: data?.businesses ?? [],
    subscriptions: data?.subscriptions ?? [],
    hasBusinesses: data?.hasBusinesses ?? false,
    isFirstTimeUser: data?.isFirstTimeUser ?? false,
    canCreateBusiness: data?.canCreateBusiness ?? true,
    context: data?.context,
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    }
  };
}