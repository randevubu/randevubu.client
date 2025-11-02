'use client';

import { Check, X, Plus, Edit, Trash2, Save, RefreshCw, AlertCircle, CheckCircle, Clock, User, Phone, Mail, MapPin, Settings, BarChart3, Home, CreditCard, FileText, HelpCircle, Info, AlertTriangle, Ban, Shield, Users, Building, Star, Heart, Zap, Lock, Unlock, Eye, EyeOff, Calendar, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Loader2, Moon, Sun, XCircle, Tag, Bell, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
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

  // Debug logging
  console.log('🔍 PlanChangeSuccessStep debug:', {
    isUpgrade,
    isDowngrade,
    preview,
    changeResult,
    paymentInfo,
    pricing: preview?.pricing,
    effectiveDate: preview?.pricing?.effectiveDate,
    nextBillingDate: preview?.pricing?.nextBillingDate
  });

  // Helper function to get effective date display
  const getEffectiveDateDisplay = () => {
    if (preview?.pricing?.effectiveDate === 'immediate') {
      return 'Hemen Aktif';
    }
    
    if (preview?.pricing?.nextBillingDate) {
      return formatDate(preview.pricing.nextBillingDate);
    }
    
    // Fallback to immediate for upgrades
    if (isUpgrade) {
      return 'Hemen Aktif';
    }
    
    return 'Bilinmiyor';
  };

  // Helper function to get effective duration/period
  const getEffectiveDuration = () => {
    return 'Anında etkili';
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
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
                {getEffectiveDateDisplay()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Etkili Olma Süresi:</span>
              <span className="font-medium text-green-700">
                {getEffectiveDuration()}
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
                  <Check className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Yeni plan özellikleriniz hemen kullanıma hazır</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Ödeme onayı e-mail adresinize gönderildi</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Sonraki faturalandırma {preview?.pricing?.nextBillingDate ? formatDate(preview.pricing.nextBillingDate) + ' tarihinde' : 'belirleniyor'}</span>
                </div>
              </>
            )}

            {isDowngrade && (
              <>
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Mevcut plan özelliklerinizi {preview?.pricing?.nextBillingDate ? formatDate(preview.pricing.nextBillingDate) + ' tarihine kadar' : 'mevcut süre boyunca'} kullanabilirsiniz</span>
                </div>
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>Plan düşürme onayı e-mail adresinize gönderildi</span>
                </div>
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
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