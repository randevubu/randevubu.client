'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { servicesService } from '../services/services';
import { Service } from '../../types/service';

export interface UseServicesParams {
  businessId?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface UseServicesResult {
  services: Service[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage services data with TanStack Query
 *
 * Features:
 * - Automatic caching and background refetching
 * - Request deduplication across components
 * - Built-in loading and error states
 * - Stale-while-revalidate behavior
 */
export function useServices(params: UseServicesParams = {}): UseServicesResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();

  const queryKey = ['services', user?.id, params.businessId, params.active, params.page, params.limit];

  const queryResult: UseQueryResult<Service[], Error> = useQuery({
    queryKey,
    queryFn: async (): Promise<Service[]> => {
      console.log('🔄 TanStack Query: Fetching services...', params);

      const response = await servicesService.getMyServices(params);

      if (!response.success || !response.data) {
        console.log('❌ No services found or API error');
        return [];
      }

      console.log('📋 TanStack Query: Fetched services:', response.data.services.length);
      return response.data.services;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!params.businessId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    services: data ?? [],
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    }
  };
}
