'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlan, BusinessSubscription } from '../../types/subscription';
import { subscriptionService } from '../../lib/services/subscription';

interface PlanSelectionStepProps {
  currentSubscription: BusinessSubscription | null;
  onPlanSelected: (plan: SubscriptionPlan) => void;
}

export default function PlanSelectionStep({
  currentSubscription,
  onPlanSelected
}: PlanSelectionStepProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getSubscriptionPlans();

        // Filter out the current plan and show only monthly plans
        const availablePlans = response
          .filter(plan =>
            plan.billingInterval?.toLowerCase() === 'monthly' &&
            plan.id !== currentSubscription?.planId
          )
          .sort((a, b) => a.sortOrder - b.sortOrder);

        setPlans(availablePlans);
      } catch (err) {
        console.error('Failed to load plans:', err);
        setError('Planlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [currentSubscription]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  };

  const getChangeType = (planPrice: number) => {
    const currentPrice = currentSubscription?.plan?.price || 0;
    if (planPrice > currentPrice) return 'upgrade';
    if (planPrice < currentPrice) return 'downgrade';
    return 'same';
  };

  const getChangeTypeInfo = (changeType: string) => {
    switch (changeType) {
      case 'upgrade':
        return { icon: '⬆️', text: 'Plan Yükseltme', color: 'text-green-600 bg-green-50 border-green-200' };
      case 'downgrade':
        return { icon: '⬇️', text: 'Plan Düşürme', color: 'text-amber-600 bg-amber-50 border-amber-200' };
      default:
        return { icon: '🔄', text: 'Plan Değişikliği', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Planlar Yükleniyor</h3>
          <p className="text-gray-500">Mevcut planlar kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Planlar Yüklenemedi</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Yeni Plan Seçin</h3>
          <p className="text-gray-600">
            Mevcut planınız: <span className="font-semibold">{currentSubscription?.plan?.name}</span>
          </p>
        </div>

        {/* Current Plan Info */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Mevcut Planınız</div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{currentSubscription?.plan?.name}</h4>
            <div className="text-xl font-bold text-gray-900">
              {formatPrice(currentSubscription?.plan?.price || 0, currentSubscription?.plan?.currency || 'TRY')}
              <span className="text-sm font-normal text-gray-600 ml-1">/ay</span>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const changeType = getChangeType(plan.price);
            const changeInfo = getChangeTypeInfo(changeType);

            return (
              <div
                key={plan.id}
                className="relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-gray-200 hover:border-blue-300"
              >
                {/* Change Type Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${changeInfo.color}`}>
                    {changeInfo.icon} {changeInfo.text}
                  </div>
                </div>

                <div className="p-6 pt-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.displayName}</h4>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-black text-gray-900">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">/ay</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-3 mb-6">
                    {plan.maxStaffPerBusiness !== -1 && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{plan.maxStaffPerBusiness} Personel</span>
                      </div>
                    )}

                    {plan.features?.smsQuota && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{plan.features.smsQuota.toLocaleString('tr-TR')} SMS/ay</span>
                      </div>
                    )}

                    {plan.features?.apiAccess && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>API Erişimi</span>
                      </div>
                    )}
                  </div>

                  {/* Select Button */}
                  <button
                    onClick={() => onPlanSelected(plan)}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                      changeType === 'upgrade'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                        : changeType === 'downgrade'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    Bu Planı Seç
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {plans.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mevcut Plan Yok</h3>
            <p className="text-gray-600">Şu anda değiştirilebilecek başka plan bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}