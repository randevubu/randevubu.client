/**
 * Cancellation Policies Service
 *
 * Service for managing business cancellation and no-show policies.
 * Follows the API documentation structure with proper error handling,
 * validation, and type safety.
 */

import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import {
  CancellationPolicySettings,
  UpdateCancellationPolicyRequest,
  CancellationPolicyResponse,
  CustomerPolicyStatusResponse,
  validateCancellationPolicy
} from '../../types/cancellationPolicies';

/**
 * Cancellation Policies API Service
 *
 * Handles all cancellation policies API calls with proper error handling,
 * validation, and type safety following the documented API structure.
 */
export const cancellationPoliciesService = {
  /**
   * Get current cancellation policies for the business
   *
   * @returns Promise<CancellationPolicyResponse>
   * @throws Error if API call fails or returns error
   */
  getPolicies: async (): Promise<CancellationPolicyResponse> => {
    try {
      const response = await apiClient.get<CancellationPolicyResponse>(
        '/api/v1/businesses/my-business/cancellation-policies'
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch cancellation policies');
      }

      return response.data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized access - please log in again');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - business role required');
      } else if (error.response?.status === 400) {
        throw new Error('Business context is required');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Failed to fetch cancellation policies');
      }
    }
  },

  /**
   * Update cancellation policies for the business
   *
   * @param policies - Partial cancellation policies to update
   * @returns Promise<CancellationPolicyResponse>
   * @throws Error if validation fails or API call fails
   */
  updatePolicies: async (policies: UpdateCancellationPolicyRequest): Promise<CancellationPolicyResponse> => {
    try {
      // Validate policies before sending to API
      const validationErrors = validateCancellationPolicy(policies);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Ensure at least one field is provided
      if (Object.keys(policies).length === 0) {
        throw new Error('At least one policy setting must be provided for update');
      }

      const response = await apiClient.put<CancellationPolicyResponse>(
        '/api/v1/businesses/my-business/cancellation-policies',
        policies
      );

      if (!response.data.success) {
        throw new Error('Failed to update cancellation policies');
      }

      return response.data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized access - please log in again');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - business role required');
      } else if (error.response?.status === 400) {
        // Handle validation errors from server
        const serverError = error.response.data.error;
        if (serverError.includes('Invalid policy settings')) {
          throw new Error('Invalid policy settings - please check your input');
        } else if (serverError.includes('autoBanEnabled')) {
          throw new Error('Ban duration is required when auto-ban is enabled');
        } else {
          throw new Error(serverError);
        }
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Failed to update cancellation policies');
      }
    }
  },

  /**
   * Get customer policy status for a specific customer
   *
   * @param customerId - Customer ID to check
   * @returns Promise<CustomerPolicyStatusResponse>
   * @throws Error if API call fails
   */
  getCustomerPolicyStatus: async (customerId: string): Promise<CustomerPolicyStatusResponse> => {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const response = await apiClient.get<CustomerPolicyStatusResponse>(
        `/api/v1/businesses/my-business/customer-policy-status/${customerId}`
      );

      if (!response.data.success) {
        throw new Error('Failed to fetch customer policy status');
      }

      return response.data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized access - please log in again');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied - business role required');
      } else if (error.response?.status === 400) {
        throw new Error('Customer ID is required');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Failed to fetch customer policy status');
      }
    }
  },

  /**
   * Reset cancellation policies to default values
   *
   * @returns Promise<CancellationPolicyResponse>
   * @throws Error if API call fails
   */
  resetToDefaults: async (): Promise<CancellationPolicyResponse> => {
    try {
      const defaultPolicies: UpdateCancellationPolicyRequest = {
        minCancellationHours: 4,
        maxMonthlyCancellations: 3,
        maxMonthlyNoShows: 2,
        enablePolicyEnforcement: true,
        policyWarningMessage:
          'Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek ve bir daha işletmenizden randevu alamayacaktır. Bu politikalar müşteri deneyimini korumak ve adil bir rezervasyon sistemi sağlamak için uygulanır.',
        gracePeriodDays: 0,
        autoBanEnabled: false,
        banDurationDays: 30
      };

      return await cancellationPoliciesService.updatePolicies(defaultPolicies);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset cancellation policies to defaults');
    }
  }
};
