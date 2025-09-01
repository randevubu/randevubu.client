import { apiClient } from '../api';
import { 
  DiscountCode, 
  DiscountCodeUsage, 
  CreateDiscountCodeData, 
  UpdateDiscountCodeData,
  ValidateDiscountCodeRequest,
  ValidateDiscountCodeResponse,
  BulkCreateDiscountCodesData,
  DiscountCodeStatistics,
  PaginatedDiscountCodes,
  PaginatedDiscountCodeUsages
} from '../../types/discount';
import { ApiResponse } from '../../types/api';

const DISCOUNT_CODES_BASE_URL = '/api/v1/discount-codes';

export const discountService = {
  // Admin endpoints (require authentication & admin permissions)
  
  /**
   * Create a new discount code
   */
  async createDiscountCode(data: CreateDiscountCodeData): Promise<ApiResponse<DiscountCode>> {
    try {
      const response = await apiClient.post(DISCOUNT_CODES_BASE_URL, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create discount code',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to create discount code'
        }
      };
    }
  },

  /**
   * Get all discount codes with pagination
   */
  async getDiscountCodes(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedDiscountCodes>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      
      const url = queryParams.toString() 
        ? `${DISCOUNT_CODES_BASE_URL}?${queryParams.toString()}`
        : DISCOUNT_CODES_BASE_URL;
        
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch discount codes',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch discount codes'
        }
      };
    }
  },

  /**
   * Get discount code by ID
   */
  async getDiscountCodeById(id: string): Promise<ApiResponse<DiscountCode>> {
    try {
      const response = await apiClient.get(`${DISCOUNT_CODES_BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch discount code',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch discount code'
        }
      };
    }
  },

  /**
   * Update discount code
   */
  async updateDiscountCode(id: string, data: UpdateDiscountCodeData): Promise<ApiResponse<DiscountCode>> {
    try {
      const response = await apiClient.put(`${DISCOUNT_CODES_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update discount code',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to update discount code'
        }
      };
    }
  },

  /**
   * Deactivate discount code
   */
  async deactivateDiscountCode(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.patch(`${DISCOUNT_CODES_BASE_URL}/${id}/deactivate`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to deactivate discount code',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to deactivate discount code'
        }
      };
    }
  },

  /**
   * Delete discount code
   */
  async deleteDiscountCode(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${DISCOUNT_CODES_BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to delete discount code',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to delete discount code',
        }
      };
    }
  },

  /**
   * Get usage history for a discount code
   */
  async getDiscountCodeUsage(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedDiscountCodeUsages>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = queryParams.toString() 
        ? `${DISCOUNT_CODES_BASE_URL}/${id}/usage?${queryParams.toString()}`
        : `${DISCOUNT_CODES_BASE_URL}/${id}/usage`;
        
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch usage history',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch usage history'
        }
      };
    }
  },

  /**
   * Get discount codes statistics
   */
  async getStatistics(): Promise<ApiResponse<DiscountCodeStatistics>> {
    try {
      const response = await apiClient.get(`${DISCOUNT_CODES_BASE_URL}/statistics`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch statistics',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch statistics'
        }
      };
    }
  },

  /**
   * Generate bulk discount codes
   */
  async createBulkDiscountCodes(data: BulkCreateDiscountCodesData): Promise<ApiResponse<{ codes: DiscountCode[]; count: number }>> {
    try {
      const response = await apiClient.post(`${DISCOUNT_CODES_BASE_URL}/bulk`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to generate bulk discount codes',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to generate bulk discount codes'
        }
      };
    }
  },

  // Public endpoint (no authentication required)
  
  /**
   * Validate discount code for a specific plan and amount
   */
  async validateDiscountCode(data: ValidateDiscountCodeRequest): Promise<ApiResponse<ValidateDiscountCodeResponse>> {
    try {
      const response = await apiClient.post(`${DISCOUNT_CODES_BASE_URL}/validate`, {
        ...data,
        code: data.code.toUpperCase() // Convert to uppercase as mentioned in best practices
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to validate discount code',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to validate discount code'
        }
      };
    }
  }
};