import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import { Service } from '../../types/service';

export interface MyServicesParams {
  businessId?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface MyServicesResponse {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
}

export const servicesService = {
  getMyServices: async (params?: MyServicesParams): Promise<ApiResponse<MyServicesResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.businessId) queryParams.append('businessId', params.businessId);
    if (params?.active !== undefined) queryParams.append('active', params.active.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/v1/businesses/my-services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<MyServicesResponse>>(url);
    return response.data;
  },

  updateServiceStatus: async (serviceId: string, isActive: boolean): Promise<ApiResponse<Service>> => {
    const response = await apiClient.patch<ApiResponse<Service>>(
      `/api/v1/services/${serviceId}`,
      { isActive }
    );
    return response.data;
  },

  getServiceDetails: async (serviceId: string): Promise<ApiResponse<Service>> => {
    const response = await apiClient.get<ApiResponse<Service>>(
      `/api/v1/services/${serviceId}`
    );
    return response.data;
  },

  createService: async (data: {
    businessId: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
    currency?: string;
  }): Promise<ApiResponse<Service>> => {
    const response = await apiClient.post<ApiResponse<Service>>(
      '/api/v1/services',
      data
    );
    return response.data;
  },

  // Create service for a specific business - new API endpoint
  createServiceForBusiness: async (businessId: string, data: {
    name: string;
    description?: string;
    duration: number;
    price: number;
    currency?: string;
  }): Promise<ApiResponse<Service>> => {
    const response = await apiClient.post<ApiResponse<Service>>(
      `/api/v1/services/business/${businessId}`,
      data
    );
    return response.data;
  },

  updateService: async (serviceId: string, data: {
    name?: string;
    description?: string;
    duration?: number;
    price?: number;
    currency?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Service>> => {
    const response = await apiClient.put<ApiResponse<Service>>(
      `/api/v1/services/${serviceId}`,
      data
    );
    return response.data;
  },

  deleteService: async (serviceId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/api/v1/services/${serviceId}`
    );
    return response.data;
  }
};