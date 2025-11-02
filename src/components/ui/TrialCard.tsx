'use client';

import { SubscriptionPlan } from '../../types/subscription';
import { usePlanTrialInfo } from '../../lib/hooks/useTrialSubscription';

interface TrialCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
  currentSubscription?: any;
}

export default function TrialCard({ plan, onSelect, isSelected = false, currentSubscription }: TrialCardProps) {
  const { hasTrial, isBasicPlan, trialDays, shouldShowTrialOffer } = usePlanTrialInfo(plan);
  
  const isCurrentPlan = currentSubscription?.planId === plan.id;
  const isTrialActive = currentSubscription?.status === 'TRIAL';

  return (
    <div className={`relative bg-white rounded-lg shadow-lg border-2 transition-all duration-200 ${
      isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
    } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}>
      
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      {/* Trial Badge */}
      {shouldShowTrialOffer && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            7-day free trial
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Plan Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {plan.displayName}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {plan.description}
          </p>
          
          {/* Pricing */}
          <div className="mb-4">
            {shouldShowTrialOffer ? (
              <div className="space-y-1">
                <div className="text-3xl font-bold text-green-600">
                  Free for {trialDays} days
                </div>
                <div className="text-gray-600">
                  Then {plan.price} {plan.currency}/month
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  {plan.price} {plan.currency}
                </div>
                <div className="text-gray-600">
                  per {plan.billingInterval.toLowerCase()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Plan Indicator */}
        {isCurrentPlan && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                {isTrialActive ? 'Current Trial Plan' : 'Current Plan'}
              </span>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Features included:</h4>
          <ul className="space-y-2">
            {plan.features.description.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trial Notice */}
        {shouldShowTrialOffer && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">No commitment required</p>
                <p className="text-blue-600">Cancel anytime during the trial period</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6">
          {isCurrentPlan ? (
            <button
              disabled
              className="w-full py-2 px-4 bg-gray-100 text-gray-500 rounded-md cursor-not-allowed"
            >
              {isTrialActive ? 'Trial Active' : 'Current Plan'}
            </button>
          ) : (
            <button
              onClick={() => onSelect(plan)}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                shouldShowTrialOffer
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {shouldShowTrialOffer ? 'Start Free Trial' : 'Subscribe Now'}
            </button>
          )}
        </div>

        {/* Trial Terms */}
        {shouldShowTrialOffer && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Credit card required. No charges during trial.</p>
            <p>Auto-renewal after {trialDays} days.</p>
          </div>
        )}
      </div>
    </div>
  );
}




