'use client';

import React, { useState, useEffect } from 'react';
import { useDiscountCode } from '../../lib/hooks/useDiscountCode';
import { DiscountApplication } from '../../types/discount';

interface DiscountCodeInputProps {
  planId: string;
  planAmount: number;
  onDiscountApplied?: (discount: DiscountApplication | null) => void;
  className?: string;
  disabled?: boolean;
}

export const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
  planId,
  planAmount,
  onDiscountApplied,
  className = '',
  disabled = false
}) => {
  const [code, setCode] = useState('');
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const { 
    isValidating, 
    validationResult, 
    discountApplication, 
    error, 
    validateCode, 
    clearValidation 
  } = useDiscountCode();

  // Handle discount application changes
  useEffect(() => {
    if (onDiscountApplied) {
      onDiscountApplied(discountApplication);
    }
  }, [discountApplication, onDiscountApplied]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(newCode);
    
    // Clear previous validation when code changes
    if (hasAttemptedValidation) {
      clearValidation();
      setHasAttemptedValidation(false);
    }
  };

  const handleValidate = async () => {
    if (!code.trim() || disabled || isValidating) return;
    
    setHasAttemptedValidation(true);
    await validateCode({
      code: code.trim(),
      planId,
      amount: planAmount
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  const handleClearDiscount = () => {
    setCode('');
    setHasAttemptedValidation(false);
    clearValidation();
  };

  const isCodeValid = validationResult?.isValid && discountApplication;
  const showError = hasAttemptedValidation && (error || (!validationResult?.isValid && validationResult?.errorMessage));

  return (
    <div className={`discount-code-input ${className}`}>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          İndirim Kodu
          <span className="text-gray-500 font-normal ml-1">(opsiyonel)</span>
        </label>
        
        <div className="relative">
          <div className="flex">
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="İndirim kodunuzu girin"
              disabled={disabled || isValidating}
              maxLength={20}
              className={`flex-1 px-4 py-3 border rounded-l-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                isCodeValid 
                  ? 'border-green-300 bg-green-50' 
                  : showError 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            
            {isCodeValid ? (
              <button
                type="button"
                onClick={handleClearDiscount}
                disabled={disabled}
                className="px-4 py-3 bg-red-500 text-white rounded-r-2xl hover:bg-red-600 focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleValidate}
                disabled={disabled || !code.trim() || isValidating}
                className="px-6 py-3 bg-blue-600 text-white rounded-r-2xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isValidating ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm">Kontrol</span>
                  </div>
                ) : (
                  'Uygula'
                )}
              </button>
            )}
          </div>

          {/* Validation feedback */}
          {isValidating && (
            <div className="absolute inset-y-0 right-16 flex items-center pr-3 pointer-events-none">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Success message */}
        {isCodeValid && discountApplication && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-medium text-green-800">
                  İndirim Kodu Uygulandı: {discountApplication.code}
                </h4>
                <div className="mt-2 text-sm text-green-700">
                  <div className="flex justify-between items-center mb-1">
                    <span>Orijinal Tutar:</span>
                    <span className="line-through">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(discountApplication.originalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span>İndirim:</span>
                    <span className="text-green-600 font-medium">
                      -{new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(discountApplication.discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-green-300 pt-1 mt-2">
                    <span className="font-medium">Toplam:</span>
                    <span className="text-green-800 font-bold text-lg">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                      }).format(discountApplication.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {showError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">İndirim Kodu Geçersiz</h4>
                <div className="mt-1 text-sm text-red-700">
                  {error || validationResult?.errorMessage || 'Bilinmeyen hata oluştu'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        {!hasAttemptedValidation && !code && (
          <p className="text-xs text-gray-500">
            İndirim kodunuz varsa yukarıdaki alana girin ve "Uygula" butonuna tıklayın.
          </p>
        )}
      </div>
    </div>
  );
};