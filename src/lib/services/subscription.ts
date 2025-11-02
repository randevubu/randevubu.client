import { apiClient } from '../api';
import { extractErrorMessage, extractApiError, isAxiosError } from '../utils/errorExtractor';
import { 
  BusinessSubscription, 
  SubscriptionPlan, 
  CreateBusinessSubscriptionData, 
  UpdateBusinessSubscriptionData, 
  ChangePlanData, 
  ChangePlanResponse, 
  PaymentMethod, 
  AddPaymentMethodData, 
  PlanChangePreview, 
  Location,
  SubscriptionPlansResponse,
  SubscriptionPlansByTierResponse,
  SubscriptionPlansByCityResponse,
  TrialSubscriptionRequest,
  TrialSubscriptionResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse
} from '../../types/subscription';
import { discountCodeService } from './discountCode';

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
  async getSubscriptionPlans(city?: string): Promise<SubscriptionPlan[]> {
    try {
      const url = city 
        ? `/api/v1/subscriptions/plans?city=${encodeURIComponent(city)}`
        : '/api/v1/subscriptions/plans';
      
      const response = await apiClient.get<SubscriptionPlansResponse>(url);
      return response.data.data.plans;
    } catch (error: unknown) {
      console.error('Failed to fetch subscription plans:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch subscription plans');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get subscription plans by tier
   */
  async getSubscriptionPlansByTier(tier: 'TIER_1' | 'TIER_2' | 'TIER_3'): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<SubscriptionPlansByTierResponse>(`/api/v1/subscriptions/plans?tier=${tier}`);
      return response.data.data.plans;
    } catch (error: unknown) {
      console.error('Failed to fetch subscription plans by tier:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch subscription plans by tier');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get subscription plans by city (automatically determines tier)
   */
  async getSubscriptionPlansByCity(city: string): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<SubscriptionPlansByCityResponse>(`/api/v1/subscriptions/plans?city=${encodeURIComponent(city)}`);
      return response.data.data.plans;
    } catch (error: unknown) {
      console.error('Failed to fetch subscription plans by city:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch subscription plans by city');
      throw new Error(errorMessage);
    }
  }

  /**
   * Get subscription plans with location information (legacy method for backward compatibility)
   */
  async getSubscriptionPlansWithLocation(city?: string): Promise<{ plans: SubscriptionPlan[]; location: Location }> {
    try {
      const url = city 
        ? `/api/v1/subscriptions/plans?city=${encodeURIComponent(city)}`
        : '/api/v1/subscriptions/plans';
      
      const response = await apiClient.get<SubscriptionPlansResponse>(url);
      return {
        plans: response.data.data.plans,
        location: {
          city: city || 'Unknown',
          state: 'Unknown',
          country: 'Turkey',
          detected: false,
          source: 'manual' as const,
          accuracy: 'low' as const
        }
      };
    } catch (error: unknown) {
      console.error('Failed to fetch subscription plans with location:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch subscription plans with location');
      throw new Error(errorMessage);
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
    } catch (error: unknown) {
      console.error('Failed to fetch business subscription:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Abonelik bilgileri alınamadı'),
          code: apiError?.code
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
    } catch (error: unknown) {
      console.error('Failed to fetch business subscription with plan:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Abonelik ve plan bilgileri alınamadı'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Create a new business subscription (legacy method)
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
    } catch (error: unknown) {
      console.error('Failed to create business subscription:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Abonelik oluşturulamadı'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Create a trial subscription (new API endpoint from documentation)
   */
  async createTrialSubscription(
    businessId: string,
    trialData: TrialSubscriptionRequest
  ): Promise<SubscriptionServiceResponse<TrialSubscriptionResponse>> {
    try {
      const response = await apiClient.post(`/api/v1/subscriptions/business/${businessId}/subscribe`, trialData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      console.error('Failed to create trial subscription:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Deneme aboneliği oluşturulamadı'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Apply a discount code to an existing subscription
   */
  async applyDiscountCode(
    businessId: string,
    discountCode: string
  ): Promise<SubscriptionServiceResponse<{ message: string }>> {
    try {
      const response = await apiClient.post(`/api/v1/subscriptions/business/${businessId}/apply-discount`, {
        discountCode
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      console.error('Failed to apply discount code:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'İndirim kodu uygulanamadı'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Validate a discount code for a specific plan
   */
  async validateDiscountCode(
    code: string,
    planId: string,
    amount: number,
    userId: string
  ) {
    return await discountCodeService.validateDiscountCode(code, planId, amount, userId);
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
    } catch (error: unknown) {
      console.error('Failed to update business subscription:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Abonelik güncellenemedi'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Cancel business subscription (updated to use new API endpoint)
   */
  async cancelBusinessSubscription(
    businessId: string, 
    cancelData: CancelSubscriptionRequest = { cancelAtPeriodEnd: true }
  ): Promise<SubscriptionServiceResponse<CancelSubscriptionResponse>> {
    try {
      const response = await apiClient.post(`/api/v1/subscriptions/business/${businessId}/cancel`, cancelData);
      return {
        success: true,
        data: response.data
      };
    } catch (error: unknown) {
      console.error('Failed to cancel business subscription:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Abonelik iptal edilemedi'),
          code: apiError?.code
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
    } catch (error: unknown) {
      console.error('Failed to reactivate business subscription:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Abonelik yeniden aktifleştirilemedi'),
          code: apiError?.code
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
    } catch (error: unknown) {
      console.error('Failed to fetch subscription usage:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Kullanım istatistikleri alınamadı'),
          code: apiError?.code
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
    } catch (error: unknown) {
      console.error('Failed to fetch billing history:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Fatura geçmişi alınamadı'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Change subscription plan with enhanced options and payment handling
   */
  async changePlan(
    businessId: string,
    subscriptionId: string,
    changePlanData: ChangePlanData
  ): Promise<SubscriptionServiceResponse<{data: ChangePlanResponse; message: string}>> {
    try {
      const response = await apiClient.post(`/api/v1/businesses/${businessId}/subscription/${subscriptionId}/change-plan`, changePlanData);
      return {
        success: true,
        data: {
          data: response.data.data,
          message: response.data.message
        }
      };
    } catch (error: unknown) {
      console.error('Failed to change subscription plan:', error);

      // Enhanced error handling for payment scenarios
      const apiError = extractApiError(error);
      const errorMessage = apiError?.message || extractErrorMessage(error, 'Abonelik planı değiştirilemedi');

      return {
        success: false,
        error: {
          message: errorMessage,
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Get available payment methods for the business
   */
  async getPaymentMethods(businessId: string): Promise<SubscriptionServiceResponse<PaymentMethod[]>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/payment-methods`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error: unknown) {
      console.error('Failed to fetch payment methods:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Ödeme yöntemleri alınamadı'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Add new payment method for the business
   */
  async addPaymentMethod(
    businessId: string,
    paymentData: AddPaymentMethodData
  ): Promise<SubscriptionServiceResponse<PaymentMethod>> {
    try {
      const response = await apiClient.post(`/api/v1/businesses/${businessId}/payment-methods`, paymentData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: unknown) {
      console.error('Failed to add payment method:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Ödeme yöntemi eklenemedi'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * Calculate plan change preview with pricing and validation
   */
  async calculatePlanChange(
    businessId: string,
    subscriptionId: string,
    newPlanId: string
  ): Promise<SubscriptionServiceResponse<PlanChangePreview>> {
    try {
      const response = await apiClient.post(`/api/v1/businesses/${businessId}/subscription/${subscriptionId}/calculate-change`, {
        newPlanId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: unknown) {
      console.error('Failed to calculate plan change:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Plan değişikliği hesaplanamadı'),
          code: apiError?.code
        }
      };
    }
  }

  /**
   * @deprecated Use changePlan instead
   * Legacy method for changing subscription plan (simplified version)
   */
  async changeSubscriptionPlan(
    businessId: string,
    subscriptionId: string,
    newPlanId: string
  ): Promise<SubscriptionServiceResponse<BusinessSubscription>> {
    try {
      const changePlanData: ChangePlanData = {
        newPlanId,
        effectiveDate: 'immediate',
        prorationPreference: 'prorate'
      };

      const response = await this.changePlan(businessId, subscriptionId, changePlanData);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as unknown as BusinessSubscription 
        };
      } else {
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error: unknown) {
      console.error('Failed to change subscription plan:', error);
      const apiError = extractApiError(error);
      return {
        success: false,
        error: {
          message: apiError?.message || extractErrorMessage(error, 'Abonelik planı değiştirilemedi'),
          code: apiError?.code
        }
      };
    }
  }
}

// Export a default instance
export const subscriptionService = new SubscriptionService();
