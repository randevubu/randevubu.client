/**
 * Rating Hooks
 * 
 * Custom hooks for managing rating data with TanStack Query.
 * Follows the established patterns in the codebase.
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../services/ratings';
import type {
  UseRatingEligibilityResult,
  UseBusinessRatingsResult,
  UseRatingSubmissionResult,
  UseGoogleIntegrationResult,
  SubmitRatingRequest,
  GetBusinessRatingsRequest,
  UpdateGoogleIntegrationRequest,
  Rating,
  RatingEligibility,
  GoogleIntegration,
} from '../../types/rating';

/**
 * Hook to check if a user can rate a specific appointment
 */
export function useRatingEligibility(
  businessId: string,
  appointmentId: string
): UseRatingEligibilityResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();

  const queryResult: UseQueryResult<RatingEligibility, Error> = useQuery({
    queryKey: ['rating-eligibility', businessId, appointmentId, user?.id],
    queryFn: async (): Promise<RatingEligibility> => {
      const response = await ratingService.checkRatingEligibility(businessId, appointmentId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to check rating eligibility');
      }
      
      return response.data;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId && !!appointmentId,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    eligibility: data || null,
    loading: isLoading,
    error: isError ? error : null,
    refetch: () => refetch(),
  };
}

/**
 * Hook to fetch and manage business ratings with pagination
 */
export function useBusinessRatings(
  businessId: string,
  params: GetBusinessRatingsRequest = {}
): UseBusinessRatingsResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();

  const queryResult: UseQueryResult<{
    ratings: Rating[];
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  }, Error> = useQuery({
    queryKey: ['business-ratings', businessId, params.page, params.limit, params.minRating, params.maxRating],
    queryFn: async () => {
      const response = await ratingService.getBusinessRatings(businessId, params);
      
      if (!response.success) {
        throw new Error('Failed to fetch ratings');
      }
      
      // Return data from the server response
      return response.data;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  const ratings = data?.ratings || [];
  const averageRating = data?.averageRating || 0;
  const totalRatings = data?.totalRatings || 0;
  const ratingDistribution = data?.ratingDistribution || {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  
  // Extract pagination from response meta if available
  const currentPage = params.page || 1;
  const limit = params.limit || 10;
  const total = totalRatings;
  const totalPages = Math.ceil(total / limit);
  const meta = {
    page: currentPage,
    total: totalRatings,
    totalPages: totalPages,
  };

  const hasMore = meta.page < meta.totalPages;

  const loadMore = () => {
    // This would typically trigger a new query with incremented page
    // For now, we'll just refetch with the next page
    if (hasMore) {
      refetch();
    }
  };

  return {
    ratings,
    averageRating,
    totalRatings,
    ratingDistribution,
    meta,
    loading: isLoading,
    error: isError ? error : null,
    refetch: () => refetch(),
    loadMore,
    hasMore,
  };
}

/**
 * Hook for submitting ratings
 */
export function useRatingSubmission(): UseRatingSubmissionResult {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const submitRatingMutation = useMutation({
    mutationFn: async ({ businessId, data }: { businessId: string; data: SubmitRatingRequest }) => {
      const response = await ratingService.submitRating(businessId, data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to submit rating');
      }
      
      return response.data.rating;
    },
    onSuccess: (rating, { businessId }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['business-ratings', businessId] });
      queryClient.invalidateQueries({ queryKey: ['rating-eligibility', businessId] });
      queryClient.invalidateQueries({ queryKey: ['google-integration', businessId] });
      
      // If this is for a specific appointment, invalidate that too
      if (rating.appointmentId) {
        queryClient.invalidateQueries({ queryKey: ['rating-eligibility', businessId, rating.appointmentId] });
      }
    },
  });

  const submitRating = async (businessId: string, data: SubmitRatingRequest): Promise<Rating> => {
    return submitRatingMutation.mutateAsync({ businessId, data });
  };

  return {
    submitRating,
    isSubmitting: submitRatingMutation.isPending,
    error: submitRatingMutation.error,
  };
}

/**
 * Hook for managing Google integration settings
 */
export function useGoogleIntegration(businessId: string): UseGoogleIntegrationResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const queryResult: UseQueryResult<GoogleIntegration, Error> = useQuery({
    queryKey: ['google-integration', businessId, user?.id],
    queryFn: async (): Promise<GoogleIntegration> => {
      const response = await ratingService.getGoogleIntegration(businessId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch Google integration settings');
      }
      
      return response.data;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes (reduced from 10)
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes (reduced from 30)
    refetchOnWindowFocus: true, // Allow refetch on focus
    refetchOnMount: true, // Allow refetch on mount
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3; // Increased from 2 to 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Increased max delay to 30s
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async (data: UpdateGoogleIntegrationRequest) => {
      const response = await ratingService.updateGoogleIntegration(businessId, data);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update Google integration');
      }
      
      return response.data.business;
    },
    onSuccess: () => {
      // Invalidate and refetch Google integration data
      queryClient.invalidateQueries({ queryKey: ['google-integration', businessId] });
      queryClient.invalidateQueries({ queryKey: ['business-ratings', businessId] });
    },
    onError: (error) => {
    },
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  const updateIntegration = async (data: UpdateGoogleIntegrationRequest): Promise<void> => {
    await updateIntegrationMutation.mutateAsync(data);
  };

  return {
    integration: data || null,
    loading: isLoading,
    error: isError ? error : null,
    updateIntegration,
    isUpdating: updateIntegrationMutation.isPending,
    refetch: () => refetch(),
  };
}

/**
 * Hook to get user's rating for a specific appointment
 */
export function useUserRating(appointmentId: string) {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();

  const queryResult: UseQueryResult<Rating | null, Error> = useQuery({
    queryKey: ['user-rating', appointmentId, user?.id],
    queryFn: async (): Promise<Rating | null> => {
      const response = await ratingService.getUserRating(appointmentId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user rating');
      }
      
      return response.data.rating || null;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!appointmentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    rating: data,
    loading: isLoading,
    error: isError ? error : null,
    refetch: () => refetch(),
  };
}
