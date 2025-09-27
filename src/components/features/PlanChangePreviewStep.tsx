'use client';

import { SubscriptionPlan, BusinessSubscription, PlanChangePreview } from '../../types/subscription';

interface PlanChangePreviewStepProps {
  selectedPlan: SubscriptionPlan | null;
  currentSubscription: BusinessSubscription | null;
  preview: PlanChangePreview | null;
  loading: boolean;
  error: string | null;
  onNext: () => void;
  onRetry: () => void;
}

export default function PlanChangePreviewStep({
  selectedPlan,
  currentSubscription,
  preview,
  loading,
  error,
  onNext,
  onRetry
}: PlanChangePreviewStepProps) {

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

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const getChangeTypeInfo = () => {
    if (!preview) return null;

    switch (preview.changeType) {
      case 'upgrade':
        return {
          icon: '⬆️',
          title: 'Plan Yükseltme',
          description: 'Planınızı yükseltiyorsunuz',
          color: 'green'
        };
      case 'downgrade':
        return {
          icon: '⬇️',
          title: 'Plan Düşürme',
          description: 'Planınızı düşürüyorsunuz',
          color: 'amber'
        };
      default:
        return {
          icon: '🔄',
          title: 'Plan Değişikliği',
          description: 'Planınızı değiştiriyorsunuz',
          color: 'blue'
        };
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Plan Değişikliği Hesaplanıyor</h3>
          <p className="text-gray-500">Fiyatlandırma ve değişiklik detayları kontrol ediliyor...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hesaplama Hatası</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!preview || !selectedPlan) {
    return (
      <div className="p-6 sm:p-8">
        <div className="text-center py-12">
          <p className="text-gray-500">Preview bilgisi yüklenemedi</p>
        </div>
      </div>
    );
  }

  const changeInfo = getChangeTypeInfo();

  // Check if we can proceed based on limitations and payment method availability
  let canProceed = preview.canProceed && !preview.limitations?.length;

  // For upgrades that require payment, ensure payment methods are available or user can add them
  if (preview.changeType === 'upgrade' && preview.paymentRequired) {
    // Allow proceeding if there are existing payment methods OR if user can add new ones
    // The system will guide user to payment method step where they can add a new card
    canProceed = canProceed && true; // Always allow proceeding to payment step for upgrades
  }

  console.log('🔍 PlanChangePreviewStep debug:', {
    preview,
    canProceed,
    previewCanProceed: preview.canProceed,
    limitations: preview.limitations,
    limitationsLength: preview.limitations?.length,
    paymentRequired: preview.paymentRequired,
    changeType: preview.changeType
  });

  return (
    <div className="p-6 sm:p-8">
      {/* Change Type Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">{changeInfo?.icon}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{changeInfo?.title}</h3>
        <p className="text-gray-600">{changeInfo?.description}</p>
      </div>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Plan */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Mevcut Plan</div>
            <h4 className="text-lg font-bold text-gray-900 mb-3">{preview.currentPlan.name}</h4>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(preview.currentPlan.price, preview.currentPlan.currency)}
              <span className="text-sm font-normal text-gray-600 ml-1">/ay</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* New Plan */}
        <div className={`bg-gradient-to-br rounded-2xl p-6 border-2 text-white ${
          changeInfo?.color === 'green' ? 'from-green-500 to-green-600 border-green-400' :
          changeInfo?.color === 'amber' ? 'from-amber-500 to-amber-600 border-amber-400' :
          'from-blue-500 to-blue-600 border-blue-400'
        }`}>
          <div className="text-center">
            <div className="text-sm text-blue-100 mb-2">Yeni Plan</div>
            <h4 className="text-lg font-bold mb-3">{preview.newPlan.name}</h4>
            <div className="text-2xl font-bold">
              {formatPrice(preview.newPlan.price, preview.newPlan.currency)}
              <span className="text-sm font-normal text-blue-100 ml-1">/ay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Details */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Fiyatlandırma Detayları
        </h4>

        <div className="space-y-3">
          {preview.changeType === 'upgrade' && preview.pricing && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Prorasyon Tutarı:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(preview.pricing.prorationAmount, preview.pricing.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Bugün Ödenecek Toplam:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatPrice(preview.pricing.totalAmount, preview.pricing.currency)}
                </span>
              </div>
              <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
                💡 Bu tutar mevcut fatura döneminin kalan süresine göre hesaplanmıştır
              </div>
            </>
          )}

          {preview.changeType === 'downgrade' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ödeme Durumu:</span>
                <span className="font-semibold text-green-600">Ödeme Gerekmiyor</span>
              </div>
              {preview.pricing && (
                <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
                  💡 Plan düşürme işlemi sonraki fatura döneminde etkili olacak. Mevcut özellikleri {formatDate(preview.pricing.nextBillingDate)} tarihine kadar kullanabilirsiniz.
                </div>
              )}
            </>
          )}

          {preview.pricing && (
            <div className="flex justify-between items-center pt-3 border-t border-blue-200">
              <span className="text-gray-700">Etkili Olma Tarihi:</span>
              <span className="font-semibold text-gray-900">
                {preview.pricing.effectiveDate === 'immediate' ? 'Hemen' : formatDate(preview.pricing.nextBillingDate)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Limitations */}
      {preview.limitations && preview.limitations.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 mb-6">
          <h4 className="font-semibold text-red-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Plan Değişikliği Engelleri
          </h4>
          <ul className="space-y-2">
            {preview.limitations.map((limitation, index) => (
              <li key={index} className="text-red-800 text-sm flex items-start">
                <span className="text-red-600 mr-2">•</span>
                {limitation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Payment Requirement Notice */}
      {preview.paymentRequired && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div className="text-sm text-amber-800">
              <div className="font-medium mb-1">Ödeme Yöntemi Gerekli</div>
              <p>Bu plan yükseltmesi için bir ödeme yöntemi seçmeniz gerekecek. Ödeme hemen işlenecek ve plan değişikliği anında etkili olacak.</p>
            </div>
          </div>
        </div>
      )}

      {/* No Payment Methods Available Notice */}
      {preview.paymentRequired && (!preview.paymentMethods || preview.paymentMethods.length === 0) && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-red-800">
              <div className="font-medium mb-1">Ödeme Yöntemi Bulunamadı</div>
              <p>Bu plan değişikliği için ödeme gerekli ancak kayıtlı ödeme yönteminiz bulunmuyor. Lütfen önce bir ödeme yöntemi ekleyin.</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
            canProceed
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {preview.changeType === 'upgrade'
            ? 'Ödeme Yöntemi Seç'
            : 'Değişikliği Onayla'
          }
        </button>
      </div>
    </div>
  );
}