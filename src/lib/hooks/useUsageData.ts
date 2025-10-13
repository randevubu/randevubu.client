'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { usageService, UsageSummary, UsageAlerts, UsageLimitsCheck, DailySmsUsage, MonthlyUsage } from '../services/usage';
import { useDashboardBusiness } from '../../context/DashboardContext';

export interface UsageData {
  usageSummary: UsageSummary | null;
  usageAlerts: UsageAlerts | null;
  limitsCheck: UsageLimitsCheck | null;
  dailySmsData?: DailySmsUsage[];
  monthlyHistory?: MonthlyUsage[];
}

export interface UseUsageDataResult {
  // Core data
  usageSummary: UsageSummary | null;
  usageAlerts: UsageAlerts | null;
  limitsCheck: UsageLimitsCheck | null;
  dailySmsData: DailySmsUsage[];
  monthlyHistory: MonthlyUsage[];
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Actions
  refetch: () => void;
  refetchAlerts: () => void;
  refetchCharts: () => void;
  
  // Helper functions
  canSendSms: boolean;
  canAddStaff: boolean;
  canAddService: boolean;
  canAddCustomer: boolean;
  
  // Computed values
  currentMonth: UsageSummary['currentMonth'] | null;
  planLimits: UsageSummary['planLimits'] | null;
  remainingQuotas: UsageSummary['remainingQuotas'] | null;
}

/**
 * HIGHLY OPTIMIZED hook for fetching usage data with TanStack Query
 * 
 * Strategy:
 * 1. Single primary query fetches usage summary (contains most data)
 * 2. Only fetch alerts and limits when needed (not on every page load)
 * 3. Aggressive caching for stable data
 * 4. Smart refetch strategies
 * 
 * This reduces network requests from 4+ to 1-2 requests
 */
