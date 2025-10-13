/**
 * usePolicyStatus Hook
 *
 * React hook for monitoring customer policy status in real-time.
 * Provides status data with automatic refresh and manual refetch capability.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cancellationPoliciesService } from '../services/cancellationPolicies';
import { CustomerPolicyStatus } from '../../types/cancellationPolicies';

interface UsePolicyStatusReturn {
  // Data
  status: CustomerPolicyStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;

  // Computed status
  isAtRisk: boolean;
  statusIndicator: {
    color: 'red' | 'yellow' | 'green' | 'blue';
    icon: string;
    text: string;
  };
}

/**
 * Custom hook for monitoring customer policy status
 *
 * @param customerId - Customer ID to monitor
 * @param options - Hook options
 * @returns UsePolicyStatusReturn - Hook state and actions
 */
export const usePolicyStatus = (
  customerId: string | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number; // in milliseconds, default 5 minutes
  }
): UsePolicyStatusReturn => {
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled ?? true;
  const refetchInterval = options?.refetchInterval ?? 5 * 60 * 1000; // 5 minutes

  // Query for fetching customer policy status
  const {
    data: status,
    isLoading,
    error: queryError,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['customerPolicyStatus', customerId],
    queryFn: async (): Promise<CustomerPolicyStatus> => {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }
      const response = await cancellationPoliciesService.getCustomerPolicyStatus(customerId);
      return response.data;
    },
    enabled: enabled && !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: refetchInterval,
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403/400 errors
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.response?.status === 400
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  // Manual refetch function
  const refetch = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await queryRefetch();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh policy status';
      setError(errorMessage);
    }
  }, [queryRefetch]);

  // Compute risk status
  const isAtRisk = useCallback((): boolean => {
    if (!status) return false;

    // Banned customers are always at risk
    if (status.isBanned) return true;

    // Check if approaching or exceeded limits
    const cancellationLimit = status.policySettings.maxMonthlyCancellations;
    const noShowLimit = status.policySettings.maxMonthlyNoShows;

    const nearCancellationLimit = status.currentCancellations >= cancellationLimit * 0.8;
    const nearNoShowLimit = status.currentNoShows >= noShowLimit * 0.8;

    return nearCancellationLimit || nearNoShowLimit;
  }, [status]);

  // Compute status indicator
  const getStatusIndicator = useCallback((): {
    color: 'red' | 'yellow' | 'green' | 'blue';
    icon: string;
    text: string;
  } => {
    if (!status) {
      return { color: 'green', icon: '✅', text: 'Normal' };
    }

    // Banned customer
    if (status.isBanned) {
      return { color: 'red', icon: '🚫', text: 'Engellenmiş' };
    }

    // Grace period
    if (status.gracePeriodActive) {
      return { color: 'blue', icon: '🆕', text: 'Yeni müşteri' };
    }

    // Calculate total violations
    const totalViolations = status.currentCancellations + status.currentNoShows;
    const cancellationLimit = status.policySettings.maxMonthlyCancellations;
    const noShowLimit = status.policySettings.maxMonthlyNoShows;

    // At or exceeded limits
    if (
      status.currentCancellations >= cancellationLimit ||
      status.currentNoShows >= noShowLimit
    ) {
      return { color: 'red', icon: '⚠️', text: 'Limit aşıldı' };
    }

    // Approaching limits (80% or more)
    if (
      status.currentCancellations >= cancellationLimit * 0.8 ||
      status.currentNoShows >= noShowLimit * 0.8
    ) {
      return { color: 'yellow', icon: '⚡', text: 'Dikkat' };
    }

    // Normal status
    return { color: 'green', icon: '✅', text: 'Normal' };
  }, [status]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError.message || 'Failed to fetch policy status';
      setError(errorMessage);
    }
  }, [queryError]);

  return {
    // Data
    status: status || null,
    isLoading,
    error,

    // Actions
    refetch,

    // Computed status
    isAtRisk: isAtRisk(),
    statusIndicator: getStatusIndicator()
  };
};
