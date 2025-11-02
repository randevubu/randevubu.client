import { apiClient } from '../api';
import { extractErrorMessage } from '../utils/errorExtractor';

export interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  isActive: boolean;
  maxUses: number | null;
  timesUsed: number;
  expiresAt: string | null;
  applicablePlans: string[];
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountValidationResult {
  isValid: boolean;
  discountCode?: DiscountCode;
  calculatedDiscount?: {
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  };
  errorMessage?: string;
}

export interface PendingDiscountMetadata {
  code: string;
  validatedAt: string;
  appliedToPayments: string[];
  isRecurring: boolean;
  remainingUses: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountCodeId: string;
}

export interface DiscountApplicationResult {
  success: boolean;
  discountApplied?: {
    code: string;
    discountAmount: number;
    originalAmount: number;
    finalAmount: number;
  };
  error?: string;
}

export class DiscountCodeService {
  /**
   * Validate a discount code for a specific plan and amount
   */
  async validateDiscountCode(
    code: string,
    planId: string,
    amount: number,
    userId: string
  ): Promise<DiscountValidationResult> {
    try {
      const response = await apiClient.post('/api/v1/discount-codes/validate', {
        code,
        planId,
        amount,
        userId
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Discount code validation failed:', error);
      const errorMessage = extractErrorMessage(error, 'İndirim kodu doğrulanamadı');
      return {
        isValid: false,
        errorMessage
      };
    }
  }

  /**
   * Store a pending discount for later application (trial subscriptions)
   */
  async storePendingDiscount(
    code: string,
    subscriptionId: string,
    planId: string,
    amount: number,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post('/api/v1/discount-codes/store-pending', {
        code,
        subscriptionId,
        planId,
        amount,
        userId
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to store pending discount:', error);
      const errorMessage = extractErrorMessage(error, 'İndirim kodu kaydedilemedi');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Apply a pending discount to a payment
   */
  async applyPendingDiscount(
    subscriptionId: string,
    paymentId: string,
    actualAmount: number
  ): Promise<DiscountApplicationResult> {
    try {
      const response = await apiClient.post('/api/v1/discount-codes/apply-pending', {
        subscriptionId,
        paymentId,
        actualAmount
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to apply pending discount:', error);
      const errorMessage = extractErrorMessage(error, 'İndirim uygulanamadı');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Add a discount code to an existing subscription
   */
  async addDiscountToSubscription(
    subscriptionId: string,
    code: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.post('/api/v1/discount-codes/add-to-subscription', {
        subscriptionId,
        code,
        userId
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to add discount to subscription:', error);
      const errorMessage = extractErrorMessage(error, 'İndirim kodu aboneliğe eklenemedi');
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Check if a discount can be applied to a specific payment type
   */
  async canApplyToPayment(
    subscriptionId: string,
    paymentType: 'INITIAL' | 'TRIAL_CONVERSION' | 'RENEWAL'
  ): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `/api/v1/discount-codes/can-apply/${subscriptionId}?paymentType=${paymentType}`
      );

      return response.data.canApply;
    } catch (error: unknown) {
      console.error('Failed to check discount application eligibility:', error);
      return false;
    }
  }

  /**
   * Get discount code details
   */
  async getDiscountCode(code: string): Promise<DiscountCode | null> {
    try {
      const response = await apiClient.get(`/api/v1/discount-codes/${code}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get discount code:', error);
      return null;
    }
  }

  /**
   * Calculate discount amount for a given code and amount
   */
  calculateDiscountAmount(
    discountCode: DiscountCode,
    originalAmount: number
  ): { discountAmount: number; finalAmount: number } {
    let discountAmount = 0;

    if (discountCode.type === 'PERCENTAGE') {
      discountAmount = originalAmount * (discountCode.value / 100);
    } else {
      discountAmount = Math.min(discountCode.value, originalAmount);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100
    };
  }
}

// Export singleton instance
export const discountCodeService = new DiscountCodeService();






