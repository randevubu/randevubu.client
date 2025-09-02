'use client';

import { useState, useEffect } from 'react';
import { discountService } from '../../lib/services/discount';
import { ValidateDiscountCodeResponse } from '../../types/discount';
import { handleApiError } from '../../lib/utils/toast';

interface DiscountCodeInputProps {
  planId: string;
  originalAmount: number;
  billingInterval?: string; // Add billing interval for plan mapping
  onDiscountApplied: (discount: ValidateDiscountCodeResponse | null, code?: string) => void;
  className?: string;
}

export default function DiscountCodeInput({ 
  planId, 
  originalAmount, 
  billingInterval,
  onDiscountApplied,
  className = '' 
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateDiscountCodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  // Debug: Log the planId when component mounts
  useEffect(() => {
    // console.log('DiscountCodeInput - Component mounted with planId:', planId);
  }, [planId]);

  // Reset validation when code changes
  useEffect(() => {
    if (code.trim() === '') {
      setValidationResult(null);
      setError(null);
      setIsApplied(false);
      onDiscountApplied(null, '');
    }
  }, [code, onDiscountApplied]);

  const validateCode = async () => {
    if (!code.trim()) {
      setError('Lütfen bir indirim kodu girin');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // console.log('DiscountCodeInput - Validating code:', {
      //   code: code.trim(),
      //   planId,
      //   billingInterval,
      //   amount: originalAmount
      // });

      // Use the plan ID directly without mapping
      const response = await discountService.validateDiscountCode({
        code: code.trim(),
        planId: planId,
        amount: originalAmount
      });

      // console.log('DiscountCodeInput - Validation response:', response);

      if (response.success && response.data) {
        setValidationResult(response.data);
        if (response.data.isValid) {
          setIsApplied(true);
          onDiscountApplied(response.data, code.trim());
        } else {
          setError(response.data.errorMessage || 'Geçersiz indirim kodu');
          onDiscountApplied(null, '');
        }
      } else {
        setError(response.error?.message || 'İndirim kodu doğrulanamadı');
        onDiscountApplied(null, '');
      }
    } catch (error) {
      // console.error('DiscountCodeInput - Validation error:', error);
      handleApiError(error);
      setError('İndirim kodu doğrulanamadı');
      onDiscountApplied(null, '');
    } finally {
      setIsValidating(false);
    }
  };

  const removeDiscount = () => {
    setCode('');
    setValidationResult(null);
    setError(null);
    setIsApplied(false);
    onDiscountApplied(null, '');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateCode();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Discount Code Input */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2 transition-colors duration-300">
          İndirim Kodu
        </label>
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="İndirim kodunu girin"
              disabled={isApplied}
              className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent bg-[var(--theme-background)] text-[var(--theme-foreground)] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {!isApplied ? (
            <button
              type="button"
              onClick={validateCode}
              disabled={isValidating || !code.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isValidating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Kontrol ediliyor...</span>
                </div>
              ) : (
                'Uygula'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={removeDiscount}
              className="px-6 py-3 bg-[var(--theme-error)]/10 text-[var(--theme-error)] border border-[var(--theme-error)]/20 rounded-lg font-medium hover:bg-[var(--theme-error)]/20 transition-colors duration-300"
            >
              Kaldır
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-3 bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/20 rounded-lg transition-colors duration-300">
          <svg className="w-5 h-5 text-[var(--theme-error)] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-[var(--theme-error)]">{error}</span>
        </div>
      )}

      {/* Success Message with Discount Details */}
      {validationResult && validationResult.isValid && (
        <div className="p-4 bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/20 rounded-lg transition-colors duration-300">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-[var(--theme-success)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-[var(--theme-success)]">
              İndirim kodu "{code}" başarıyla uygulandı!
            </span>
          </div>
          <div className="text-sm space-y-1 ml-7">
            <div className="flex justify-between">
              <span className="text-[var(--theme-foregroundSecondary)]">Orijinal tutar:</span>
              <span className="font-medium text-[var(--theme-foreground)]">
                {validationResult.originalAmount} TL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--theme-foregroundSecondary)]">İndirim:</span>
              <span className="font-medium text-[var(--theme-success)]">
                -{validationResult.discountAmount} TL
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--theme-border)]">
              <span className="font-medium text-[var(--theme-foreground)]">Son tutar:</span>
              <span className="font-bold text-[var(--theme-primary)]">
                {validationResult.finalAmount} TL
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      {!isApplied && !error && (
        <div className="text-xs text-[var(--theme-foregroundMuted)] space-y-1">
          <p>💡 İndirim kodunuzu girin ve "Uygula" butonuna tıklayın</p>
          <p>💡 Kodlar büyük/küçük harf duyarlı değildir ve otomatik olarak formatlanır</p>
        </div>
      )}
    </div>
  );
}