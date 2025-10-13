/**
 * useCustomerManagement Hook
 *
 * Custom React hook for managing customer management settings using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerManagementService } from '../services/customerManagement';
import {
  CustomerManagementSettings,
  UpdateCustomerManagementSettingsRequest,
  validateCustomerManagementSettings
} from '../../types/customerManagement';

interface UseCustomerManagementReturn {
  // Data
  settings: CustomerManagementSettings | undefined;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isResetting: boolean;

  // Error states
  error: Error | null;
  saveError: Error | null;
  validationErrors: string[];

  // Actions
  updateSettings: (settings: UpdateCustomerManagementSettingsRequest) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refetch: () => void;
}

export const useCustomerManagement = (): UseCustomerManagementReturn => {
  const queryClient = useQueryClient();

  // Fetch customer management settings
  const {
    data: settings,
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['customerManagementSettings'],
    queryFn: async (): Promise<CustomerManagementSettings> => {
      const response = await customerManagementService.getSettings();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (newSettings: UpdateCustomerManagementSettingsRequest) => {
      // Validate before sending
      const validation = validateCustomerManagementSettings(newSettings as Partial<CustomerManagementSettings>);
      if (!validation.valid) {
        throw new Error(validation.errors[0]);
      }

      const response = await customerManagementService.updateSettings(newSettings);
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['customerManagementSettings'], data);
    },
    onError: (error: Error) => {
      // Error handled by the hook consumer
    }
  });

  // Reset to defaults mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await customerManagementService.resetToDefaults();
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache with default data
      queryClient.setQueryData(['customerManagementSettings'], data);
    },
    onError: (error: Error) => {
      // Error handled by the hook consumer
    }
  });

  // Get validation errors from the last update attempt
  const validationErrors: string[] = [];
  if (updateMutation.error?.message) {
    validationErrors.push(updateMutation.error.message);
  }

  return {
    // Data
    settings,

    // Loading states
    isLoading,
    isSaving: updateMutation.isPending,
    isResetting: resetMutation.isPending,

    // Error states
    error: queryError as Error | null,
    saveError: updateMutation.error || resetMutation.error,
    validationErrors,

    // Actions
    updateSettings: async (newSettings: UpdateCustomerManagementSettingsRequest) => {
      await updateMutation.mutateAsync(newSettings);
    },
    resetToDefaults: async () => {
      await resetMutation.mutateAsync();
    },
    refetch: () => {
      refetch();
    }
  };
};
