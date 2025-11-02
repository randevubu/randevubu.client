import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { discountCodeService, DiscountCode, DiscountValidationResult } from '../services/discountCode';
import { subscriptionService } from '../services/subscription';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../utils/errorExtractor';

export interface UseDiscountCodeResult {
  // Validation
  validateDiscountCode: (code: string, planId: string, amount: number) => Promise<DiscountValidationResult>;
  isValidationLoading: boolean;
  validationError: string | null;

  // Application
  applyDiscountCode: (businessId: string, code: string) => Promise<{ success: boolean; error?: string }>;
  isApplicationLoading: boolean;
  applicationError: string | null;

  // Discount code details
  getDiscountCode: (code: string) => Promise<DiscountCode | null>;
  isDiscountCodeLoading: boolean;
  discountCodeError: string | null;

  // Calculate discount
  calculateDiscount: (discountCode: DiscountCode, originalAmount: number) => {
    discountAmount: number;
    finalAmount: number;
  };
}

/**
 * Custom hook for managing discount codes
 * 
 * Features:
 * - Validate discount codes for specific plans and amounts
 * - Apply discount codes to existing subscriptions
 * - Get discount code details
 * - Calculate discount amounts
 * - Error handling and loading states
 */
export function useDiscountCode(): UseDiscountCodeResult {
  const { user } = useAuth();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null);

  // Validate discount code mutation
  const validateMutation = useMutation({
    mutationFn: async ({ code, planId, amount }: { code: string; planId: string; amount: number }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }
      return await discountCodeService.validateDiscountCode(code, planId, amount, user.id);
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error, 'İndirim kodu doğrulanamadı');
      setValidationError(errorMessage);
    },
    onSuccess: () => {
      setValidationError(null);
    }
  });

  // Apply discount code mutation
  const applyMutation = useMutation({
    mutationFn: async ({ businessId, code }: { businessId: string; code: string }) => {
      return await subscriptionService.applyDiscountCode(businessId, code);
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(error, 'İndirim kodu uygulanamadı');
      setApplicationError(errorMessage);
    },
    onSuccess: () => {
      setApplicationError(null);
    }
  });

  // Get discount code - using direct function call instead of query since it's always explicitly triggered

  const validateDiscountCode = async (code: string, planId: string, amount: number): Promise<DiscountValidationResult> => {
    try {
      setValidationError(null);
      const result = await validateMutation.mutateAsync({ code, planId, amount });
      return result;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'İndirim kodu doğrulanamadı');
      return {
        isValid: false,
        errorMessage
      };
    }
  };

  const applyDiscountCode = async (businessId: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setApplicationError(null);
      const result = await applyMutation.mutateAsync({ businessId, code });
      return {
        success: result.success,
        error: result.error?.message
      };
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'İndirim kodu uygulanamadı');
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const getDiscountCode = async (code: string): Promise<DiscountCode | null> => {
    try {
      setDiscountCodeError(null);
      return await discountCodeService.getDiscountCode(code);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'İndirim kodu alınamadı');
      setDiscountCodeError(errorMessage);
      return null;
    }
  };

  const calculateDiscount = (discountCode: DiscountCode, originalAmount: number) => {
    return discountCodeService.calculateDiscountAmount(discountCode, originalAmount);
  };

  return {
    validateDiscountCode,
    isValidationLoading: validateMutation.isPending,
    validationError,

    applyDiscountCode,
    isApplicationLoading: applyMutation.isPending,
    applicationError,

    getDiscountCode,
    isDiscountCodeLoading: false,
    discountCodeError,

    calculateDiscount
  };
}

/**
 * Hook for applying discount codes to existing subscriptions
 */
export function useApplyDiscountCode() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyDiscountCode = async (businessId: string, discountCode: string) => {
    if (!user?.id) {
      setError('Kullanıcı kimlik doğrulaması gerekli');
      return { success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await subscriptionService.applyDiscountCode(businessId, discountCode);
      
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error?.message || 'İndirim kodu uygulanamadı');
        return { success: false, error: result.error?.message || 'İndirim kodu uygulanamadı' };
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'İndirim kodu uygulanamadı');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applyDiscountCode,
    isLoading,
    error
  };
}






