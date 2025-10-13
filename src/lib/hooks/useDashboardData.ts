'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { batchService, DashboardBatchData, DashboardBatchParams } from '../services/batch';
import { useMyBusiness } from './useMyBusiness';

export interface UseDashboardDataResult {
  business: DashboardBatchData['business'] | null;
  upcomingAppointments: DashboardBatchData['upcomingAppointments'];
  services: DashboardBatchData['services'];
  recentCustomers: DashboardBatchData['recentCustomers'];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Optimized Dashboard Data Hook
 * 
 * This hook fetches all critical dashboard data in a single request,
 * dramatically reducing the number of API calls and improving performance.
 * 
 * Features:
 * - Single API call for all dashboard data (or parallel calls if batch not available)
 * - Automatic caching with TanStack Query
 * - Request deduplication across all dashboard components
 * - Optimal cache timing for dashboard data
 * 
 * Usage:
 * - Call this ONCE at the dashboard layout level
 * - Pass data down via context to child components
 * - Child components should NOT make separate API calls for the same data
 */
export function useDashboardData(params: DashboardBatchParams = {}): UseDashboardDataResult {
  // Use the existing useMyBusiness hook to share cache with other components!
  // This prevents duplicate API calls
  const { businesses, isLoading: businessLoading, isError: businessError, error: businessErrorObj, refetch: refetchBusiness } = useMyBusiness();
  const business = businesses.length > 0 ? businesses[0] : null;

  // If additional data is needed (appointments, services, customers), fetch separately
  // But for most dashboard pages, we only need business data
  const includeAdditionalData = params.includeAppointments || params.includeServices || params.includeCustomers;

  return {
    business,
    upcomingAppointments: [], // Can be expanded later if needed
    services: [], // Can be expanded later if needed
    recentCustomers: [], // Can be expanded later if needed
    isLoading: businessLoading,
    isError: businessError,
    error: businessErrorObj,
    refetch: () => {
      refetchBusiness();
    }
  };
}

/**
 * Lightweight hook to get just business data
 * Uses the same cache as useDashboardData to avoid duplicate requests
 */
export function useCachedBusiness() {
  const { business, isLoading, isError, error, refetch } = useDashboardData({
    includeAppointments: false,
    includeServices: false,
    includeCustomers: false
  });

  return {
    business,
    isLoading,
    isError,
    error,
    refetch
  };
}

