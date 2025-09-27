'use client';

import { SubscriptionPlan, PlanChangePreview, PaymentMethod } from '../../types/subscription';

interface PlanChangeConfirmationStepProps {
  selectedPlan: SubscriptionPlan | null;
  preview: PlanChangePreview;
  selectedPaymentMethod: PaymentMethod | null;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PlanChangeConfirmationStep({
  selectedPlan,
  preview,
  selectedPaymentMethod,
  onConfirm,
  onBack
}: PlanChangeConfirmationStepProps) {

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

  const getCardBrandIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  const isUpgrade = preview.changeType === 'upgrade';
  const isDowngrade = preview.changeType === 'downgrade';

  console.log('🔍 PlanChangeConfirmationStep debug:', {
    isUpgrade,
    selectedPaymentMethod,
    preview
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">
            {isUpgrade ? '⬆️' : isDowngrade ? '⬇️' : '🔄'}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Değişikliği Onayla</h3>
          <p className="text-gray-600">
            {isUpgrade && 'Plan yükseltmenizi onaylayın ve ödemeyi tamamlayın'}
            {isDowngrade && 'Plan düşürmenizi onaylayın'}
            {!isUpgrade && !isDowngrade && 'Plan değişikliğinizi onaylayın'}
          </p>
        </div>

        {/* Plan Change Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Plan Değişikliği Özeti</h4>

          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <div className="text-sm text-gray-500">Mevcut Plan</div>
              <div className="font-medium text-gray-900">{preview.currentPlan.name}</div>
              <div className="text-sm text-gray-600">
                {formatPrice(preview.currentPlan.price, preview.currentPlan.currency)}/ay
              </div>
            </div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="text-right">
              <div className="text-sm text-gray-500">Yeni Plan</div>
              <div className="font-medium text-gray-900">{preview.newPlan.name}</div>
              <div className="text-sm text-gray-600">
                {formatPrice(preview.newPlan.price, preview.newPlan.currency)}/ay
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Etkili Olma Tarihi:</span>
              <span className="font-medium text-gray-900">
                {preview.pricing?.effectiveDate === 'immediate'
                  ? 'Hemen'
                  : preview.pricing?.nextBillingDate && formatDate(preview.pricing.nextBillingDate)
                }
              </span>
            </div>

            {isUpgrade && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Prorasyon Tutarı:</span>
                  <span className="font-medium text-gray-900">
                    {preview.pricing && formatPrice(preview.pricing.prorationAmount, preview.pricing.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Toplam Ödeme:</span>
                  <span className="font-bold text-lg text-green-600">
                    {preview.pricing && formatPrice(preview.pricing.totalAmount, preview.pricing.currency)}
                  </span>
                </div>
              </>
            )}

            {isDowngrade && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ödeme Durumu:</span>
                <span className="font-medium text-green-600">Ödeme Gerekmiyor</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method (for upgrades) */}
        {isUpgrade && selectedPaymentMethod && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Ödeme Yöntemi</h4>

            <div className="flex items-center">
              <span className="text-2xl mr-3">{getCardBrandIcon(selectedPaymentMethod.brand || selectedPaymentMethod.cardBrand)}</span>
              <div>
                <div className="font-medium text-gray-900">
                  {(selectedPaymentMethod.brand || selectedPaymentMethod.cardBrand)?.toUpperCase() || 'KART'} •••• {selectedPaymentMethod.last4 || selectedPaymentMethod.lastFourDigits}
                </div>
                <div className="text-sm text-gray-600">{selectedPaymentMethod.holderName || selectedPaymentMethod.cardHolderName}</div>
                {(selectedPaymentMethod.expireMonth || selectedPaymentMethod.expiryMonth) && (selectedPaymentMethod.expireYear || selectedPaymentMethod.expiryYear) && (
                  <div className="text-xs text-gray-500">
                    {String(selectedPaymentMethod.expireMonth || selectedPaymentMethod.expiryMonth).padStart(2, '0')}/{selectedPaymentMethod.expireYear || selectedPaymentMethod.expiryYear}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Important Information */}
        <div className={`rounded-2xl p-6 border mb-8 ${
          isUpgrade
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start">
            <svg className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
              isUpgrade ? 'text-green-600' : 'text-amber-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className={`text-sm ${isUpgrade ? 'text-green-800' : 'text-amber-800'}`}>
              <div className="font-medium mb-2">Önemli Bilgiler:</div>
              <ul className="space-y-1 text-xs">
                {isUpgrade && (
                  <>
                    <li>• Ödeme hemen işlenecek ve plan değişikliği anında etkili olacak</li>
                    <li>• Yeni plan özelliklerine hemen erişim sağlayacaksınız</li>
                    <li>• Prorasyon tutarı mevcut fatura döneminin kalan süresine göre hesaplanmıştır</li>
                    <li>• Sonraki fatura döneminiz {preview.pricing?.nextBillingDate && formatDate(preview.pricing.nextBillingDate)} tarihinde başlayacak</li>
                  </>
                )}
                {isDowngrade && (
                  <>
                    <li>• Plan düşürme işlemi {preview.pricing?.nextBillingDate && formatDate(preview.pricing.nextBillingDate)} tarihinde etkili olacak</li>
                    <li>• Bu tarih kadar mevcut plan özelliklerinizi kullanmaya devam edebilirsiniz</li>
                    <li>• Herhangi bir ödeme yapılmayacak veya iade alınmayacak</li>
                    <li>• Plan düşürme öncesi kullanım limitlerinizi kontrol etmenizi öneririz</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Final Confirmation Notice */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-8">
          <div className="text-center text-sm text-gray-700">
            <strong>Son Onay:</strong> Bu işlemi onayladığınızda
            {isUpgrade && ' ödeme derhal işlenecek ve'}
            {' '}plan değişikliği gerçekleştirilecektir.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-medium"
          >
            Geri
          </button>
          <button
            onClick={onConfirm}
            disabled={isUpgrade && !selectedPaymentMethod}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              isUpgrade && !selectedPaymentMethod
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isUpgrade
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transform hover:scale-105 shadow-lg'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105 shadow-lg'
            }`}
          >
            {isUpgrade && 'Öde ve Plan Değiştir'}
            {isDowngrade && 'Planı Düşür'}
            {!isUpgrade && !isDowngrade && 'Planı Değiştir'}
          </button>
        </div>
      </div>
    </div>
  );
}