'use client';

import { useState, useEffect } from 'react';
import { PlanChangePreview, PaymentMethod, AddPaymentMethodData } from '../../types/subscription';
import { subscriptionService } from '../../lib/services/subscription';
import AddPaymentMethodForm from './AddPaymentMethodForm';

interface PaymentMethodStepProps {
  businessId: string;
  preview: PlanChangePreview;
  selectedPaymentMethod: PaymentMethod | null;
  onPaymentMethodSelected: (paymentMethod: PaymentMethod) => void;
  onBack: () => void;
}

export default function PaymentMethodStep({
  businessId,
  preview,
  selectedPaymentMethod,
  onPaymentMethodSelected,
  onBack
}: PaymentMethodStepProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(preview.paymentMethods || []);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load payment methods if not provided in preview
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if ((!preview.paymentMethods || preview.paymentMethods.length === 0) && businessId) {
        console.log('🔄 Loading payment methods directly...');
        setLoading(true);
        try {
          const response = await subscriptionService.getPaymentMethods(businessId);
          if (response.success && response.data) {
            console.log('💳 Loaded payment methods:', response.data);
            setPaymentMethods(response.data);
          }
        } catch (err) {
          console.error('❌ Failed to load payment methods:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPaymentMethods();
  }, [businessId, preview.paymentMethods]);

  // Auto-show add form if no payment methods exist
  useEffect(() => {
    if (paymentMethods.length === 0 && !showAddForm && !loading) {
      setShowAddForm(true);
    }
  }, [paymentMethods.length, showAddForm, loading]);

  const formatPrice = (price: number, currency: string | undefined) => {
    if (!currency) {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(price);
    }
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  };

  const getCardBrandIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  const handleAddPaymentMethod = async (paymentData: AddPaymentMethodData) => {
    setAddingPaymentMethod(true);
    setError(null);

    try {
      const response = await subscriptionService.addPaymentMethod(businessId, paymentData);

      if (response.success && response.data) {
        const newPaymentMethod = response.data;
        setPaymentMethods(prev => [...prev, newPaymentMethod]);
        setShowAddForm(false);

        // Auto-select the newly added payment method
        console.log('✅ New payment method added and selected:', newPaymentMethod);
        onPaymentMethodSelected(newPaymentMethod);
      } else {
        setError(response.error?.message || 'Ödeme yöntemi eklenemedi');
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setAddingPaymentMethod(false);
    }
  };

  const canProceed = selectedPaymentMethod !== null;

  if (showAddForm) {
    return (
      <div className="p-6 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Yeni Ödeme Yöntemi Ekle</h3>
            <p className="text-gray-600">Güvenli ödeme için kart bilgilerinizi girin</p>
          </div>

          <AddPaymentMethodForm
            loading={addingPaymentMethod}
            error={error}
            onSubmit={handleAddPaymentMethod}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Yöntemi Seçin</h3>
          <p className="text-gray-600">Plan yükseltme için ödeme yönteminizi seçin</p>
        </div>

        {/* Pricing Summary */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mb-8">
          <div className="text-center">
            <div className="text-sm text-blue-600 mb-1">Bugün Ödenecek Tutar</div>
            <div className="text-3xl font-bold text-blue-900">
              {preview.pricing && formatPrice(preview.pricing.totalAmount, preview.pricing.currency)}
            </div>
            <div className="text-xs text-blue-600 mt-2">
              {preview.pricing && `(${formatPrice(preview.pricing.prorationAmount, preview.pricing.currency)} prorasyon dahil)`}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4 mb-8">
          <h4 className="font-semibold text-gray-900">Kayıtlı Ödeme Yöntemleri</h4>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label key={method.id} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id || method.paymentMethodId}
                    checked={(selectedPaymentMethod?.id || selectedPaymentMethod?.paymentMethodId) === (method.id || method.paymentMethodId)}
                    onChange={() => onPaymentMethodSelected(method)}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    selectedPaymentMethod?.id === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getCardBrandIcon(method.brand || method.cardBrand)}</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {(method.brand || method.cardBrand)?.toUpperCase() || 'KART'} •••• {method.last4 || method.lastFourDigits}
                          </div>
                          <div className="text-sm text-gray-600">{method.holderName || method.cardHolderName}</div>
                          {(method.expireMonth || method.expiryMonth) && (method.expireYear || method.expiryYear) && (
                            <div className="text-xs text-gray-500">
                              {String(method.expireMonth || method.expiryMonth).padStart(2, '0')}/{method.expireYear || method.expiryYear}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {(method.makeDefault || method.isDefault) && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                            Varsayılan
                          </span>
                        )}
                        {(selectedPaymentMethod?.id || selectedPaymentMethod?.paymentMethodId) === (method.id || method.paymentMethodId) && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="text-gray-600 mb-4">Henüz kayıtlı ödeme yönteminiz bulunmuyor</p>
            </div>
          )}

          {/* Add New Payment Method Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600"
          >
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Ödeme Yöntemi Ekle
            </div>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200 mb-8">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">Güvenli Ödeme</div>
              <p>Tüm ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır. Kart bilgileriniz güvenli olarak saklanır.</p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
          >
            Geri
          </button>
          <button
            onClick={() => selectedPaymentMethod && onPaymentMethodSelected(selectedPaymentMethod)}
            disabled={!canProceed}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              canProceed
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}