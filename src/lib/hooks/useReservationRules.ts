/**
 * useReservationRules Hook
 * 
 * React hook for managing business reservation rules settings.
 * Provides state management, API integration, and error handling
 * for reservation rules functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationRulesService } from '../services/reservationRules';
import { isAxiosError, extractErrorMessage } from '../utils/errorExtractor';
import {
  ReservationSettings,
  UpdateReservationSettingsRequest,
  validateReservationSettings
} from '../../types/reservationRules';
import { handleApiError, showSuccessToast } from '../utils/toast';

interface UseReservationRulesReturn {
  // Data
  settings: ReservationSettings | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (newSettings: UpdateReservationSettingsRequest) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clearError: () => void;
  
  // Validation
  validateSettings: (settings: UpdateReservationSettingsRequest) => string[];
}

/**
 * Custom hook for managing reservation rules
 * 
 * @returns UseReservationRulesReturn - Hook state and actions
 */
export const useReservationRules = (): UseReservationRulesReturn => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query for fetching reservation settings
  const {
    data: settings,
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: ['reservationRules'],
    queryFn: async (): Promise<ReservationSettings> => {
      const response = await reservationRulesService.getSettings();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401/403 errors
      const axiosError = isAxiosError(error);
      if (axiosError && (error.response?.status === 401 || error.response?.status === 403)) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Mutation for updating reservation settings
  const updateMutation = useMutation({
    mutationFn: async (newSettings: UpdateReservationSettingsRequest): Promise<ReservationSettings> => {
      const response = await reservationRulesService.updateSettings(newSettings);
      return response.data;
    },
    onSuccess: (updatedSettings) => {
      // Update the cache with new data
      queryClient.setQueryData(['reservationRules'], updatedSettings);
      showSuccessToast('Rezervasyon kuralları başarıyla güncellendi');
      setError(null);
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error, 'Rezervasyon kuralları güncellenirken hata oluştu');
      setError(errorMessage);
      handleApiError(error as any); // handleApiError expects AxiosError but we handle it internally
    }
  });

  // Mutation for resetting to defaults
  const resetMutation = useMutation({
    mutationFn: async (): Promise<ReservationSettings> => {
      const response = await reservationRulesService.resetToDefaults();
      return response.data;
    },
    onSuccess: (defaultSettings) => {
      // Update the cache with default data
      queryClient.setQueryData(['reservationRules'], defaultSettings);
      showSuccessToast('Rezervasyon kuralları varsayılan değerlere sıfırlandı');
      setError(null);
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error, 'Rezervasyon kuralları sıfırlanırken hata oluştu');
      setError(errorMessage);
      handleApiError(error as any); // handleApiError expects AxiosError but we handle it internally
    }
  });

  // Update settings function
  const updateSettings = useCallback(async (newSettings: UpdateReservationSettingsRequest): Promise<void> => {
    try {
      setError(null);
      await updateMutation.mutateAsync(newSettings);
    } catch (error: unknown) {
      // Error is already handled by mutation onError
      const errorMessage = extractErrorMessage(error, 'Failed to update settings');
      throw new Error(errorMessage);
    }
  }, [updateMutation]);

  // Reset to defaults function
  const resetToDefaults = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await resetMutation.mutateAsync();
    } catch (error: unknown) {
      // Error is already handled by mutation onError
      const errorMessage = extractErrorMessage(error, 'Failed to reset to defaults');
      throw new Error(errorMessage);
    }
  }, [resetMutation]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Validate settings function
  const validateSettings = useCallback((settings: UpdateReservationSettingsRequest): string[] => {
    return validateReservationSettings(settings);
  }, []);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError.message || 'Rezervasyon kuralları yüklenirken hata oluştu';
      setError(errorMessage);
    }
  }, [queryError]);

  return {
    // Data
    settings: settings || null,
    isLoading,
    isUpdating: updateMutation.isPending || resetMutation.isPending,
    error,
    
    // Actions
    updateSettings,
    resetToDefaults,
    clearError,
    
    // Validation
    validateSettings
  };
};
