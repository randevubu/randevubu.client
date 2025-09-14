'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { businessService } from '../../../lib/services/business';
import SubscriptionPlans from '../../../components/ui/SubscriptionPlans';
import PaymentForm from '../../../components/ui/PaymentForm';

import { PaymentsService } from '../../../lib/services/payments';
import { SubscriptionPlan } from '../../../types/subscription';
import { CreatePaymentRequest } from '../../../types/payment';
import { PaymentResponse } from '../../../lib/services/payments';

import ProfileGuard from '../../../components/features/ProfileGuard';

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'plans' | 'payment' | 'success' | 'error'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [checkingBusiness, setCheckingBusiness] = useState(true);

  
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
    return (
      <div className="min-h-screen">
        {/* Hero Section Skeleton */}
        <section className="relative bg-white pt-16 sm:pt-20 pb-8 sm:pb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-block w-20 h-6 bg-indigo-100 rounded-full animate-pulse mb-3 sm:mb-4"></div>
            
            <div className="space-y-3 mb-4 sm:mb-6">
              <div className="h-8 sm:h-12 lg:h-14 bg-gray-200 rounded-lg animate-pulse mx-auto w-3/4"></div>
              <div className="h-8 sm:h-12 lg:h-14 bg-gray-200 rounded-lg animate-pulse mx-auto w-2/3"></div>
            </div>
            
            <div className="h-4 sm:h-6 bg-gray-200 rounded-lg animate-pulse mx-auto w-1/2 mb-8 sm:mb-12"></div>
            
            {/* Step Indicator Skeleton */}
            <div className="flex items-center justify-center mb-8 sm:mb-12 px-4">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse sm:hidden"></div>
                <div className="w-8 sm:w-16 h-0.5 bg-gray-200 animate-pulse"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 sm:w-16 h-0.5 bg-gray-200 animate-pulse"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse sm:hidden"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Content Section Skeleton */}
        <section className="pb-12 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            {/* Subscription Plans Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
                  {/* Plan Badge */}
                  <div className="h-6 w-20 bg-indigo-100 rounded-full animate-pulse mb-4"></div>
                  
                  {/* Plan Name */}
                  <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
                  
                  {/* Price */}
                  <div className="flex items-baseline space-x-2 mb-6">
                    <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {[...Array(5)].map((_, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Button */}
                  <div className="h-12 bg-indigo-100 rounded-xl animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* Loading Status */}
            <div className="flex items-center justify-center mt-8">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 text-sm sm:text-base">
                  {isLoading ? 'Yükleniyor...' : checkingBusiness ? 'İşletme kontrol ediliyor...' : 'Yükleniyor...'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
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
          <div className="mx-auto flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 sm:mb-4">
            Ödeme Başarılı! 🎉
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
            <span className="font-bold text-indigo-600">{selectedPlan?.displayName}</span> planına başarıyla kayıt oldunuz. 

            Artık tüm özelliklerden faydalanabilirsiniz.
          </p>
        </div>
        
        {paymentResponse && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <h3 className="font-bold text-green-900 mb-2 sm:mb-3 text-center text-sm sm:text-base">Ödeme Detayları</h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-green-800">
              {(paymentResponse.data?.paymentId || paymentResponse.paymentId) && (
                <p><span className="font-semibold">Ödeme ID:</span> {paymentResponse.data?.paymentId || paymentResponse.paymentId}</p>
              )}
              {paymentResponse.data?.subscriptionId && (
                <p><span className="font-semibold">Abonelik ID:</span> {paymentResponse.data.subscriptionId}</p>
              )}
              {paymentResponse.conversationId && (
                <p><span className="font-semibold">İşlem ID:</span> {paymentResponse.conversationId}</p>
              )}
              <p><span className="font-semibold">Durum:</span> {paymentResponse.data?.message || paymentResponse.status || 'Başarılı'}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl"
          >
            Dashboard'a Git 📊
          </button>
          <button
            onClick={handleStartOver}
            className="w-full py-2 sm:py-3 px-4 sm:px-6 text-gray-600 hover:text-gray-800 font-medium text-sm sm:text-base transition-colors"
          >
            Başka Plan Seç
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
      {/* Hero Section */}
      <section className="relative bg-white pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-3 sm:mb-4">
            💳 Abonelik
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Size Uygun
            <br />
            <span className="text-indigo-600">Abonelik Seçin</span>
          </h1>

          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4">
            İşletmenizin ihtiyaçlarına göre tasarlanmış esnek fiyatlandırma planları.
          </p>

          {renderStepIndicator()}
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-12 sm:pb-20">
        {currentStep === 'plans' && (
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <SubscriptionPlans onPlanSelect={handlePlanSelect} />
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
                        {selectedPlan.currency === 'TRY' ? '₺' : '$'}{selectedPlan.price} / {selectedPlan.billingInterval === 'monthly' ? 'ay' : selectedPlan.billingInterval}
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
              
              <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">


                {/* Payment Form Section */}
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Kart Bilgileri</h4>
                  <PaymentForm
                    selectedPlan={selectedPlan}
                    onSubmit={handlePaymentSubmit}
                    onBack={handleBackToPlans}
                    loading={paymentLoading}
                  />
                </div>
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