export function useUsageData(options?: {
  includeAlerts?: boolean;
  includeLimits?: boolean;
  includeCharts?: boolean;
  smsDays?: number;
  historyMonths?: number;
}): UseUsageDataResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();
  
  // Use cached business data from context - no additional API call!
  const business = useDashboardBusiness();
  const businessId = business?.id || '';
  const { 
    includeAlerts = false, 
    includeLimits = false, 
    includeCharts = false, 
    smsDays = 30, 
    historyMonths = 12 
  } = options || {};

  // PRIMARY QUERY: Usage Summary (contains most data we need)
  // This is the only query that runs by default
  const summaryQuery: UseQueryResult<UsageSummary, Error> = useQuery({
    queryKey: ['usage-summary', businessId],
    queryFn: async (): Promise<UsageSummary> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const response = await usageService.getUsageSummary(businessId);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch usage summary');
      }

      return response.data;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes - usage data doesn't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on focus - usage data is stable
    refetchOnReconnect: true, // Refetch on reconnect
    retry: (failureCount, error) => {
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 2; // Reduce retries
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Faster retry
  });

  // CONDITIONAL QUERY: Usage Alerts (only when explicitly requested)
  const alertsQuery: UseQueryResult<UsageAlerts, Error> = useQuery({
    queryKey: ['usage-alerts', businessId],
    queryFn: async (): Promise<UsageAlerts> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const response = await usageService.getUsageAlerts(businessId);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch usage alerts');
      }

      return response.data;
    },
    enabled: includeAlerts && !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  // CONDITIONAL QUERY: Limits Check (only when explicitly requested)
  const limitsQuery: UseQueryResult<UsageLimitsCheck, Error> = useQuery({
    queryKey: ['usage-limits', businessId],
    queryFn: async (): Promise<UsageLimitsCheck> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const response = await usageService.checkUsageLimits(businessId);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to check usage limits');
      }

      return response.data;
    },
    enabled: includeLimits && !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  // CONDITIONAL QUERY: Daily SMS data (only when charts are needed)
  const dailySmsQuery: UseQueryResult<DailySmsUsage[], Error> = useQuery({
    queryKey: ['usage-daily-sms', businessId, smsDays],
    queryFn: async (): Promise<DailySmsUsage[]> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const response = await usageService.getDailySmsUsage(businessId, smsDays);
      
      if (!response.success || !response.data) {
        return []; // Return empty array for chart data if it fails
      }

      return response.data;
    },
    enabled: includeCharts && !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes - chart data changes rarely
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  // CONDITIONAL QUERY: Monthly history (only when charts are needed)
  const monthlyHistoryQuery: UseQueryResult<MonthlyUsage[], Error> = useQuery({
    queryKey: ['usage-monthly-history', businessId, historyMonths],
    queryFn: async (): Promise<MonthlyUsage[]> => {
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      const response = await usageService.getMonthlyUsageHistory(businessId, historyMonths);
      
      if (!response.success || !response.data) {
        return []; // Return empty array for chart data if it fails
      }

      return response.data;
    },
    enabled: includeCharts && !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    staleTime: 15 * 60 * 1000, // 15 minutes - historical data changes rarely
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  // Determine overall loading state (only for primary query by default)
  const isLoading = summaryQuery.isLoading;
  
  // Determine overall error state
  const isError = summaryQuery.isError;
  const error = summaryQuery.error;

  // Helper functions for checking limits (from summary data, not separate query)
  // Note: 0 or negative values for limits are treated as unlimited
  const canSendSms = summaryQuery.data?.planLimits ? 
    (summaryQuery.data.currentMonth?.smssSent || 0) < (summaryQuery.data.planLimits.smsQuota || 0) : 
    (limitsQuery.data?.sms?.allowed || false);
  
  const canAddStaff = summaryQuery.data?.planLimits ? 
    (summaryQuery.data.currentMonth?.staffMembersActive || 0) < (summaryQuery.data.planLimits.maxStaffPerBusiness || 0) : 
    (limitsQuery.data?.staff?.allowed || false);
  
  const canAddService = summaryQuery.data?.planLimits ? 
    ((summaryQuery.data.planLimits.maxServices || 0) <= 0 ? true : (summaryQuery.data.currentMonth?.servicesActive || 0) < summaryQuery.data.planLimits.maxServices) : 
    (limitsQuery.data?.service?.allowed || false);
  
  const canAddCustomer = summaryQuery.data?.planLimits ? 
    ((summaryQuery.data.planLimits.maxCustomers || 0) <= 0 ? true : (summaryQuery.data.currentMonth?.customersAdded || 0) < summaryQuery.data.planLimits.maxCustomers) : 
    (limitsQuery.data?.customer?.allowed || false);

  // Computed values from summary data
  const currentMonth = summaryQuery.data?.currentMonth || null;
  const planLimits = summaryQuery.data?.planLimits || null;
  const remainingQuotas = summaryQuery.data?.remainingQuotas || null;

  // Refetch functions
  const refetch = () => {
    summaryQuery.refetch();
    if (includeAlerts) alertsQuery.refetch();
    if (includeLimits) limitsQuery.refetch();
    if (includeCharts) {
      dailySmsQuery.refetch();
      monthlyHistoryQuery.refetch();
    }
  };

  const refetchAlerts = () => {
    if (includeAlerts) alertsQuery.refetch();
    if (includeLimits) limitsQuery.refetch();
  };

  const refetchCharts = () => {
    if (includeCharts) {
      dailySmsQuery.refetch();
      monthlyHistoryQuery.refetch();
    }
  };

  return {
    // Core data
    usageSummary: summaryQuery.data || null,
    usageAlerts: alertsQuery.data || null,
    limitsCheck: limitsQuery.data || null,
    dailySmsData: dailySmsQuery.data || [],
    monthlyHistory: monthlyHistoryQuery.data || [],
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Actions
    refetch,
    refetchAlerts,
    refetchCharts,
    
    // Helper functions
    canSendSms,
    canAddStaff,
    canAddService,
    canAddCustomer,
    
    // Computed values
    currentMonth,
    planLimits,
    remainingQuotas,
  };
}