'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlan, BusinessSubscription, ChangePlanData } from '../../types/subscription';
import { subscriptionService } from '../../lib/services/subscription';

interface ChangePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan | null;
  currentSubscription: BusinessSubscription | null;
  isUpdating: boolean;
  onConfirm: (changePlanData: ChangePlanData) => void;
  businessId: string;
}

export default function ChangePlanDialog({
  isOpen,
  onClose,
  selectedPlan,
  currentSubscription,
  isUpdating,
  onConfirm,
  businessId
}: ChangePlanDialogProps) {
  const [effectiveDate, setEffectiveDate] = useState<'immediate' | 'next_billing_cycle'>('immediate');
  const [prorationPreference, setProrationPreference] = useState<'prorate' | 'none'>('prorate');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [pricingCalculation, setPricingCalculation] = useState<{amount: number; currency: string; changeType: string} | null>(null);
  const [loadingCalculation, setLoadingCalculation] = useState(false);

  // Detect if this is an upgrade or downgrade
  const isUpgrade = selectedPlan && currentSubscription?.plan
    ? selectedPlan.price > currentSubscription.plan.price
    : false;

  const isDowngrade = selectedPlan && currentSubscription?.plan
    ? selectedPlan.price < currentSubscription.plan.price
    : false;

  // Load payment methods and pricing calculation when dialog opens
  useEffect(() => {
    if (!isOpen || !selectedPlan || !currentSubscription || !businessId) return;

    const loadData = async () => {
      // Calculate pricing
      setLoadingCalculation(true);
      try {
        const pricingResponse = await subscriptionService.calculatePlanChange(
          businessId,
          currentSubscription.id,
          selectedPlan.id
        );
        if (pricingResponse.success && pricingResponse.data) {
          setPricingCalculation({
            amount: pricingResponse.data.pricing.totalAmount,
            currency: pricingResponse.data.pricing.currency,
            changeType: pricingResponse.data.changeType
          });
        }
      } catch (error) {
        console.error('Failed to calculate pricing:', error);
      } finally {
        setLoadingCalculation(false);
      }

      // Load payment methods for both upgrades and downgrades (backend requires it)
      setLoadingPaymentMethods(true);
      try {
        const paymentResponse = await subscriptionService.getPaymentMethods(businessId);
        if (paymentResponse.success && paymentResponse.data) {
          const paymentMethods = Array.isArray(paymentResponse.data) ? paymentResponse.data : [];
          setPaymentMethods(paymentMethods);
          // Auto-select first payment method if available
          if (paymentMethods.length > 0 && paymentMethods[0].id) {
            setSelectedPaymentMethod(paymentMethods[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    loadData();
  }, [isOpen, selectedPlan, currentSubscription, businessId]);

  // Set appropriate defaults based on upgrade/downgrade
  useEffect(() => {
    if (isDowngrade) {
      // Downgrades are always scheduled for next billing cycle
      setEffectiveDate('next_billing_cycle');
    } else if (isUpgrade) {
      // Upgrades default to immediate
      setEffectiveDate('immediate');
    }
  }, [isUpgrade, isDowngrade]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedPlan) return;

    const changePlanData: ChangePlanData = {
      newPlanId: selectedPlan.id,
      effectiveDate: isDowngrade ? 'next_billing_cycle' : effectiveDate,
      prorationPreference,
      billingCycle
    };

    // Add payment method for upgrades
    if (isUpgrade && selectedPaymentMethod) {
      changePlanData.paymentMethodId = selectedPaymentMethod;
    }

    // For downgrades, also include payment method if available (backend requires it)
    if (isDowngrade && paymentMethods.length > 0) {
      const defaultPaymentMethod = paymentMethods.find(m => m.isDefault) || paymentMethods[0];
      changePlanData.paymentMethodId = defaultPaymentMethod.id || defaultPaymentMethod.paymentMethodId;
    }

    onConfirm(changePlanData);
  };

  const canProceed = () => {
    // Both upgrades and downgrades need payment methods (backend requirement)
    return paymentMethods.length > 0 && !loadingPaymentMethods && !loadingCalculation;
  };

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full mx-2 sm:mx-4 shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
            {selectedPlan ? `${selectedPlan.displayName} Planına Geç` : 'Plan Değiştir'}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">Abonelik planınızı güncelleyin</p>
        </div>

        {selectedPlan && (
          <div className="space-y-4 sm:space-y-6">
            {/* Plan Summary */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">{selectedPlan.displayName}</h4>
                  <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{selectedPlan.description}</p>
                </div>
                {isUpgrade && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium ml-4">
                    ⬆️ Yükseltme
                  </span>
                )}
                {isDowngrade && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium ml-4">
                    ⬇️ Düşürme
                  </span>
                )}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatPrice(selectedPlan.price, selectedPlan.currency)}
                <span className="text-sm sm:text-lg font-normal text-gray-600 ml-2">
                  / {selectedPlan.billingInterval?.toLowerCase() === 'monthly' ? 'ay' : 'yıl'}
                </span>
              </div>

              {/* Show calculated pricing for upgrades */}
              {isUpgrade && pricingCalculation && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-sm text-green-800">
                    <span className="font-medium">Bugün ödenecek tutar: </span>
                    {formatPrice(pricingCalculation.amount, pricingCalculation.currency)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    (Prorasyon dahil)
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection for Upgrades */}
            {isUpgrade && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-base sm:text-lg">Ödeme Yöntemi</h4>
                <div className="bg-gray-50 rounded-2xl p-4">
                  {loadingPaymentMethods ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <div className="text-sm text-gray-600">Ödeme yöntemleri yükleniyor...</div>
                    </div>
                  ) : paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label key={method.id} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <div className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}>
                            <div className="font-medium">{method.type === 'card' ? '💳' : '🏦'} {method.last4 ? `**** ${method.last4}` : method.description}</div>
                            <div className="text-xs text-gray-600">{method.brand || method.type}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div className="text-gray-600 mb-3">Kayıtlı ödeme yöntemi bulunamadı</div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                        Ödeme Yöntemi Ekle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Change Options */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                {isDowngrade ? 'Düşürme Seçenekleri' : 'Değişiklik Seçenekleri'}
              </h4>

              {/* Billing Cycle */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Faturalama Döngüsü
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="billingCycle"
                      value="monthly"
                      checked={billingCycle === 'monthly'}
                      onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                      className="sr-only"
                    />
                    <div className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      billingCycle === 'monthly'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}>
                      <div className="font-medium">Aylık</div>
                      <div className="text-xs mt-1">Esnek ödeme</div>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="billingCycle"
                      value="yearly"
                      checked={billingCycle === 'yearly'}
                      onChange={(e) => setBillingCycle(e.target.value as 'monthly' | 'yearly')}
                      className="sr-only"
                    />
                    <div className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                      billingCycle === 'yearly'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}>
                      <div className="font-medium">Yıllık</div>
                      <div className="text-xs mt-1">%20 indirim</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Effective Date - Different for upgrades vs downgrades */}
              {isDowngrade ? (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-amber-800">
                      <div className="font-medium mb-1">Plan Düşürme Bilgisi:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Plan düşürme işlemi {currentSubscription ? formatDate(currentSubscription.currentPeriodEnd) : 'sonraki fatura döneminde'} etkili olacak</li>
                        <li>• Bu tarife kadar mevcut plan özelliklerinizi kullanmaya devam edebilirsiniz</li>
                        <li>• Herhangi bir ödeme yapılmayacak</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Değişiklik Zamanı
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="effectiveDate"
                        value="immediate"
                        checked={effectiveDate === 'immediate'}
                        onChange={(e) => setEffectiveDate(e.target.value as 'immediate' | 'next_billing_cycle')}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Hemen Değiştir</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Plan değişikliği hemen etkili olur ve ödeme yapılır
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="effectiveDate"
                        value="next_billing_cycle"
                        checked={effectiveDate === 'next_billing_cycle'}
                        onChange={(e) => setEffectiveDate(e.target.value as 'immediate' | 'next_billing_cycle')}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Sonraki Fatura Döneminde</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {currentSubscription ? `${formatDate(currentSubscription.currentPeriodEnd)} tarihinde değişir` : 'Sonraki fatura döneminde değişir'}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Proration Settings - Only show for immediate changes */}
              {effectiveDate === 'immediate' && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fatura Hesaplama
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="prorationPreference"
                        value="prorate"
                        checked={prorationPreference === 'prorate'}
                        onChange={(e) => setProrationPreference(e.target.value as 'prorate' | 'none')}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Orantılı Faturalama (Önerilen)</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Kullanılan süre için hesaplanan fark tutarı faturalandırılır
                        </div>
                      </div>
                    </label>
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="prorationPreference"
                        value="none"
                        checked={prorationPreference === 'none'}
                        onChange={(e) => setProrationPreference(e.target.value as 'prorate' | 'none')}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Tam Fatura</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Yeni planın tam tutarı faturalandırılır
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Important Notes */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">Önemli Bilgiler:</div>
                    <ul className="space-y-1 text-xs">
                      {isDowngrade && (
                        <li>• Plan düşürme işlemi mevcut kullanımınızı kontrol eder</li>
                      )}
                      <li>• Plan değişiklikleri geri alınamaz</li>
                      <li>• Yeni plan özellikleri hemen kullanılabilir olur</li>
                      <li>• Fatura değişiklikleri e-posta ile bildirilir</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium active:scale-95 touch-manipulation"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUpdating || !canProceed()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg active:scale-95 touch-manipulation"
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm sm:text-base">
                  {isUpgrade ? 'Ödeme İşleniyor...' : 'Plan Değiştiriliyor...'}
                </span>
              </div>
            ) : loadingCalculation ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm sm:text-base">Hesaplanıyor...</span>
              </div>
            ) : (
              isUpgrade ? 'Öde ve Yükselt' : 'Planı Düşür'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}