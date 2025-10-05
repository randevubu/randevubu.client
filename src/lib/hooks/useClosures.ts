'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../services/business';

export interface UseClosuresParams {
  active?: 'true' | 'false' | 'upcoming';
}

export interface UseClosuresResult {
  closures: any[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  deleteClosure: (closureId: string) => Promise<void>;
  isDeletingClosure: boolean;
}

/**
 * Custom hook to fetch and manage closures data with TanStack Query
 *
 * Features:
 * - Automatic caching and background refetching
 * - Request deduplication across components
 * - Built-in loading and error states
 * - Optimistic updates for deletions
 * - Stale-while-revalidate behavior
 */
export function useClosures(params: UseClosuresParams = {}): UseClosuresResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['closures', user?.id, params.active];

  const queryResult: UseQueryResult<any[], Error> = useQuery({
    queryKey,
    queryFn: async (): Promise<any[]> => {
      console.log('🔄 TanStack Query: Fetching closures...', params);

      const response = await businessService.getClosures(params);

      if (!response.success || !response.data) {
        console.log('❌ No closures found or API error');
        return [];
      }

      console.log('🚫 TanStack Query: Fetched closures:', response.data.length);
      return response.data;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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

  // Delete closure mutation
  const deleteClosureMutation = useMutation({
    mutationFn: async (closureId: string) => {
      const response = await businessService.deleteClosure(closureId);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete closure');
      }

      return response.data;
    },
    onMutate: async (closureId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<any[]>(queryKey);

      // Optimistically update by removing the closure
      if (previousData) {
        queryClient.setQueryData<any[]>(queryKey,
          previousData.filter(closure => closure.id !== closureId)
        );
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    closures: data ?? [],
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    },
    deleteClosure: async (closureId: string) => {
      await deleteClosureMutation.mutateAsync(closureId);
    },
    isDeletingClosure: deleteClosureMutation.isPending
  };
}