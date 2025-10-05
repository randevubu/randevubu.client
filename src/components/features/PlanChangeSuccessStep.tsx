'use client';

import { PlanChangePreview, PaymentMethod } from '../../types/subscription';

interface PlanChangeSuccessStepProps {
  changeResult: any;
  preview: PlanChangePreview | null;
  selectedPaymentMethod: PaymentMethod | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PlanChangeSuccessStep({
  changeResult,
  preview,
  selectedPaymentMethod,
  onClose,
  onSuccess
}: PlanChangeSuccessStepProps) {

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const isUpgrade = preview?.changeType === 'upgrade';
  const isDowngrade = preview?.changeType === 'downgrade';
  const paymentInfo = changeResult?.data?.paymentInfo;

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {isUpgrade && '🎉 Plan Yükseltme Başarılı!'}
            {isDowngrade && '✅ Plan Düşürme Planlandı!'}
            {!isUpgrade && !isDowngrade && '✅ Plan Değişikliği Tamamlandı!'}
          </h3>
          <p className="text-gray-600 text-lg">
            {isUpgrade && 'Ödemeniz başarıyla işlendi ve yeni planınız aktif edildi.'}
            {isDowngrade && 'Plan düşürmeniz başarıyla planlandı ve sonraki fatura döneminde etkili olacak.'}
            {!isUpgrade && !isDowngrade && 'Plan değişikliğiniz başarıyla tamamlandı.'}
          </p>
        </div>

        {/* Plan Change Summary */}
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Plan Değişikliği Özeti</h4>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Önceki Plan:</span>
              <span className="font-medium text-gray-900">{preview?.currentPlan.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Yeni Plan:</span>
              <span className="font-medium text-green-700">{preview?.newPlan.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Etkili Olma Tarihi:</span>
              <span className="font-medium text-gray-900">
                {preview?.pricing?.effectiveDate === 'immediate'
                  ? 'Hemen Aktif'
                  : preview?.pricing?.nextBillingDate ? formatDate(preview.pricing.nextBillingDate) : 'Bilinmiyor'}
              </span>
            </div>

            {isDowngrade && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Mevcut Plan Süresi:</span>
                <span className="font-medium text-amber-700">
                  {preview?.pricing?.nextBillingDate ? formatDate(preview.pricing.nextBillingDate) + ' tarihine kadar' : 'Bilinmiyor'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Confirmation (for upgrades) */}
        {isUpgrade && paymentInfo && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Ödeme Onayı</h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ödeme Tutarı:</span>
                <span className="font-bold text-lg text-green-600">
                  {formatPrice(paymentInfo.amount, paymentInfo.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ödeme Yöntemi:</span>
                <span className="font-medium text-gray-900">
                  {(selectedPaymentMethod?.brand || selectedPaymentMethod?.cardBrand)?.toUpperCase() || 'KART'} •••• {selectedPaymentMethod?.last4 || selectedPaymentMethod?.lastFourDigits}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">İşlem ID:</span>
                <span className="font-mono text-xs text-gray-600">{paymentInfo.paymentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">İşlem Tarihi:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(changeResult?.data?.updatedAt || new Date().toISOString())}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Sırada Ne Var?</h4>

          <div className="space-y-3 text-sm text-left">
            {isUpgrade && (
              <>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Yeni plan özellikleriniz hemen kullanıma hazır</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Ödeme onayı e-mail adresinize gönderildi</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Sonraki faturalandırma {preview?.pricing?.nextBillingDate ? formatDate(preview.pricing.nextBillingDate) + ' tarihinde' : 'belirleniyor'}</span>
                </div>
              </>
            )}

            {isDowngrade && (
              <>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Mevcut plan özelliklerinizi {preview?.pricing?.nextBillingDate ? formatDate(preview.pricing.nextBillingDate) + ' tarihine kadar' : 'mevcut süre boyunca'} kullanabilirsiniz</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Plan düşürme onayı e-mail adresinize gönderildi</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>İstediğiniz zaman plan düşürmeyi iptal edebilirsiniz</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            onSuccess?.(); // Refresh subscription data
            onClose(); // Close the modal
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all font-semibold shadow-lg"
        >
          Dashboard'a Dön
        </button>
      </div>
    </div>
  );
}