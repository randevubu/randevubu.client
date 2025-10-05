'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../services/business';
import { Business } from '../../types/business';
import { BusinessSubscription } from '../../types/subscription';

export interface MyBusinessData {
  businesses: Business[];
  subscriptions: BusinessSubscription[];
}

export interface UseMyBusinessResult {
  data: MyBusinessData | undefined;
  businesses: Business[];
  subscriptions: BusinessSubscription[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
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
export function useMyBusiness(): UseMyBusinessResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();

  const queryResult: UseQueryResult<MyBusinessData, Error> = useQuery({
    queryKey: ['my-business', user?.id],
    queryFn: async (): Promise<MyBusinessData> => {
      const response = await businessService.getMyBusiness();

      if (!response.success || !response.data?.businesses) {
        return {
          businesses: [],
          subscriptions: []
        };
      }

      const businesses = response.data.businesses;

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
            status: subscription.status as any,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: false,
            createdAt: new Date(),
            updatedAt: new Date()
          } as BusinessSubscription;
        });

      return {
        businesses,
        subscriptions
      };
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading,
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes (business data changes rarely)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus - business data is stable
    refetchOnReconnect: true, // Refetch when internet reconnects
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  // Provide a clean interface with sensible defaults
  return {
    data,
    businesses: data?.businesses ?? [],
    subscriptions: data?.subscriptions ?? [],
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    }
  };
}