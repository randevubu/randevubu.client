import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import { Business } from '../../types/business';
import { Appointment } from '../../types';

/**
 * Batch API Service
 * 
 * This service provides methods to fetch multiple resources in a single request,
 * dramatically reducing the number of HTTP requests and improving performance.
 */

export interface DashboardBatchData {
  business: Business;
  upcomingAppointments?: Appointment[];
  todayAppointmentsCount?: number;
  services?: any[];
  recentCustomers?: any[];
}

export interface DashboardBatchParams {
  includeAppointments?: boolean;
  includeServices?: boolean;
  includeCustomers?: boolean;
  appointmentsLimit?: number;
  customersLimit?: number;
}

/**
 * Fetch all dashboard data in a single batch request
 * This reduces multiple API calls to just one
 */
export const batchService = {
  /**
   * Fetch dashboard data in one request
   * Falls back to individual requests if batch endpoint is not available
   */
  getDashboardData: async (params: DashboardBatchParams = {}): Promise<ApiResponse<DashboardBatchData>> => {
    try {
      // Try the batch endpoint first (if it exists on backend)
      const queryParams = new URLSearchParams();
      queryParams.append('includeSubscription', 'true');
      
      if (params.includeAppointments !== false) {
        queryParams.append('includeAppointments', 'true');
        if (params.appointmentsLimit) {
          queryParams.append('appointmentsLimit', params.appointmentsLimit.toString());
        }
      }
      
      if (params.includeServices) {
        queryParams.append('includeServices', 'true');
      }
      
      if (params.includeCustomers) {
        queryParams.append('includeCustomers', 'true');
        if (params.customersLimit) {
          queryParams.append('customersLimit', params.customersLimit.toString());
        }
      }

      const url = `/api/v1/dashboard/batch?${queryParams.toString()}`;
      const response = await apiClient.get<ApiResponse<DashboardBatchData>>(url);
      return response.data;
    } catch (error: any) {
      // If batch endpoint doesn't exist (404), fall back to individual requests
      if (error.response?.status === 404) {
        return await batchService.getDashboardDataFallback(params);
      }
      throw error;
    }
  },

  /**
   * Fallback method: Make parallel requests instead of sequential
   * Still much better than sequential requests in different components
   */
  getDashboardDataFallback: async (params: DashboardBatchParams = {}): Promise<ApiResponse<DashboardBatchData>> => {
    try {
      // Make all requests in parallel using Promise.allSettled (so one failure doesn't break everything)
      const requests: Promise<any>[] = [];
      
      // Always fetch business data
      requests.push(
        apiClient.get('/api/v1/businesses/my-business?includeSubscription=true')
      );

      // Conditionally fetch other data based on params (these are optional and won't break if they fail)
      if (params.includeAppointments !== false) {
        const limit = params.appointmentsLimit || 5;
        requests.push(
          apiClient.get(`/api/v1/appointments/my-appointments?limit=${limit}&page=1`)
            .catch(err => {
              return { data: { success: true, data: { appointments: [] } } };
            })
        );
      }

      if (params.includeServices) {
        requests.push(
          apiClient.get('/api/v1/businesses/my-services')
            .catch(err => {
              return { data: { success: true, data: [] } };
            })
        );
      }

      if (params.includeCustomers) {
        const limit = params.customersLimit || 10;
        requests.push(
          apiClient.get(`/api/v1/customers/recent?limit=${limit}`)
            .catch(err => {
              return { data: { success: true, data: [] } };
            })
        );
      }

      // Execute all requests in parallel - business is required, others are optional
      const responses = await Promise.all(requests);
      
      // Parse responses
      const businessResponse = responses[0].data;
      let currentIndex = 1;
      
      const result: DashboardBatchData = {
        business: businessResponse.data?.businesses?.[0] || businessResponse.data,
      };

      if (params.includeAppointments !== false) {
        const appointmentsResponse = responses[currentIndex].data;
        // Handle both response structures: data.appointments or data directly as array
        result.upcomingAppointments = appointmentsResponse.data?.appointments 
          || (Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : []);
        currentIndex++;
      }

      if (params.includeServices) {
        const servicesResponse = responses[currentIndex].data;
        result.services = servicesResponse.data || [];
        currentIndex++;
      }

      if (params.includeCustomers) {
        const customersResponse = responses[currentIndex].data;
        result.recentCustomers = customersResponse.data || [];
        currentIndex++;
      }

      return {
        success: true,
        message: 'Dashboard data fetched successfully',
        data: result
      };
    } catch (error) {
      console.error('Batch fallback failed:', error);
      throw error;
    }
  },

  /**
   * Prefetch dashboard data for faster page loads
   * Call this when you know the user will navigate to dashboard
   */
  prefetchDashboardData: async (params: DashboardBatchParams = {}): Promise<void> => {
    try {
      await batchService.getDashboardData(params);
    } catch (error) {
    }
  }
};

