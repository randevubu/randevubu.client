'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Card, { CardContent, CardHeader, CardTitle } from './Card';
import { CheckCircle, XCircle, Loader2, Percent, DollarSign } from 'lucide-react';
import { useDiscountCode } from '../../lib/hooks/useDiscountCode';
import { DiscountCode } from '../../lib/services/discountCode';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../lib/utils/errorExtractor';

interface DiscountCodeInputProps {
  planId: string;
  originalAmount: number;
  onDiscountApplied?: (discount: {
    code: string;
    discountAmount: number;
    finalAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED';
  }) => void;
  onDiscountRemoved?: () => void;
  appliedDiscount?: {
    code: string;
    discountAmount: number;
    finalAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED';
  } | null;
  className?: string;
}

export default function DiscountCodeInput({
  planId,
  originalAmount,
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount,
  className = ''
}: DiscountCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    discountCode?: DiscountCode;
    calculatedDiscount?: {
      originalAmount: number;
      discountAmount: number;
      finalAmount: number;
    };
    errorMessage?: string;
  } | null>(null);

  const { validateDiscountCode, calculateDiscount } = useDiscountCode();

  const handleValidateCode = async () => {
    if (!code.trim()) {
      toast.error('İndirim kodu giriniz');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateDiscountCode(code.trim().toUpperCase(), planId, originalAmount);
      setValidationResult(result);

      if (result.isValid && result.calculatedDiscount && onDiscountApplied) {
        toast.success('İndirim kodu geçerli!');
        onDiscountApplied({
          code: code.trim().toUpperCase(),
          discountAmount: result.calculatedDiscount.discountAmount,
          finalAmount: result.calculatedDiscount.finalAmount,
          discountType: result.discountCode?.type === 'FIXED_AMOUNT' ? 'FIXED' : 'PERCENTAGE'
        });
      } else {
        toast.error(result.errorMessage || 'İndirim kodu geçersiz');
      }
    } catch (error: unknown) {
      // Use backend's translated error message if available
      const errorMessage = extractErrorMessage(error, 'İndirim kodu doğrulanamadı');
      toast.error(errorMessage);
      setValidationResult({
        isValid: false,
        errorMessage: errorMessage
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveDiscount = () => {
    setCode('');
    setValidationResult(null);
    if (onDiscountRemoved) {
      onDiscountRemoved();
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getDiscountIcon = (discountType: 'PERCENTAGE' | 'FIXED') => {
    return discountType === 'PERCENTAGE' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />;
  };

  const getDiscountText = (discountCode: DiscountCode) => {
    if (discountCode.type === 'PERCENTAGE') {
      return `%${discountCode.value} İndirim`;
    } else {
      return `${formatAmount(discountCode.value)} İndirim`;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">İndirim Kodu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appliedDiscount ? (
          // Applied discount display
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {appliedDiscount.code} uygulandı
                  </p>
                  <p className="text-sm text-green-600">
                    {formatAmount(appliedDiscount.discountAmount)} indirim
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveDiscount}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Kaldır
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Orijinal Fiyat:</span>
                <span>{formatAmount(originalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>İndirim:</span>
                <span>-{formatAmount(appliedDiscount.discountAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Toplam:</span>
                <span className="text-green-600">{formatAmount(appliedDiscount.finalAmount)}</span>
              </div>
            </div>
          </div>
        ) : (
          // Discount code input
          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="discount-code" className="text-sm font-medium text-gray-700">İndirim Kodu</label>
              <div className="flex space-x-2">
                <Input
                  id="discount-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="İndirim kodunuzu girin"
                  className="flex-1"
                  disabled={isValidating}
                />
                <Button
                  onClick={handleValidateCode}
                  disabled={!code.trim() || isValidating}
                  className="px-6"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Uygula'
                  )}
                </Button>
              </div>
            </div>

            {/* Validation result - simplified */}
            {validationResult && validationResult.isValid && validationResult.discountCode && (
              <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">
                      İndirim kodu geçerli!
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        {getDiscountIcon(validationResult.discountCode.type === 'FIXED_AMOUNT' ? 'FIXED' : 'PERCENTAGE')}
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {getDiscountText(validationResult.discountCode)}
                        </span>
                      </div>
                      {validationResult.calculatedDiscount && (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Orijinal Fiyat:</span>
                            <span>{formatAmount(validationResult.calculatedDiscount.originalAmount)}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>İndirim:</span>
                            <span>-{formatAmount(validationResult.calculatedDiscount.discountAmount)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Yeni Fiyat:</span>
                            <span className="text-green-600">
                              {formatAmount(validationResult.calculatedDiscount.finalAmount)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
