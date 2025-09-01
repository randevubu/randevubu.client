'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';
import { businessService } from '../../../src/lib/services/business';
import SubscriptionPlans from '../../../src/components/ui/SubscriptionPlans';
import PaymentForm from '../../../src/components/ui/PaymentForm';
import DiscountCodeInput from '../../../src/components/ui/DiscountCodeInput';
import { PaymentsService } from '../../../src/lib/services/payments';
import { SubscriptionPlan } from '../../../src/types/subscription';
import { CreatePaymentRequest, PaymentResponse } from '../../../src/types/payment';
import { ValidateDiscountCodeResponse } from '../../../src/types/discount';

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
  const [discountValidation, setDiscountValidation] = useState<ValidateDiscountCodeResponse | null>(null);
  const [discountCode, setDiscountCode] = useState<string>('');
  
  const checkBusinessAccess = useCallback(async () => {
    try {
      setCheckingBusiness(true);
      
      // Always check via API to ensure consistency (skip user context check)
      // The user context might be stale or incomplete

      // If no user context data, check via API with subscription info
      const response = await businessService.getMyBusiness('?includeSubscription=true');
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

  const handleDiscountApplied = (validation: ValidateDiscountCodeResponse | null, code?: string) => {
    setDiscountValidation(validation);
    if (validation?.isValid && code) {
      setDiscountCode(code);
    } else {
      setDiscountCode('');
    }
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
      // Include discount code in payment data if applied
      const paymentDataWithDiscount = {
        ...paymentData,
        ...(discountCode && { discountCode })
      };

      const response = await PaymentsService.createPayment(businessId, paymentDataWithDiscount);
      setPaymentResponse(response);
      
      if (response.success) {
        setCurrentStep('success');
      } else {
        const error = response.errorMessage || 'Payment failed';
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
    setDiscountValidation(null);
    setDiscountCode('');
    setCurrentStep('plans');
  };

  if (isLoading || checkingBusiness || !businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">
            {isLoading ? 'Loading...' : checkingBusiness ? 'İşletme kontrol ediliyor...' : 'Loading...'}
          </span>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm ${
          currentStep === 'plans' ? 'bg-indigo-600 text-white border-indigo-600' : 
          ['payment', 'success', 'error'].includes(currentStep) ? 'bg-green-500 text-white border-green-500' : 
          'border-gray-300 text-gray-500'
        }`}>
          1
        </div>
        <div className="text-sm font-semibold text-gray-900">Plan Seçimi</div>
        
        <div className={`w-16 h-0.5 ${
          ['payment', 'success', 'error'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'
        }`}></div>
        
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm ${
          currentStep === 'payment' ? 'bg-indigo-600 text-white border-indigo-600' : 
          ['success', 'error'].includes(currentStep) ? 'bg-green-500 text-white border-green-500' : 
          'border-gray-300 text-gray-500'
        }`}>
          2
        </div>
        <div className="text-sm font-semibold text-gray-900">Ödeme</div>
        
        <div className={`w-16 h-0.5 ${
          ['success', 'error'].includes(currentStep) ? 'bg-green-500' : 'bg-gray-300'
        }`}></div>
        
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm ${
          ['success', 'error'].includes(currentStep) ? 'bg-green-500 text-white border-green-500' : 
          'border-gray-300 text-gray-500'
        }`}>
          3
        </div>
        <div className="text-sm font-semibold text-gray-900">Tamamlandı</div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto px-4 lg:px-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Ödeme Başarılı! 🎉
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            <span className="font-bold text-indigo-600">{selectedPlan?.displayName}</span> planına başarıyla kayıt oldunuz. 
            {discountValidation?.isValid && discountCode && (
              <span className="block text-green-600 font-semibold mt-2">
                🎉 "{discountCode}" indirim kodunuz ile {(selectedPlan?.price ?? 0) - (discountValidation.finalAmount ?? 0)}₺ tasarruf ettiniz!
              </span>
            )}
            Artık tüm özelliklerden faydalanabilirsiniz.
          </p>
        </div>
        
        {paymentResponse && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-green-900 mb-3 text-center">Ödeme Detayları</h3>
            <div className="space-y-2 text-sm text-green-800">
              {paymentResponse.paymentId && (
                <p><span className="font-semibold">Ödeme ID:</span> {paymentResponse.paymentId}</p>
              )}
              {paymentResponse.conversationId && (
                <p><span className="font-semibold">İşlem ID:</span> {paymentResponse.conversationId}</p>
              )}
              <p><span className="font-semibold">Durum:</span> {paymentResponse.status || 'Başarılı'}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl"
          >
            Dashboard'a Git 📊
          </button>
          <button
            onClick={handleStartOver}
            className="w-full py-3 px-6 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Başka Plan Seç
          </button>
        </div>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="max-w-2xl mx-auto px-4 lg:px-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12 text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full shadow-lg mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ödeme Başarısız</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Ödemenizi işleyemedik. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-red-900 mb-3 text-center">Hata Detayları</h3>
            <p className="text-sm text-red-800 text-center">{errorMessage}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleRetryPayment}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-2xl"
          >
            Tekrar Dene 🔄
          </button>
          <button
            onClick={handleStartOver}
            className="w-full py-3 px-6 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Farklı Plan Seç
          </button>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
          <p className="text-sm text-yellow-800 font-semibold mb-2">
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
      <section className="relative bg-white pt-20 pb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30"></div>

        <div className="relative max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            💳 Abonelik
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
            Size Uygun
            <br />
            <span className="text-indigo-600">Abonelik Seçin</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            İşletmenizin ihtiyaçlarına göre tasarlanmış esnek fiyatlandırma planları.
          </p>

          {renderStepIndicator()}
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-20">
        {currentStep === 'plans' && (
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <SubscriptionPlans onPlanSelect={handlePlanSelect} />
          </div>
        )}
        
        {currentStep === 'payment' && selectedPlan && (
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-6 lg:p-8 bg-indigo-50 border-b border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-2">Ödeme Bilgileri</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-800 font-semibold">{selectedPlan.displayName}</p>
                    <div className="space-y-1">
                      {discountValidation?.isValid ? (
                        <>
                          <p className="text-indigo-400 line-through text-sm">
                            {selectedPlan.currency === 'TRY' ? '₺' : '$'}{selectedPlan.price} / {selectedPlan.billingInterval === 'monthly' ? 'ay' : selectedPlan.billingInterval}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-indigo-600 font-bold">
                              {selectedPlan.currency === 'TRY' ? '₺' : '$'}{discountValidation.finalAmount} / {selectedPlan.billingInterval === 'monthly' ? 'ay' : selectedPlan.billingInterval}
                            </p>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              {(selectedPlan.price ?? 0) - (discountValidation.finalAmount ?? 0)}₺ tasarruf
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-indigo-600">
                          {selectedPlan.currency === 'TRY' ? '₺' : '$'}{selectedPlan.price} / {selectedPlan.billingInterval === 'monthly' ? 'ay' : selectedPlan.billingInterval}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={handleBackToPlans}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                    >
                      ← Plan Değiştir
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 lg:p-8 space-y-8">
                {/* Discount Code Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">İndirim Kodu</h4>
                  <DiscountCodeInput
                    planId={selectedPlan.id}
                    originalAmount={selectedPlan.price}
                    onDiscountApplied={handleDiscountApplied}
                    className="mb-6"
                  />
                </div>

                {/* Payment Form Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Kart Bilgileri</h4>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}