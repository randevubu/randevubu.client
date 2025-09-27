'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlanSelectionStep from '../features/PlanSelectionStep';
import PaymentForm from './PaymentForm';
import { PaymentsService } from '../../lib/services/payments';
import { SubscriptionPlan } from '../../types/subscription';
import { CreatePaymentRequest, PaymentResponse } from '../../types/payment';

interface SubscriptionFlowProps {
  businessId?: string;
  onSuccess?: (paymentResponse: PaymentResponse) => void;
  onError?: (error: string) => void;
}

type FlowStep = 'plans' | 'payment' | 'success' | 'error';

export default function SubscriptionFlow({ businessId, onSuccess, onError }: SubscriptionFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (paymentData: CreatePaymentRequest) => {
    if (!businessId) {
      const error = 'Business ID is required for payment processing';
      setErrorMessage(error);
      setCurrentStep('error');
      onError?.(error);
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await PaymentsService.createPayment(businessId, paymentData);
      setPaymentResponse(response);
      
      if (response.success) {
        setCurrentStep('success');
        onSuccess?.(response);
      } else {
        const error = response.errorMessage || 'Payment failed';
        setErrorMessage(error);
        setCurrentStep('error');
        onError?.(error);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment processing failed';
      setErrorMessage(errorMsg);
      setCurrentStep('error');
      onError?.(errorMsg);
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          currentStep === 'plans' ? 'bg-blue-600 text-white border-blue-600' : 
          ['payment', 'success', 'error'].includes(currentStep) ? 'bg-green-600 text-white border-green-600' : 
          'border-gray-300 text-gray-500'
        }`}>
          1
        </div>
        <div className="text-sm font-medium">Select Plan</div>
        
        <div className={`w-16 h-0.5 ${
          ['payment', 'success', 'error'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'
        }`}></div>
        
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          currentStep === 'payment' ? 'bg-blue-600 text-white border-blue-600' : 
          ['success', 'error'].includes(currentStep) ? 'bg-green-600 text-white border-green-600' : 
          'border-gray-300 text-gray-500'
        }`}>
          2
        </div>
        <div className="text-sm font-medium">Payment</div>
        
        <div className={`w-16 h-0.5 ${
          ['success', 'error'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-300'
        }`}></div>
        
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          ['success', 'error'].includes(currentStep) ? 'bg-green-600 text-white border-green-600' : 
          'border-gray-300 text-gray-500'
        }`}>
          3
        </div>
        <div className="text-sm font-medium">Complete</div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
      <p className="text-gray-600 mb-6">
        Thank you for subscribing to <strong>{selectedPlan?.displayName}</strong>. 
        Your subscription is now active.
      </p>
      
      {paymentResponse && (
        <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-semibold text-green-900 mb-2">Payment Details</h3>
          <div className="text-sm text-green-700 space-y-1">
            {paymentResponse.paymentId && (
              <p><strong>Payment ID:</strong> {paymentResponse.paymentId}</p>
            )}
            {paymentResponse.conversationId && (
              <p><strong>Conversation ID:</strong> {paymentResponse.conversationId}</p>
            )}
            <p><strong>Status:</strong> {paymentResponse.status || 'Success'}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Go to Dashboard
        </button>
        <button
          onClick={handleStartOver}
          className="w-full py-2 px-4 text-gray-600 hover:text-gray-800"
        >
          Subscribe to Another Plan
        </button>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
      <p className="text-gray-600 mb-6">
        We couldn't process your payment. Please check your card details and try again.
      </p>
      
      {errorMessage && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={handleRetryPayment}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Try Again
        </button>
        <button
          onClick={handleStartOver}
          className="w-full py-2 px-4 text-gray-600 hover:text-gray-800"
        >
          Select Different Plan
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Using test cards?</strong> Try these for testing:
        </p>
        <div className="mt-2 text-xs text-yellow-700 space-y-1">
          <p><strong>Success:</strong> 5528 7900 0000 0008</p>
          <p><strong>Failure:</strong> 5406 6700 0000 0009</p>
          <p>Expiry: 12/2030, CVC: 123</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {renderStepIndicator()}
        
        {currentStep === 'plans' && (
          <PlanSelectionStep 
            currentSubscription={null}
            onPlanSelected={handlePlanSelect} 
          />
        )}
        
        {currentStep === 'payment' && selectedPlan && (
          <PaymentForm
            selectedPlan={selectedPlan}
            onSubmit={handlePaymentSubmit}
            onBack={handleBackToPlans}
            loading={paymentLoading}
          />
        )}
        
        {currentStep === 'success' && renderSuccessStep()}
        
        {currentStep === 'error' && renderErrorStep()}
      </div>
    </div>
  );
}