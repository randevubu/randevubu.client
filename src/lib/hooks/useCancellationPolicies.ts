/**
 * useCancellationPolicies Hook
 *
 * React hook for managing business cancellation and no-show policies.
 * Provides state management, API integration, and error handling
 * for cancellation policies functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cancellationPoliciesService } from '../services/cancellationPolicies';
import {
  CancellationPolicySettings,
  UpdateCancellationPolicyRequest,
  validateCancellationPolicy
} from '../../types/cancellationPolicies';
import { handleApiError, showSuccessToast } from '../utils/toast';

interface UseCancellationPoliciesReturn {
  // Data
  policies: CancellationPolicySettings | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  updatePolicies: (newPolicies: UpdateCancellationPolicyRequest) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearError: () => void;

  // Validation
  validatePolicies: (policies: UpdateCancellationPolicyRequest) => string[];
}

/**
 * Custom hook for managing cancellation policies
 *
 * @returns UseCancellationPoliciesReturn - Hook state and actions
 */
export const useCancellationPolicies = (): UseCancellationPoliciesReturn => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query for fetching cancellation policies
  const {
    data: policies,
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: ['cancellationPolicies'],
    queryFn: async (): Promise<CancellationPolicySettings> => {
      const response = await cancellationPoliciesService.getPolicies();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Mutation for updating cancellation policies
  const updateMutation = useMutation({
    mutationFn: async (newPolicies: UpdateCancellationPolicyRequest): Promise<CancellationPolicySettings> => {
      const response = await cancellationPoliciesService.updatePolicies(newPolicies);
      return response.data;
    },
    onSuccess: (updatedPolicies) => {
      // Update the cache with new data
      queryClient.setQueryData(['cancellationPolicies'], updatedPolicies);
      showSuccessToast('İptal ve gelmeme politikaları başarıyla güncellendi');
      setError(null);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'İptal ve gelmeme politikaları güncellenirken hata oluştu';
      setError(errorMessage);
      handleApiError(error);
    }
  });

  // Mutation for resetting to defaults
  const resetMutation = useMutation({
    mutationFn: async (): Promise<CancellationPolicySettings> => {
      const response = await cancellationPoliciesService.resetToDefaults();
      return response.data;
    },
    onSuccess: (defaultPolicies) => {
      // Update the cache with default data
      queryClient.setQueryData(['cancellationPolicies'], defaultPolicies);
      showSuccessToast('İptal ve gelmeme politikaları varsayılan değerlere sıfırlandı');
      setError(null);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'İptal ve gelmeme politikaları sıfırlanırken hata oluştu';
      setError(errorMessage);
      handleApiError(error);
    }
  });

  // Update policies function
  const updatePolicies = useCallback(async (newPolicies: UpdateCancellationPolicyRequest): Promise<void> => {
    try {
      setError(null);
      await updateMutation.mutateAsync(newPolicies);
    } catch (error) {
      // Error is already handled by mutation onError
      throw error;
    }
  }, [updateMutation]);

  // Reset to defaults function
  const resetToDefaults = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await resetMutation.mutateAsync();
    } catch (error) {
      // Error is already handled by mutation onError
      throw error;
    }
  }, [resetMutation]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Validate policies function
  const validatePolicies = useCallback((policies: UpdateCancellationPolicyRequest): string[] => {
    return validateCancellationPolicy(policies);
  }, []);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError.message || 'İptal ve gelmeme politikaları yüklenirken hata oluştu';
      setError(errorMessage);
    }
  }, [queryError]);

  return {
    // Data
    policies: policies || null,
    isLoading,
    isUpdating: updateMutation.isPending || resetMutation.isPending,
    error,

    // Actions
    updatePolicies,
    resetToDefaults,
    clearError,

    // Validation
    validatePolicies
  };
};
