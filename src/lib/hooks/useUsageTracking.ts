'use client';

import { useUsageData, UseUsageDataResult } from './useUsageData';

export interface UsageLimits {
  canSendSms: boolean;
  canAddStaff: boolean;
  canAddService: boolean;
  canAddCustomer: boolean;
}

/**
 * Hook that provides usage limits checking functionality
 * This is a wrapper around useUsageData that focuses on limit checking
 */
export function useUsageLimits(businessId: string): UsageLimits {
  const { canSendSms, canAddStaff, canAddService, canAddCustomer } = useUsageData({
    includeLimits: true
  });

  return {
    canSendSms,
    canAddStaff,
    canAddService,
    canAddCustomer
  };
}

/**
 * Main usage tracking hook that provides comprehensive usage data
 * This is the primary hook used by components that need full usage information
 */
export function useUsageTracking(businessId: string): UseUsageDataResult {
  return useUsageData({
    includeAlerts: true,
    includeLimits: true,
    includeCharts: false
  });
}
