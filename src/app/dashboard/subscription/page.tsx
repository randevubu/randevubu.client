'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardUser, useDashboardBusiness } from '../../../context/DashboardContext';
import { useSubscription, useCancelSubscription } from '../../../lib/hooks/useSubscription';
import Pricing from '../../../components/features/Pricing';
import PlanChangeFlow from '../../../components/features/PlanChangeFlow';

import { SubscriptionPlan } from '../../../types/subscription';
import { SubscriptionStatus } from '../../../types/enums';
import { handleApiError } from '../../../lib/utils/toast';

export default function SubscriptionPage() {
  const router = useRouter();
  const user = useDashboardUser(); // DashboardGuard ensures user exists
  const business = useDashboardBusiness(); // DashboardGuard ensures business exists

  // TanStack Query hooks
  const { subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const cancelSubscriptionMutation = useCancelSubscription();

  // UI state
  const [showPlanChangeFlow, setShowPlanChangeFlow] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(true);

  // Loading state
  const isLoading = subscriptionLoading;


  // getCurrentPlan is no longer needed as the Pricing component handles plan data

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case SubscriptionStatus.TRIAL:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case SubscriptionStatus.PAST_DUE:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case SubscriptionStatus.CANCELED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return 'Aktif';
      case SubscriptionStatus.TRIAL:
        return 'Deneme';
      case SubscriptionStatus.PAST_DUE:
        return 'Gecikmiş Ödeme';
      case SubscriptionStatus.CANCELED:
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const handlePlanChangeSuccess = () => {
    // Reload subscription data after successful plan change
    refetchSubscription();
  };

  const handleCancel = async () => {
    if (!subscription || !business) return;

    try {
      await cancelSubscriptionMutation.mutateAsync({
        businessId: business.id,
        subscriptionId: subscription.id,
      });

      setShowCancelModal(false);
      setCancelAtPeriodEnd(true); // Reset to default
    } catch (error) {
      console.error('Cancellation failed:', error);
      handleApiError(error);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPlanChangeFlow(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <SubscriptionPageContent
      subscription={subscription}
      business={business}
      showPlanChangeFlow={showPlanChangeFlow}
      setShowPlanChangeFlow={setShowPlanChangeFlow}
      showCancelModal={showCancelModal}
      setShowCancelModal={setShowCancelModal}
      selectedPlan={selectedPlan}
      setSelectedPlan={setSelectedPlan}
      cancelAtPeriodEnd={cancelAtPeriodEnd}
      setCancelAtPeriodEnd={setCancelAtPeriodEnd}
      handlePlanChangeSuccess={handlePlanChangeSuccess}
      handleCancel={handleCancel}
      handlePlanSelect={handlePlanSelect}
      formatDate={formatDate}
      formatPrice={formatPrice}
      getStatusColor={getStatusColor}
      getStatusText={getStatusText}
      cancelSubscriptionMutation={cancelSubscriptionMutation}
    />
  );
}

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="h-8 w-48 bg-gray-300 rounded mb-2"></div>
              <div className="h-5 w-64 bg-gray-300 rounded"></div>
            </div>
            <div className="h-10 w-24 bg-gray-300 rounded-2xl"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Plan Card Skeleton */}
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-400 rounded-xl"></div>
                <div className="h-4 w-20 bg-gray-400 rounded"></div>
              </div>
              <div className="h-6 w-32 bg-gray-400 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-400 rounded mb-4"></div>
              <div className="h-10 w-40 bg-gray-400 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-400 rounded"></div>
            </div>

            {/* Features Skeleton */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
                <div className="h-5 w-32 bg-gray-300 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
                <div className="h-5 w-32 bg-gray-300 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="space-y-3 sm:space-y-4">
              <div className="h-12 w-full bg-gray-300 rounded-2xl"></div>
              <div className="h-12 w-full bg-gray-300 rounded-2xl"></div>
            </div>
          </div>
        </div>

        {/* Available Plans Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 animate-pulse">
          <div className="text-center mb-6 sm:mb-10">
            <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-3"></div>
            <div className="h-6 w-64 bg-gray-300 rounded mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
                <div className="h-10 w-40 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                </div>
                <div className="h-12 w-full bg-gray-300 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Statistics Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="text-center mb-6 sm:mb-10">
            <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-3"></div>
            <div className="h-6 w-64 bg-gray-300 rounded mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-8 w-24 bg-gray-300 rounded"></div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

interface SubscriptionPageContentProps {
  subscription: any;
  business: any;
  showPlanChangeFlow: boolean;
  setShowPlanChangeFlow: (show: boolean) => void;
  showCancelModal: boolean;
  setShowCancelModal: (show: boolean) => void;
  selectedPlan: SubscriptionPlan | null;
  setSelectedPlan: (plan: SubscriptionPlan | null) => void;
  cancelAtPeriodEnd: boolean;
  setCancelAtPeriodEnd: (value: boolean) => void;
  handlePlanChangeSuccess: () => void;
  handleCancel: () => void;
  handlePlanSelect: (plan: SubscriptionPlan) => void;
  formatDate: (date: Date) => string;
  formatPrice: (price: number, currency: string | undefined) => string;
  getStatusColor: (status: SubscriptionStatus) => string;
  getStatusText: (status: SubscriptionStatus) => string;
  cancelSubscriptionMutation: any;
}

const SubscriptionPageContent = ({
  subscription,
  business,
  showPlanChangeFlow,
  setShowPlanChangeFlow,
  showCancelModal,
  setShowCancelModal,
  selectedPlan,
  setSelectedPlan,
  cancelAtPeriodEnd,
  setCancelAtPeriodEnd,
  handlePlanChangeSuccess,
  handleCancel,
  handlePlanSelect,
  formatDate,
  formatPrice,
  getStatusColor,
  getStatusText,
  cancelSubscriptionMutation,
}: SubscriptionPageContentProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Current Subscription Status - Enhanced */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 relative overflow-hidden">
          {/* Background decoration - hidden on mobile for better performance */}
          <div className="hidden lg:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="hidden lg:block absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Mevcut Abonelik</h2>
                <p className="text-sm sm:text-base text-gray-600">İşletmenizin aktif abonelik durumu</p>
              </div>
              <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl text-sm font-semibold border-2 text-center sm:text-left ${getStatusColor(subscription?.status || SubscriptionStatus.ACTIVE)}`}>
                {getStatusText(subscription?.status || SubscriptionStatus.ACTIVE)}
              </div>
            </div>

            {subscription ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Plan Card - Enhanced */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm text-blue-100">Aktif Plan</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">Aktif Abonelik</h3>
                  <p className="text-blue-100 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">Mevcut abonelik planınız</p>

                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {subscription.plan?.displayName || subscription.planId}
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm font-medium">
                    Durum: {getStatusText(subscription.status)}
                  </div>
                </div>

                {/* Features & Details - Enhanced */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Plan Özellikleri
                    </h4>
                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-center text-xs sm:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                        <span className="break-words">Abonelik aktif</span>
                      </li>
                      <li className="flex items-center text-xs sm:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                        <span className="break-words">Tüm özellikler dahil</span>
                      </li>
                      <li className="flex items-center text-xs sm:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                        <span className="break-words">Premium destek</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                      Abonelik Detayları
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-medium">Dönem Başlangıcı:</span>
                        <span className="font-medium">{formatDate(subscription.currentPeriodStart)}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="font-medium">Dönem Sonu:</span>
                        <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                      </div>
                      {subscription.cancelAtPeriodEnd && (
                        <div className="text-amber-700 font-medium bg-amber-50 px-3 py-2 rounded-lg text-center text-xs sm:text-sm">
                          ⚠️ Bu dönem sonunda iptal edilecek
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Enhanced */}
                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => setShowPlanChangeFlow(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg active:scale-95 touch-manipulation"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-sm sm:text-base">Planı Güncelle</span>
                    </div>
                  </button>
                  
                  {!subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg active:scale-95 touch-manipulation"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm sm:text-base">Aboneliği İptal Et</span>
                      </div>
                    </button>
                  ) : (
                    <div className="text-center text-xs sm:text-sm text-amber-700 bg-amber-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-amber-200">
                      Abonelik bu dönem sonunda iptal edilecek
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mb-6 shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Henüz bir aboneliğiniz bulunmuyor
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  İşletmenizi büyütmek ve daha fazla özellik kullanmak için bir plan seçin
                </p>
                <button
                  onClick={() => setShowPlanChangeFlow(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg text-lg"
                >
                  Plan Seç ve Başla
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Available Plans - Using Pricing Component */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Mevcut Planlar</h2>
            <p className="text-gray-600 text-base sm:text-lg">İhtiyaçlarınıza en uygun planı seçin</p>
          </div>

          <Pricing onPlanSelect={handlePlanSelect} />
        </div>

      </div>

      {/* Professional Plan Change Flow */}
      <PlanChangeFlow
        isOpen={showPlanChangeFlow}
        onClose={() => {
          setShowPlanChangeFlow(false);
          setSelectedPlan(null);
        }}
        selectedPlan={selectedPlan}
        currentSubscription={subscription}
        businessId={business?.id || ''}
        onSuccess={handlePlanChangeSuccess}
      />

      {/* Enhanced Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 max-w-lg w-full mx-2 sm:mx-4 shadow-2xl transform transition-all duration-300">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                Aboneliği İptal Et
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-4">
                Aboneliğinizi iptal etmek istediğinizden emin misiniz?
              </p>
              
              {/* Cancel Option Toggle */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelAtPeriodEnd}
                    onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cancelAtPeriodEnd ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      cancelAtPeriodEnd ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Dönem sonunda iptal et
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-2 ml-14">
                  {cancelAtPeriodEnd 
                    ? `Aboneliğiniz ${subscription ? formatDate(subscription.currentPeriodEnd) : ''} tarihinde sona erecek`
                    : 'Aboneliğiniz hemen iptal edilecek'
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium active:scale-95 touch-manipulation"
              >
                Vazgeç
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelSubscriptionMutation.isPending}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 sm:px-6 py-3 rounded-2xl hover:from-red-600 hover:to-pink-600 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg active:scale-95 touch-manipulation"
              >
                {cancelSubscriptionMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm sm:text-base">İşleniyor...</span>
                  </div>
                ) : (
                  'İptal Et'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
