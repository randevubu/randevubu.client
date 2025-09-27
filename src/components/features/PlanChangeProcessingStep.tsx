'use client';

import { PlanChangePreview, PaymentMethod } from '../../types/subscription';

interface PlanChangeProcessingStepProps {
  preview: PlanChangePreview | null;
  selectedPaymentMethod: PaymentMethod | null;
}

export default function PlanChangeProcessingStep({
  preview,
  selectedPaymentMethod
}: PlanChangeProcessingStepProps) {

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price);
  };

  const isUpgrade = preview?.changeType === 'upgrade';

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Processing Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-400 border-t-transparent rounded-full animate-ping opacity-20"></div>
            </div>

            {/* Processing Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {isUpgrade ? (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Processing Message */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {isUpgrade ? 'Ödeme İşleniyor' : 'Plan Değişikliği İşleniyor'}
          </h3>
          <p className="text-gray-600 text-lg">
            {isUpgrade
              ? 'Ödemeniz güvenli olarak işleniyor ve plan değişikliğiniz gerçekleştiriliyor...'
              : 'Plan değişikliğiniz planlanıyor...'
            }
          </p>
        </div>

        {/* Processing Steps */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            {isUpgrade && (
              <>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Ödeme yöntemi doğrulandı</span>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-6 border-2 border-blue-600 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-gray-700">Ödeme işleniyor {preview?.pricing?.totalAmount && preview?.pricing?.currency && `(${formatPrice(preview.pricing.totalAmount, preview.pricing.currency)})`}</span>
                </div>

                <div className="flex items-center opacity-50">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                  <span className="text-gray-500">Plan aktivasyonu</span>
                </div>
              </>
            )}

            {!isUpgrade && (
              <>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Plan değişikliği doğrulandı</span>
                </div>

                <div className="flex items-center">
                  <div className="w-6 h-6 border-2 border-blue-600 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-gray-700">Değişiklik planlanıyor</span>
                </div>

                <div className="flex items-center opacity-50">
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                  <span className="text-gray-500">Onay bildirimi</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Details (for upgrades) */}
        {isUpgrade && selectedPaymentMethod && preview && (
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <div className="text-sm text-blue-800">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {(selectedPaymentMethod.brand || selectedPaymentMethod.cardBrand)?.toUpperCase() || 'KART'} •••• {selectedPaymentMethod.last4 || selectedPaymentMethod.lastFourDigits}
              </div>
              {preview?.pricing?.totalAmount && preview?.pricing?.currency && (
                <div className="text-xs text-blue-600 mt-1">
                  {formatPrice(preview.pricing.totalAmount, preview.pricing.currency)} işleniyor
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Notice */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Bu işlem birkaç saniye sürebilir. Lütfen sayfayı kapatmayın.</p>
        </div>
      </div>
    </div>
  );
}