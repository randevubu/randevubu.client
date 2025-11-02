import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService, Customer, CustomerDetails, GetCustomersParams, BanCustomerRequest, UnbanCustomerRequest } from '../services/customers';
import { handleApiError } from '../utils/toast';

// Query keys for consistent caching
// Using individual param values instead of object to avoid cache misses
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: Partial<GetCustomersParams>) => [
    ...customerKeys.lists(),
    params.status,
    params.search,
    params.page,
    params.limit,
    params.sortBy,
    params.sortOrder
  ] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

// Hook for fetching customers list
export function useCustomers(params: Partial<GetCustomersParams> = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: async () => {
      const response = await customerService.getMyCustomers(params);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch customers');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401/403 errors
      const axiosError = isAxiosError(error);
      if (axiosError && (error.response?.status === 401 || error.response?.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook for fetching individual customer details
export function useCustomerDetails(customerId: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(customerId || ''),
    queryFn: async () => {
      if (!customerId) return null;
      
      const response = await customerService.getCustomerDetails(customerId);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.message || 'Failed to fetch customer details');
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook for banning a customer
export function useBanCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, banData }: { customerId: string; banData: BanCustomerRequest }) => {
      const response = await customerService.banCustomer(customerId, banData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to ban customer');
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate customers list to refetch updated data
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate customer details if they're currently being viewed
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

// Hook for unbanning a customer
export function useUnbanCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, unbanData }: { customerId: string; unbanData: UnbanCustomerRequest }) => {
      const response = await customerService.unbanCustomer(customerId, unbanData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to unban customer');
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate customers list to refetch updated data
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate customer details if they're currently being viewed
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

// Hook for flagging a customer
export function useFlagCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, flagData }: { customerId: string; flagData: any }) => {
      const response = await customerService.flagCustomer(customerId, flagData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to flag customer');
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate customers list to refetch updated data
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate customer details if they're currently being viewed
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

// Hook for adding a strike to a customer
export function useAddStrike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, strikeData }: { customerId: string; strikeData: any }) => {
      const response = await customerService.addStrike(customerId, strikeData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to add strike');
      }
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate customers list to refetch updated data
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate customer details if they're currently being viewed
      queryClient.invalidateQueries({ queryKey: customerKeys.details() });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

// Hook for updating customer profile
export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ customerId, profileData }: { customerId: string; profileData: any }) => {
      const response = await customerService.updateCustomerProfile(customerId, profileData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update customer profile');
      }
      
      return response.data;
    },
    onSuccess: (_, { customerId }) => {
      // Invalidate specific customer details
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
      
      // Invalidate customers list to refetch updated data
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}



