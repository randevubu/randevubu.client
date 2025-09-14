import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';

// Types based on the Usage Tracking API documentation
export interface MonthlyUsage {
  businessId: string;
  month: number;
  year: number;
  smssSent: number;
  appointmentsCreated: number;
  staffMembersActive: number;
  customersAdded: number;
  servicesActive: number;
  storageUsedMB: number;
  apiCallsCount: number;
  lastUpdatedAt: string;
}

export interface YearToDateUsage {
  smssSent: number;
  appointmentsCreated: number;
  customersAdded: number;
}

export interface PlanLimits {
  smsQuota: number;
  maxStaffPerBusiness: number;
  maxAppointmentsPerDay: number;
  maxCustomers: number;
  maxServices: number;
  storageGB: number;
}

export interface RemainingQuotas {
  smsRemaining: number;
  staffSlotsRemaining: number;
  customerSlotsRemaining: number;
  serviceSlotsRemaining: number;
  storageRemaining: number;
}

export interface UsageSummary {
  currentMonth: MonthlyUsage;
  previousMonth: MonthlyUsage;
  yearToDate: YearToDateUsage;
  planLimits: PlanLimits;
  remainingQuotas: RemainingQuotas;
}

export interface UsageAlert {
  isNearLimit?: boolean;
  isAtLimit?: boolean;
  percentage?: number;
  current?: number;
  limit?: number;
  remaining?: number;
  quota?: number;
  usedMB?: number;
  limitMB?: number;
}

export interface UsageAlerts {
  smsQuotaAlert: UsageAlert;
  staffLimitAlert: UsageAlert;
  customerLimitAlert: UsageAlert;
  storageLimitAlert: UsageAlert;
}

export interface DailySmsUsage {
  businessId: string;
  date: string;
  smsCount: number;
}

export interface UsageLimitsCheck {
  sms: {
    allowed: boolean;
    reason: string | null;
  };
  staff: {
    allowed: boolean;
    reason: string | null;
  };
  service: {
    allowed: boolean;
    reason: string | null;
  };
  customer: {
    allowed: boolean;
    reason: string | null;
  };
}

export class UsageService {
  /**
   * Get usage summary for a business
   */
  async getUsageSummary(businessId: string): Promise<ApiResponse<UsageSummary>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/usage/summary`);
      // Handle nested data structure from API
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data?.data || response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch usage summary',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch usage summary'
        }
      };
    }
  }

  /**
   * Get usage alerts for a business
   */
  async getUsageAlerts(businessId: string): Promise<ApiResponse<UsageAlerts>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/usage/alerts`);
      // Handle nested data structure from API
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data?.data || response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch usage alerts',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch usage alerts'
        }
      };
    }
  }

  /**
   * Get daily SMS usage for charts
   */
  async getDailySmsUsage(businessId: string, days: number = 30): Promise<ApiResponse<DailySmsUsage[]>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/usage/sms-daily?days=${days}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch daily SMS usage',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch daily SMS usage'
        }
      };
    }
  }

  /**
   * Get monthly usage history
   */
  async getMonthlyUsageHistory(businessId: string, months: number = 12): Promise<ApiResponse<MonthlyUsage[]>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/usage/monthly-history?months=${months}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to fetch monthly usage history',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to fetch monthly usage history'
        }
      };
    }
  }

  /**
   * Check usage limits for pre-action validation
   */
  async checkUsageLimits(businessId: string): Promise<ApiResponse<UsageLimitsCheck>> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/${businessId}/usage/limits-check`);
      // Handle nested data structure from API
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data?.data || response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to check usage limits',
        error: {
          code: (error.response?.status || 500).toString(),
          message: error.response?.data?.error || 'Failed to check usage limits'
        }
      };
    }
  }
}

// Export a default instance
export const usageService = new UsageService();