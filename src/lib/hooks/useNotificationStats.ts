/**
 * useNotificationStats Hook
 *
 * React hook for fetching notification statistics with TanStack Query.
 * Provides comprehensive notification analytics and monitoring data.
 *
 * Features:
 * - Auto-refetching with configurable intervals
 * - Caching and cache invalidation
 * - Loading and error states
 * - Type-safe data access
 * - Rate limit monitoring
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { secureNotificationService } from '../services/secureNotifications';
import type {
  NotificationStats,
  SecurityAlert,
} from '@/src/types/notification';

// ============================================
// HOOK OPTIONS TYPES
// ============================================

interface UseNotificationStatsOptions {
  businessId: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
  refetchInterval?: number | false;
  onError?: (error: Error) => void;
}

interface UseSecurityAlertsOptions {
  businessId: string;
  hours?: number;
  enabled?: boolean;
  refetchInterval?: number | false;
  onError?: (error: Error) => void;
}

// ============================================
// HOOK RETURN TYPES
// ============================================

export interface UseNotificationStatsReturn {
  // Data
  stats: NotificationStats | undefined;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;

  // Error states
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => void;

  // Helpers
  isRateLimitHealthy: boolean;
  isRateLimitWarning: boolean;
  isRateLimitCritical: boolean;
  isRateLimitBlocked: boolean;
  successRate: number;
  failureRate: number;
}

export interface UseSecurityAlertsReturn {
  // Data
  alerts: SecurityAlert[] | undefined;
  totalAlerts: number;
  period: string | undefined;

  // Loading states
  isLoading: boolean;
  isFetching: boolean;

  // Error states
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => void;

  // Helpers
  hasCriticalAlerts: boolean;
  hasHighAlerts: boolean;
  criticalAlertsCount: number;
  highAlertsCount: number;
}

// ============================================
// NOTIFICATION STATS HOOK
// ============================================

export function useNotificationStats(
  options: UseNotificationStatsOptions
): UseNotificationStatsReturn {
  const { businessId, startDate, endDate, enabled = true, refetchInterval = 30000, onError } = options;

  const query = useQuery({
    queryKey: ['notification-stats', businessId, startDate, endDate],
    queryFn: async () => {
      const response = await secureNotificationService.getNotificationStats(
        businessId,
        startDate,
        endDate
      );
      return response.data;
    },
    enabled: enabled && !!businessId,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle errors
  if (query.isError && onError) {
    onError(query.error as Error);
  }

  // Extract stats data
  const stats = query.data;

  // Calculate helpers
  const rateLimitStatus = stats?.rateLimitStatus?.status;
  const isRateLimitHealthy = rateLimitStatus === 'HEALTHY';
  const isRateLimitWarning = rateLimitStatus === 'WARNING';
  const isRateLimitCritical = rateLimitStatus === 'CRITICAL';
  const isRateLimitBlocked = rateLimitStatus === 'BLOCKED';

  return {
    // Data
    stats,

    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,

    // Error states
    isError: query.isError,
    error: query.error as Error | null,

    // Actions
    refetch: query.refetch,

    // Helpers
    isRateLimitHealthy,
    isRateLimitWarning,
    isRateLimitCritical,
    isRateLimitBlocked,
    successRate: stats?.successRate ?? 0,
    failureRate: stats?.failureRate ?? 0,
  };
}

// ============================================
// SECURITY ALERTS HOOK
// ============================================

export function useSecurityAlerts(
  options: UseSecurityAlertsOptions
): UseSecurityAlertsReturn {
  const { businessId, hours = 24, enabled = true, refetchInterval = 60000, onError } = options;

  const query = useQuery({
    queryKey: ['security-alerts', businessId, hours],
    queryFn: async () => {
      const response = await secureNotificationService.getSecurityAlerts(
        businessId,
        hours
      );
      return response.data;
    },
    enabled: enabled && !!businessId,
    refetchInterval,
    refetchOnWindowFocus: true,
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle errors
  if (query.isError && onError) {
    onError(query.error as Error);
  }

  // Extract data
  const alerts = query.data?.alerts;
  const totalAlerts = query.data?.totalAlerts ?? 0;
  const period = query.data?.period;

  // Calculate helpers
  const criticalAlerts = alerts?.filter(alert => alert.severity === 'CRITICAL') ?? [];
  const highAlerts = alerts?.filter(alert => alert.severity === 'HIGH') ?? [];

  return {
    // Data
    alerts,
    totalAlerts,
    period,

    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,

    // Error states
    isError: query.isError,
    error: query.error as Error | null,

    // Actions
    refetch: query.refetch,

    // Helpers
    hasCriticalAlerts: criticalAlerts.length > 0,
    hasHighAlerts: highAlerts.length > 0,
    criticalAlertsCount: criticalAlerts.length,
    highAlertsCount: highAlerts.length,
  };
}

// ============================================
// COMBINED HOOK (Optional convenience hook)
// ============================================

export function useNotificationMonitoring(businessId: string) {
  const stats = useNotificationStats({ businessId });
  const alerts = useSecurityAlerts({ businessId });

  return {
    stats,
    alerts,
    isLoading: stats.isLoading || alerts.isLoading,
    hasIssues: stats.isRateLimitCritical || stats.isRateLimitBlocked || alerts.hasCriticalAlerts,
  };
}
