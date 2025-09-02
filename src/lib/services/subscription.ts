import { apiClient } from '../api';
import { BusinessSubscription, SubscriptionPlan, CreateBusinessSubscriptionData, UpdateBusinessSubscriptionData } from '../../types/subscription';

export interface SubscriptionServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export class SubscriptionService {
  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get('/api/v1/subscriptions/plans');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get business subscription details with plan information
   */
  async getBusinessSubscription(businessId: string): Promise<SubscriptionServiceResponse<BusinessSubscription>> {
    try {
      const response = await apiClient.get(`/api/v1/subscriptions/business/${businessId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to fetch business subscription:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Abonelik bilgileri alınamadı',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Get business subscription with detailed plan information
   */
  async getBusinessSubscriptionWithPlan(businessId: string): Promise<SubscriptionServiceResponse<any>> {
    try {
      const response = await apiClient.get(`/api/v1/subscriptions/business/${businessId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to fetch business subscription with plan:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Abonelik ve plan bilgileri alınamadı',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Create a new business subscription
   */
  async createBusinessSubscription(
    businessId: string, 
    subscriptionData: CreateBusinessSubscriptionData
  ): Promise<SubscriptionServiceResponse<BusinessSubscription>> {
    try {
      const response = await apiClient.post(`/api/v1/businesses/${businessId}/subscription`, subscriptionData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to create business subscription:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Abonelik oluşturulamadı',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Update business subscription
   */
  async updateBusinessSubscription(
    businessId: string, 
    subscriptionId: string, 
    updateData: UpdateBusinessSubscriptionData
  ): Promise<SubscriptionServiceResponse<BusinessSubscription>> {
    try {
      const response = await apiClient.patch(`/api/v1/businesses/${businessId}/subscription/${subscriptionId}`, updateData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to update business subscription:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Abonelik güncellenemedi',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Cancel business subscription
   */
  async cancelBusinessSubscription(
    businessId: string, 
    subscriptionId: string
  ): Promise<SubscriptionServiceResponse<BusinessSubscription>> {
    try {
      const response = await apiClient.post(`/api/v1/subscriptions/business/${businessId}/cancel`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to cancel business subscription:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Abonelik iptal edilemedi',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateBusinessSubscription(
    businessId: string, 
    subscriptionId: string
  ): Promise<SubscriptionServiceResponse<BusinessSubscription>> {
    try {
      const response = await apiClient.post(`/api/v1/businesses/${businessId}/subscription/${subscriptionId}/reactivate`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to reactivate business subscription:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Abonelik yeniden aktifleştirilemedi',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Get subscription usage statistics
   */
  async getSubscriptionUsage(businessId: string): Promise<SubscriptionServiceResponse<any>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/subscription/usage`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to fetch subscription usage:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Kullanım istatistikleri alınamadı',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Get subscription billing history
   */
  async getBillingHistory(businessId: string): Promise<SubscriptionServiceResponse<any[]>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/subscription/billing`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error: any) {
      console.error('Failed to fetch billing history:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Fatura geçmişi alınamadı',
          code: error.response?.data?.code
        }
      };
    }
  }

  /**
   * Upgrade/downgrade subscription plan
   */
  async changeSubscriptionPlan(
    businessId: string, 
    subscriptionId: string, 
    newPlanId: string,
    discountCode?: string
  ): Promise<SubscriptionServiceResponse<BusinessSubscription>> {
    try {
      const requestData: any = { newPlanId };
      if (discountCode) {
        requestData.discountCode = discountCode;
      }

      const response = await apiClient.post(`/api/v1/businesses/${businessId}/subscription/${subscriptionId}/change-plan`, requestData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Failed to change subscription plan:', error);
      return {
        success: false,
        error: {
          message: error.response?.data?.message || 'Abonelik planı değiştirilemedi',
          code: error.response?.data?.code
        }
      };
    }
  }
}

// Export a default instance
export const subscriptionService = new SubscriptionService();
