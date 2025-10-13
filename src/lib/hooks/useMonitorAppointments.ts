'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../services/appointments';
import { MonitorAppointmentsParams, MonitorAppointmentsResponse, MonitorAppointment, MonitorStats } from '../../types';

export interface UseMonitorAppointmentsOptions {
  businessId: string;
  refetchInterval?: number;  // Default: 15000ms (15 seconds)
  autoRefresh?: boolean;     // Default: true
  includeStats?: boolean;    // Default: true
  maxQueueSize?: number;     // Default: 10
  date?: string;             // YYYY-MM-DD format, defaults to today
}

export interface UseMonitorAppointmentsResult {
  // Queue data
  currentAppointment: MonitorAppointment | null;
  nextAppointment: MonitorAppointment | null;
  waitingQueue: MonitorAppointment[];
  
  // Statistics
  stats: MonitorStats | null;
  
  // Business info
  businessInfo: {
    name: string;
    timezone: string;
  } | null;
  
  // State
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // Actions
  refetch: () => void;
  refreshNow: () => void;
}

/**
 * Custom hook for fetching and managing monitor appointments data with real-time polling
 * 
 * Features:
 * - Real-time polling with configurable interval
 * - Optimized for monitor displays
 * - Automatic error handling and retry logic
 * - Background refresh without disrupting UI
 * - Connection status monitoring
 */
export function useMonitorAppointments(options: UseMonitorAppointmentsOptions): UseMonitorAppointmentsResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();
  
  const {
    businessId,
    refetchInterval = 15000, // 15 seconds
    autoRefresh = true,
    includeStats = true,
    maxQueueSize = 10,
    date
  } = options;

  // Build query parameters
  const queryParams: MonitorAppointmentsParams = {
    businessId,
    includeStats,
    maxQueueSize,
    ...(date && { date })
  };

  // Build query key
  const queryKey = [
    'monitor-appointments',
    businessId,
    date || 'today',
    includeStats,
    maxQueueSize
  ];

  // Fetch monitor data
  const queryResult: UseQueryResult<MonitorAppointmentsResponse, Error> = useQuery({
    queryKey,
    queryFn: async (): Promise<MonitorAppointmentsResponse> => {
      console.log('🔄 Monitor: Fetching appointments...', queryParams);

      const response = await appointmentService.getMonitorAppointments(queryParams);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch monitor appointments');
      }

      console.log('📺 Monitor: Fetched appointments:', {
        current: response.data.current ? 'Yes' : 'No',
        next: response.data.next ? 'Yes' : 'No',
        queueLength: response.data.queue.length,
        stats: response.data.stats
      });

      return response;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!businessId,
    refetchInterval: autoRefresh ? refetchInterval : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: 30000, // Keep in cache for 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  // Extract data from response
  const currentAppointment = data?.data?.current || null;
  const nextAppointment = data?.data?.next || null;
  const waitingQueue = data?.data?.queue || [];
  const stats = data?.data?.stats || null;
  const businessInfo = data?.data?.businessInfo || null;
  const lastUpdated = data?.data?.lastUpdated ? new Date(data.data.lastUpdated) : null;

  // Manual refresh function
  const refreshNow = () => {
    console.log('🔄 Monitor: Manual refresh triggered');
    refetch();
  };

  return {
    // Queue data
    currentAppointment,
    nextAppointment,
    waitingQueue,
    
    // Statistics
    stats,
    
    // Business info
    businessInfo,
    
    // State
    isLoading,
    isError,
    error,
    lastUpdated,
    
    // Actions
    refetch: () => refetch(),
    refreshNow,
  };
}
