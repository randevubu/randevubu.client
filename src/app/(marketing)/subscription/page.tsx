'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { businessService } from '../../../lib/services/business';
import Pricing from '../../../components/ui/Pricing';
import PaymentForm from '../../../components/ui/PaymentForm';
import Confetti from 'react-confetti';

import { PaymentsService } from '../../../lib/services/payments';
import { SubscriptionPlan } from '../../../types/subscription';
import { CreatePaymentRequest } from '../../../types/payment';
import { PaymentResponse } from '../../../lib/services/payments';

import ProfileGuard from '../../../components/ui/ProfileGuard';
import SubscriptionPageSkeleton from '../../../components/ui/SubscriptionPageSkeleton';

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'plans' | 'payment' | 'success' | 'error'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [checkingBusiness, setCheckingBusiness] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [isNewBusiness, setIsNewBusiness] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  
  const checkBusinessAccess = useCallback(async () => {
    try {
      setCheckingBusiness(true);
      
      // Always check via API to ensure consistency (skip user context check)
      // The user context might be stale or incomplete

      // If no user context data, check via API with subscription info
      const response = await businessService.getMyBusiness();
      console.log('Subscription - API response:', response);
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        const subscription = primaryBusiness.subscription;

        console.log('Subscription - Business:', primaryBusiness.name);
        console.log('Subscription - Subscription:', subscription);

        if (subscription && ['ACTIVE', 'TRIAL'].includes(subscription.status)) {
          console.log('Subscription - Active subscription found, redirecting to dashboard subscription page');
          router.push('/dashboard/subscription');
          return;
        }

        console.log('Subscription - No active subscription, showing subscription plans');
        setBusinessId(primaryBusiness.id);
        setBusinessName(primaryBusiness.name);

        // Check if this is a newly created business (from query param or recently created)
        const fromOnboarding = searchParams.get('from') === 'onboarding';
        setIsNewBusiness(fromOnboarding);
      } else {
        console.log('Subscription - No business found, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Business check failed:', error);
      // On error, redirect to onboarding as safe default
      router.push('/onboarding');
      return;
    } finally {
      setCheckingBusiness(false);
    }
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Check business via API to avoid infinite loops
    checkBusinessAccess();
  }, [user, isAuthenticated, isLoading, router, checkBusinessAccess]);

  // Handle window dimensions for confetti
  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Show confetti on success
  useEffect(() => {
    if (currentStep === 'success') {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Show success banner with slight delay for better UX
  useEffect(() => {
    if (isNewBusiness && businessName) {
      const timer = setTimeout(() => {
        setShowSuccessBanner(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNewBusiness, businessName]);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('payment');
  };



  const handlePaymentSubmit = async (paymentData: CreatePaymentRequest) => {
    if (!businessId) {
      const error = 'Business ID is required for payment processing';
      setErrorMessage(error);
      setCurrentStep('error');
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await PaymentsService.createPayment(businessId, paymentData);
      setPaymentResponse(response);
      
      // Debug: Log the complete payment response
      console.log('Payment Response:', {
        success: response.success,
        data: response.data,
        status: response.status,
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,

      });
      
      // Check for payment success - if response.success is true and we have subscription/payment data
      const isPaymentSuccessful = response.success && (
        (response.data?.subscriptionId && response.data?.paymentId) || // New API response structure
        (response.paymentId) || // Legacy response structure
        (response.status && ['SUCCESS', 'PAID', 'success', 'paid'].includes(response.status.toUpperCase()))
      );
      
      if (isPaymentSuccessful) {
        setCurrentStep('success');
      } else {
        const error = response.errorMessage || response.data?.message || response.status || 'Payment failed';
        setErrorMessage(error);
        setCurrentStep('error');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment processing failed';
      setErrorMessage(errorMsg);
      setCurrentStep('error');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setCurrentStep('plans');
  };

  const handleRetryPayment = () => {
    setErrorMessage('');
    setCurrentStep('payment');
  };

  const handleStartOver = () => {
    setSelectedPlan(null);
    setPaymentResponse(null);
    setErrorMessage('');

    setCurrentStep('plans');
  };

  if (isLoading || checkingBusiness || !businessId) {
    const loadingMessage = isLoading
      ? 'Yükleniyor...'
      : checkingBusiness
        ? 'İşletme kontrol ediliyor...'
        : 'Yükleniyor...';

    return <SubscriptionPageSkeleton loadingMessage={loadingMessage} />;
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 sm:mb-12 px-4">
      <div className="flex items-center space-x-2 sm:space-x-4 max-w-full overflow-x-auto">
        <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 font-bold text-xs sm:text-sm flex-shrink-0 ${
          currentStep === 'plans' ? 'bg-indigo-600 text-white border-indigo-600' : 
          ['payment', 'success', 'error'].includes(currentStep) ? 'bg-green-500 text-white border-green-500' : 
          'border-gray-300 text-gray-500'
        }`}>
          1
        </div>
        <div className="text-xs sm:text-sm font-semibold text-gray-900 hidden sm:block">Plan Seçimi</div>
        <div className="text-xs font-semibold text-gray-900 sm:hidden">Plan</div>
        
        <div className={`w-8 sm:w-16 h-0.5 flex-shrink-0 ${
          ['payment', 'success', 'error'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'
        }`}></div>
        
        <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 font-bold text-xs sm:text-sm flex-shrink-0 ${
          currentStep === 'payment' ? 'bg-indigo-600 text-white border-indigo-600' : 
          ['success', 'error'].includes(currentStep) ? 'bg-green-500 text-white border-green-500' : 
          'border-gray-300 text-gray-500'
        }`}>
          2
        </div>
        <div className="text-xs sm:text-sm font-semibold text-gray-900">Ödeme</div>
        
        <div className={`w-8 sm:w-16 h-0.5 flex-shrink-0 ${
          ['success', 'error'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'
        }`}></div>
        
        <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 font-bold text-xs sm:text-sm flex-shrink-0 ${
          ['success', 'error'].includes(currentStep) ? 'bg-green-500 text-white border-green-500' : 
          'border-gray-300 text-gray-500'
        }`}>
          3
        </div>
        <div className="text-xs sm:text-sm font-semibold text-gray-900 hidden sm:block">Tamamlandı</div>
        <div className="text-xs font-semibold text-gray-900 sm:hidden">Son</div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto px-4 lg:px-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100 p-4 sm:p-8 lg:p-12 text-center">
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-4 sm:mb-6 animate-bounce">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 sm:mb-4">
            🎉 Hoş Geldiniz! 🎉
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            <span className="font-bold text-indigo-600">{selectedPlan?.displayName}</span> planınız aktifleştirildi!
            <br />
            Artık işletmenizi profesyonelce yönetmeye başlayabilirsiniz.
          </p>
        </div>

        {paymentResponse && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-green-900 text-sm sm:text-base">Aboneliğiniz Başarıyla Oluşturuldu</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-xs text-gray-600 mb-1">Başlangıç Tarihi</div>
                <div className="font-semibold text-green-800 text-sm">
                  {new Date().toLocaleDateString('tr-TR')}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-xs text-gray-600 mb-1">Aylık Ücret</div>
                <div className="font-semibold text-green-800 text-sm">
                  ₺{selectedPlan?.price?.toLocaleString('tr-TR')}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-2xl mb-1">🏢</div>
                <div className="text-xs text-gray-600 mb-1">İşletme Sayısı</div>
                <div className="font-semibold text-green-800 text-sm">
                  {selectedPlan?.maxBusinesses === -1 ? 'Sınırsız' : selectedPlan?.maxBusinesses}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-xs text-gray-600 mb-1">Personel Sayısı</div>
                <div className="font-semibold text-green-800 text-sm">
                  {selectedPlan?.maxStaffPerBusiness === -1 ? 'Sınırsız' : selectedPlan?.maxStaffPerBusiness}
                </div>
              </div>
            </div>

            {paymentResponse.conversationId && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="text-xs text-green-700">
                  <span className="font-semibold">İşlem Referans No:</span> {paymentResponse.conversationId}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 sm:py-6 px-6 sm:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl"
          >
            🚀 Hemen Başla - Dashboard'a Git
          </button>

          <button
            onClick={handleStartOver}
            className="w-full py-2 sm:py-3 px-4 sm:px-6 text-gray-500 hover:text-gray-700 font-medium text-xs sm:text-sm transition-colors"
          >
            Farklı Plan Seç
          </button>
        </div>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="max-w-2xl mx-auto px-4 lg:px-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100 p-4 sm:p-8 lg:p-12 text-center">
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-lg mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 sm:mb-4">Ödeme Başarısız</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            Ödemenizi işleyemedik. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <h3 className="font-bold text-red-900 mb-2 sm:mb-3 text-center text-sm sm:text-base">Hata Detayları</h3>
            <p className="text-xs sm:text-sm text-red-800 text-center">{errorMessage}</p>
          </div>
        )}
        
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={handleRetryPayment}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl"
          >
            Tekrar Dene 🔄
          </button>
          <button
            onClick={handleStartOver}
            className="w-full py-2 sm:py-3 px-4 sm:px-6 text-gray-600 hover:text-gray-800 font-medium text-sm sm:text-base transition-colors"
          >
            Farklı Plan Seç
          </button>
        </div>
        
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl sm:rounded-2xl">
          <p className="text-xs sm:text-sm text-yellow-800 font-semibold mb-2">
            Test kartları kullanıyor musunuz?
          </p>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><span className="font-semibold">Başarılı:</span> 5528 7900 0000 0008</p>
            <p><span className="font-semibold">Başarısız:</span> 5406 6700 0000 0009</p>
            <p>Son Kullanma: 12/2030, CVC: 123</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}
      {/* Hero Section */}
      <section className="relative bg-white pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          {/* Success Banner for New Business */}
          {isNewBusiness && businessName && showSuccessBanner && (
            <div className="mb-6 sm:mb-8 animate-fade-in">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-green-900">İşletme Başarıyla Oluşturuldu! 🎉</h3>
                </div>
                <p className="text-sm sm:text-base text-green-800">
                  <span className="font-semibold text-green-900">{businessName}</span> artık sistemde kayıtlı. Şimdi devam etmek için bir abonelik planı seçin.
                </p>
              </div>
            </div>
          )}

          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-3 sm:mb-4">
            💳 Abonelik Seçimi
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            {isNewBusiness && businessName ? (
              <>
                <span className="text-indigo-600">{businessName}</span> için
                <br />
                Plan Seçin
              </>
            ) : (
              <>
                Size Uygun
                <br />
                <span className="text-indigo-600">Abonelik Seçin</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4">
            {isNewBusiness
              ? 'İşletmenizi aktif hale getirmek ve randevuları yönetmeye başlamak için bir abonelik planı seçin.'
              : 'İşletmenizin ihtiyaçlarına göre tasarlanmış esnek fiyatlandırma planları.'
            }
          </p>

          {renderStepIndicator()}
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-12 sm:pb-20">
        {currentStep === 'plans' && (
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <Pricing onPlanSelect={handlePlanSelect} />
          </div>
        )}
        
        {currentStep === 'payment' && selectedPlan && (
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 bg-indigo-50 border-b border-indigo-100">
                <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-2">Ödeme Bilgileri</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <p className="text-sm sm:text-base text-indigo-800 font-semibold">{selectedPlan.displayName}</p>
                    <div className="space-y-1">
                      <p className="text-sm sm:text-base text-indigo-600">
                        {selectedPlan.currency === 'TRY' ? '₺' : '$'}{selectedPlan.price} / {selectedPlan.billingInterval?.toLowerCase() === 'monthly' ? 'ay' : selectedPlan.billingInterval}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <button
                      onClick={handleBackToPlans}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-xs sm:text-sm transition-colors"
                    >
                      ← Plan Değiştir
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Payment Form Section */}
                <PaymentForm
                  selectedPlan={selectedPlan}
                  onSubmit={handlePaymentSubmit}
                  onBack={handleBackToPlans}
                  loading={paymentLoading}
                />
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'success' && renderSuccessStep()}
        
        {currentStep === 'error' && renderErrorStep()}
      </section>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <ProfileGuard>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-sm sm:text-base">Yükleniyor...</span>
          </div>
        </div>
      }>
        <SubscriptionContent />
      </Suspense>
    </ProfileGuard>
  );
}