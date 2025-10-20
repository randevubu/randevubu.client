'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { appointmentService, MyAppointmentsParams, MyAppointmentsResponse } from '../services/appointments';
import { Appointment, AppointmentStatus } from '../../types';

export interface UseAppointmentsParams extends MyAppointmentsParams {
  dateRange?: { start: string; end: string };
  dateFrom?: string;
  dateTo?: string;
}

export interface UseAppointmentsResult {
  appointments: Appointment[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;
  isUpdatingStatus: boolean;
}

/**
 * Custom hook to fetch and manage appointments data with TanStack Query
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Request deduplication across components
 * - Built-in loading and error states
 * - Optimistic updates for status changes
 * - Stale-while-revalidate behavior
 */
export function useAppointments(params: UseAppointmentsParams = {}): UseAppointmentsResult {
  const { user, isAuthenticated, hasInitialized, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Build query key based on parameters
  const queryKey = [
    'appointments',
    'business-owner',
    user?.id,
    params.businessId,
    params.date,
    params.dateRange?.start,
    params.dateRange?.end,
    params.dateFrom,
    params.dateTo,
    params.status,
    params.page,
    params.limit
  ];

  // Fetch appointments
  const queryResult: UseQueryResult<MyAppointmentsResponse, Error> = useQuery({
    queryKey,
    queryFn: async (): Promise<MyAppointmentsResponse> => {
      console.log('🔄 TanStack Query: Fetching appointments...', params);

      const queryParams: any = { ...params };
      
      // Set date range based on view mode
      if (params.dateRange) {
        queryParams.dateFrom = params.dateRange.start;
        queryParams.dateTo = params.dateRange.end;
      } else if (params.dateFrom && params.dateTo) {
        queryParams.dateFrom = params.dateFrom;
        queryParams.dateTo = params.dateTo;
      }

      const response = await appointmentService.getBusinessOwnerAppointments(queryParams);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch appointments');
      }

      if (!response.data) {
        return {
          appointments: [],
          total: 0,
          page: 1,
          totalPages: 0
        };
      }

      console.log('📅 TanStack Query: Fetched appointments:', response.data.appointments.length);
      return response.data;
    },
    enabled: !!user && isAuthenticated && hasInitialized && !authLoading && !!params.businessId,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds (reduced for development)
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes (reduced)
    refetchOnWindowFocus: true, // Allow refetch on focus for fresh data
    refetchOnMount: true, // Allow refetch on mount for fresh data
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) => {
      const response = await appointmentService.updateAppointmentStatus(appointmentId, status);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update appointment status');
      }
      
      return response.data;
    },
    onMutate: async ({ appointmentId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<MyAppointmentsResponse>(queryKey);

      // Optimistically update the appointment status
      if (previousData) {
        queryClient.setQueryData<MyAppointmentsResponse>(queryKey, {
          ...previousData,
          appointments: previousData.appointments.map(apt =>
            apt.id === appointmentId ? { ...apt, status } : apt
          )
        });
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const { data, isLoading, isError, error, refetch } = queryResult;

  return {
    appointments: data?.appointments ?? [],
    pagination: {
      total: data?.total ?? 0,
      page: data?.page ?? 1,
      totalPages: data?.totalPages ?? 0
    },
    isLoading,
    isError,
    error,
    refetch: () => {
      refetch();
    },
    updateAppointmentStatus: async (appointmentId: string, status: AppointmentStatus) => {
      await updateStatusMutation.mutateAsync({ appointmentId, status });
    },
    isUpdatingStatus: updateStatusMutation.isPending
  };
}
