'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { businessService } from '../../../lib/services/business';
import { useSubscriptionPlans } from '../../../lib/hooks/useSubscriptionPlans';
import { useTrialSubscription, usePlanTrialInfo } from '../../../lib/hooks/useTrialSubscription';
import TrialCard from '../../../components/ui/TrialCard';
import TrialPaymentForm from '../../../components/ui/TrialPaymentForm';
import TrialStatus from '../../../components/ui/TrialStatus';
import Confetti from 'react-confetti';

import { SubscriptionPlan } from '../../../types/subscription';
import { TrialSubscriptionRequest } from '../../../types/subscription';

import ProfileGuard from '../../../components/ui/ProfileGuard';

function TrialSubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'plans' | 'payment' | 'success' | 'error'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [checkingBusiness, setCheckingBusiness] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const [isNewBusiness, setIsNewBusiness] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Hooks
  const { plans, isLoading: plansLoading, isError: plansError } = useSubscriptionPlans();
  const { createTrialSubscription, isLoading: trialLoading } = useTrialSubscription();

  const checkBusinessAccess = useCallback(async () => {
    try {
      setCheckingBusiness(true);
      
      const response = await businessService.getMyBusiness();
      console.log('Trial Subscription - API response:', response);
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        const subscription = primaryBusiness.subscription;

        console.log('Trial Subscription - Business:', primaryBusiness.name);
        console.log('Trial Subscription - Subscription:', subscription);

        // Set current subscription for status display
        setCurrentSubscription(subscription);

        if (subscription && ['ACTIVE', 'TRIAL'].includes(subscription.status)) {
          console.log('Trial Subscription - Active subscription found, redirecting to dashboard subscription page');
          router.push('/dashboard/subscription');
          return;
        }

        console.log('Trial Subscription - No active subscription, showing trial plans');
        setBusinessId(primaryBusiness.id);
        setBusinessName(primaryBusiness.name);

        // Check if this is a newly created business
        const fromOnboarding = searchParams.get('from') === 'onboarding';
        setIsNewBusiness(fromOnboarding);
      } else {
        console.log('Trial Subscription - No business found, redirecting to onboarding');
        router.push('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Business check failed:', error);
      router.push('/onboarding');
      return;
    } finally {
      setCheckingBusiness(false);
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

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

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('payment');
  };

  const handleTrialSubmit = async (trialData: TrialSubscriptionRequest) => {
    if (!businessId) {
      setErrorMessage('Business ID is required for trial subscription');
      setCurrentStep('error');
      return;
    }

    try {
      await createTrialSubscription(trialData);
      setShowConfetti(true);
      setCurrentStep('success');
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error) {
      console.error('Trial subscription error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Trial subscription failed');
      setCurrentStep('error');
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
    setCurrentStep('plans');
    setErrorMessage('');
  };

  const handleCancelSubscription = async () => {
    // This would be implemented with the cancel subscription hook
    console.log('Cancel subscription clicked');
  };

  const handleUpdatePayment = () => {
    // This would be implemented with payment method management
    console.log('Update payment method clicked');
  };

  // Loading states
  if (isLoading || checkingBusiness || plansLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (plansError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Plans</h2>
          <p className="text-gray-600 mb-4">Unable to load subscription plans. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Success step
  const renderSuccessStep = () => (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Trial Started Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your {selectedPlan?.features.trialDays}-day free trial has begun. You now have full access to all features.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Go to Dashboard
        </button>
        <button
          onClick={handleStartOver}
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium ml-0 sm:ml-3"
        >
          Start Over
        </button>
      </div>
    </div>
  );

  // Error step
  const renderErrorStep = () => (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Trial Subscription Failed</h2>
      <p className="text-gray-600 mb-6">{errorMessage}</p>
      <div className="space-y-3">
        <button
          onClick={handleRetryPayment}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Try Again
        </button>
        <button
          onClick={handleStartOver}
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium ml-0 sm:ml-3"
        >
          Start Over
        </button>
      </div>
    </div>
  );

  // Step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep === 'plans' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`w-16 h-1 ${currentStep === 'payment' || currentStep === 'success' ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep === 'payment' ? 'bg-blue-600 text-white' : 
          currentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isNewBusiness ? 'Welcome! Choose Your Plan' : 'Upgrade Your Subscription'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isNewBusiness 
              ? 'Start with a free trial and experience all the features risk-free.'
              : 'Unlock more features and grow your business with our premium plans.'
            }
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="mb-8">
            <TrialStatus
              subscription={currentSubscription}
              onCancel={handleCancelSubscription}
              onUpdatePayment={handleUpdatePayment}
            />
          </div>
        )}

        {renderStepIndicator()}

        {/* Plans Step */}
        {currentStep === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const { shouldShowTrialOffer } = usePlanTrialInfo(plan);
              return (
                <TrialCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handlePlanSelect}
                  currentSubscription={currentSubscription}
                />
              );
            })}
          </div>
        )}

        {/* Payment Step */}
        {currentStep === 'payment' && selectedPlan && (
          <TrialPaymentForm
            selectedPlan={selectedPlan}
            onSubmit={handleTrialSubmit}
            onBack={handleBackToPlans}
            loading={trialLoading}
          />
        )}

        {/* Success Step */}
        {currentStep === 'success' && renderSuccessStep()}

        {/* Error Step */}
        {currentStep === 'error' && renderErrorStep()}
      </div>
    </div>
  );
}

export default function TrialSubscriptionPage() {
  return (
    <ProfileGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <TrialSubscriptionContent />
      </Suspense>
    </ProfileGuard>
  );
}




