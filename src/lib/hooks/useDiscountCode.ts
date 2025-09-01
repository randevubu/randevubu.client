import { useState, useCallback } from 'react';
import { discountService } from '../services/discount';
import { ValidateDiscountCodeRequest, ValidateDiscountCodeResponse, DiscountApplication } from '../../types/discount';

interface UseDiscountCodeReturn {
  isValidating: boolean;
  validationResult: ValidateDiscountCodeResponse | null;
  discountApplication: DiscountApplication | null;
  error: string | null;
  validateCode: (request: ValidateDiscountCodeRequest) => Promise<void>;
  clearValidation: () => void;
  applyDiscount: (code: string, originalAmount: number) => DiscountApplication | null;
}

export const useDiscountCode = (): UseDiscountCodeReturn => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateDiscountCodeResponse | null>(null);
  const [discountApplication, setDiscountApplication] = useState<DiscountApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (request: ValidateDiscountCodeRequest) => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await discountService.validateDiscountCode(request);
      
      if (response.success && response.data) {
        setValidationResult(response.data);
        
        // If valid, create discount application
        if (response.data.isValid && response.data.discountAmount !== null && response.data.finalAmount !== null) {
          const application: DiscountApplication = {
            code: request.code.toUpperCase(),
            discountAmount: response.data.discountAmount,
            originalAmount: response.data.originalAmount!,
            finalAmount: response.data.finalAmount
          };
          setDiscountApplication(application);
        } else {
          setDiscountApplication(null);
        }
        
        // Set error message if invalid
        if (!response.data.isValid && response.data.errorMessage) {
          setError(response.data.errorMessage);
        }
      } else {
        setError(response.message || 'İndirim kodu doğrulanamadı');
        setValidationResult(null);
        setDiscountApplication(null);
      }
    } catch (err: any) {
      setError(err.message || 'Beklenmedik bir hata oluştu');
      setValidationResult(null);
      setDiscountApplication(null);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setDiscountApplication(null);
    setError(null);
    setIsValidating(false);
  }, []);

  const applyDiscount = useCallback((code: string, originalAmount: number): DiscountApplication | null => {
    if (!validationResult?.isValid || !validationResult.discountAmount || !validationResult.finalAmount) {
      return null;
    }

    return {
      code: code.toUpperCase(),
      discountAmount: validationResult.discountAmount,
      originalAmount,
      finalAmount: validationResult.finalAmount
    };
  }, [validationResult]);

  return {
    isValidating,
    validationResult,
    discountApplication,
    error,
    validateCode,
    clearValidation,
    applyDiscount
  };
};