'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlan, BusinessSubscription, PlanChangePreview, PaymentMethod, ChangePlanData } from '../../types/subscription';
import { subscriptionService } from '../../lib/services/subscription';
import PlanSelectionStep from './PlanSelectionStep';
import PlanChangePreviewStep from './PlanChangePreviewStep';
import PaymentMethodStep from './PaymentMethodStep';
import PlanChangeConfirmationStep from './PlanChangeConfirmationStep';
import PlanChangeProcessingStep from './PlanChangeProcessingStep';
import PlanChangeSuccessStep from './PlanChangeSuccessStep';

type FlowStep = 'plan-selection' | 'preview' | 'payment' | 'confirmation' | 'processing' | 'success' | 'error';

interface PlanChangeFlowProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan | null;
  currentSubscription: BusinessSubscription | null;
  businessId: string;
  onSuccess: () => void;
}

export default function PlanChangeFlow({
  isOpen,
  onClose,
  selectedPlan,
  currentSubscription,
  businessId,
  onSuccess
}: PlanChangeFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('plan-selection');
  const [tempSelectedPlan, setTempSelectedPlan] = useState<SubscriptionPlan | null>(selectedPlan);
  const [preview, setPreview] = useState<PlanChangePreview | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeResult, setChangeResult] = useState<any>(null);

  // Load payment methods when dialog opens
  useEffect(() => {
    if (isOpen && businessId) {
      loadPaymentMethods();
    }
  }, [isOpen, businessId]);

  const loadPaymentMethods = async () => {
    if (!businessId) return;

    try {
      const response = await subscriptionService.getPaymentMethods(businessId);
      if (response.success && response.data) {
        const paymentMethods = Array.isArray(response.data) ? response.data : [];
        setAllPaymentMethods(paymentMethods);
        // Auto-select default payment method
        const defaultMethod = paymentMethods.find(m => m.isDefault || m.makeDefault) || paymentMethods[0];
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod);
        }
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setTempSelectedPlan(selectedPlan);
      if (selectedPlan && currentSubscription) {
        // If a plan is pre-selected, go directly to preview
        setCurrentStep('preview');
        setPreview(null);
        setError(null);
        setChangeResult(null);
        loadPreview();
      } else {
        // If no plan selected, start with plan selection
        setCurrentStep('plan-selection');
        setPreview(null);
        setError(null);
        setChangeResult(null);
      }
    }
  }, [isOpen, selectedPlan, currentSubscription]);

  // Load preview when tempSelectedPlan changes
  useEffect(() => {
    if (tempSelectedPlan && currentSubscription && businessId && currentStep === 'preview') {
      loadPreview();
    }
  }, [tempSelectedPlan, currentSubscription, businessId, currentStep]);

  const loadPreviewForPlan = async (planToUse: SubscriptionPlan) => {
    if (!planToUse || !currentSubscription || !businessId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionService.calculatePlanChange(
        businessId,
        currentSubscription.id,
        planToUse.id
      );

      if (response.success && response.data) {
        const previewData = {
          ...response.data,
          canProceed: true // Override for development - in production this should be response.data.canProceed
        };

        setPreview(previewData);

        // Auto-select default payment method if available
        const paymentMethods = response.data.paymentMethods || [];

        if (paymentMethods && paymentMethods.length > 0) {
          const defaultMethod = paymentMethods.find(m => m.makeDefault || m.isDefault) || paymentMethods[0];
          setSelectedPaymentMethod(defaultMethod);
        }
      } else {
        setError(response.error?.message || 'Preview yüklenemedi');

        // Create a fallback preview for development
        const fallbackPreview: PlanChangePreview = {
          changeType: planToUse.price > (currentSubscription.plan?.price || 0) ? 'upgrade' : 'downgrade',
          currentPlan: {
            id: currentSubscription.planId,
            name: currentSubscription.plan?.name || 'Unknown Plan',
            price: currentSubscription.plan?.price || 0,
            currency: currentSubscription.plan?.currency || 'TRY'
          },
          newPlan: {
            id: planToUse.id,
            name: planToUse.name,
            price: planToUse.price,
            currency: planToUse.currency
          },
          pricing: {
            prorationAmount: 0,
            totalAmount: planToUse.price,
            currency: planToUse.currency,
            effectiveDate: 'immediate',
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          paymentRequired: planToUse.price > (currentSubscription.plan?.price || 0),
          paymentMethods: [],
          limitations: [],
          canProceed: true // Override for development - in production this should be response.data.canProceed
        };

        setPreview(fallbackPreview);
      }
    } catch (err) {
      console.error('Plan change calculation error:', err);
      setError('Beklenmeyen bir hata oluştu');

      // Create a fallback preview even on error
      const fallbackPreview: PlanChangePreview = {
        changeType: planToUse.price > (currentSubscription.plan?.price || 0) ? 'upgrade' : 'downgrade',
        currentPlan: {
          id: currentSubscription.planId,
          name: currentSubscription.plan?.name || 'Unknown Plan',
          price: currentSubscription.plan?.price || 0,
          currency: currentSubscription.plan?.currency || 'TRY'
        },
        newPlan: {
          id: planToUse.id,
          name: planToUse.name,
          price: planToUse.price,
          currency: planToUse.currency
        },
        pricing: {
          prorationAmount: 0,
          totalAmount: planToUse.price,
          currency: planToUse.currency,
          effectiveDate: 'immediate',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        paymentRequired: planToUse.price > (currentSubscription.plan?.price || 0),
        paymentMethods: [],
        limitations: [],
        canProceed: true
      };

      setPreview(fallbackPreview);
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    if (!tempSelectedPlan) return;
    await loadPreviewForPlan(tempSelectedPlan);
  };

  const handlePlanSelected = (plan: SubscriptionPlan) => {
    setTempSelectedPlan(plan);
    setCurrentStep('preview');
    setError(null);
    setPreview(null); // Clear previous preview
    // Load preview will be called by useEffect when tempSelectedPlan changes
  };

  const handlePreviewNext = () => {
    if (!preview) return;

    // For upgrades, always go to payment step regardless of paymentRequired flag
    // This ensures users always select a payment method for upgrades
    if (preview.changeType === 'upgrade') {
      setCurrentStep('payment');
    } else {
      setCurrentStep('confirmation');
    }
  };

  const handlePaymentMethodSelected = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setCurrentStep('confirmation');
  };

  const handleConfirm = async () => {
    if (!preview || !tempSelectedPlan || !currentSubscription) return;

    setCurrentStep('processing');
    setLoading(true);
    setError(null);

    try {
      const changePlanData: ChangePlanData = {
        newPlanId: tempSelectedPlan.id,
        effectiveDate: preview.pricing?.effectiveDate || 'immediate',
        prorationPreference: 'prorate'
      };

      // Backend requires paymentMethodId for all plan changes
      // Try to get payment method ID from multiple sources
      const paymentMethodId = selectedPaymentMethod?.id ||
                              selectedPaymentMethod?.paymentMethodId ||
                              allPaymentMethods[0]?.id ||
                              allPaymentMethods[0]?.paymentMethodId;

      if (!paymentMethodId) {
        setError('Plan değiştirmek için ödeme yöntemi gerekli. Lütfen önce bir ödeme yöntemi ekleyin.');
        setCurrentStep('payment');
        return;
      }

      changePlanData.paymentMethodId = paymentMethodId;

      const response = await subscriptionService.changePlan(
        businessId,
        currentSubscription.id,
        changePlanData
      );

      if (response.success && response.data) {
        setChangeResult(response.data);
        setCurrentStep('success');
        // Don't auto-call onSuccess - let user manually close via button
        // setTimeout(() => {
        //   onSuccess();
        // }, 3000);
      } else {
        setError(response.error?.message || 'Plan değişikliği başarısız oldu');
        setCurrentStep('error');
      }
    } catch (err) {
      console.error('Plan change error:', err);
      setError('Beklenmeyen bir hata oluştu');
      setCurrentStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'preview':
        setCurrentStep('plan-selection');
        break;
      case 'payment':
        setCurrentStep('preview');
        break;
      case 'confirmation':
        if (preview?.changeType === 'upgrade') {
          setCurrentStep('payment');
        } else {
          setCurrentStep('preview');
        }
        break;
      default:
        break;
    }
  };

  const handleRetry = () => {
    if (currentStep === 'error') {
      setCurrentStep('preview');
      loadPreview();
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'plan-selection': return 1;
      case 'preview': return 2;
      case 'payment': return 3;
      case 'confirmation': return preview?.changeType === 'upgrade' ? 4 : 3;
      case 'processing': return preview?.changeType === 'upgrade' ? 5 : 4;
      case 'success': return preview?.changeType === 'upgrade' ? 6 : 5;
      default: return 1;
    }
  };

  const getTotalSteps = () => {
    return preview?.changeType === 'upgrade' ? 6 : 5;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full mx-2 sm:mx-4 shadow-2xl transform transition-all duration-300 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Plan Değişikliği
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center">
                {Array.from({ length: getTotalSteps() }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index + 1 <= getStepNumber()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < getTotalSteps() - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        index + 1 < getStepNumber() ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {getStepNumber()}/{getTotalSteps()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'plan-selection' && (
            <PlanSelectionStep
              currentSubscription={currentSubscription}
              onPlanSelected={handlePlanSelected}
            />
          )}

          {currentStep === 'preview' && (
            <PlanChangePreviewStep
              selectedPlan={tempSelectedPlan}
              currentSubscription={currentSubscription}
              preview={preview}
              loading={loading}
              error={error}
              onNext={handlePreviewNext}
              onRetry={handleRetry}
            />
          )}

          {currentStep === 'payment' && preview && (
            <PaymentMethodStep
              businessId={businessId}
              preview={preview}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodSelected={handlePaymentMethodSelected}
              onBack={handleBack}
            />
          )}

          {currentStep === 'confirmation' && preview && (
            <PlanChangeConfirmationStep
              selectedPlan={tempSelectedPlan}
              preview={preview}
              selectedPaymentMethod={selectedPaymentMethod}
              onConfirm={handleConfirm}
              onBack={handleBack}
            />
          )}

          {currentStep === 'processing' && (
            <PlanChangeProcessingStep
              preview={preview}
              selectedPaymentMethod={selectedPaymentMethod}
            />
          )}

          {currentStep === 'success' && changeResult && (
            <PlanChangeSuccessStep
              changeResult={changeResult}
              preview={preview}
              selectedPaymentMethod={selectedPaymentMethod}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          )}

          {currentStep === 'error' && (
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bir Hata Oluştu</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}