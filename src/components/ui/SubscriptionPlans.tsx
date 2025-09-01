'use client';

import { useState, useEffect } from 'react';
import { PaymentsService } from '../../lib/services/payments';
import { SubscriptionPlan } from '../../types/subscription';

interface SubscriptionPlansProps {
  onPlanSelect: (plan: SubscriptionPlan) => void;
}

export default function SubscriptionPlans({ onPlanSelect }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await PaymentsService.getSubscriptionPlans();
        setPlans(fetchedPlans);
      } catch (err) {
        setError('Failed to load subscription plans');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const sortedPlans = Array.isArray(plans) ? plans.sort((a, b) => a.sortOrder - b.sortOrder) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600">Select the perfect plan for your business needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sortedPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
              plan.isPopular ? 'border-blue-500 transform scale-105' : 'border-gray-200'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
              {plan.description && (
                <p className="text-gray-600 mb-4">{plan.description}</p>
              )}
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.currency === 'TRY' ? '₺' : '$'}{plan.price}
                </span>
                <span className="text-gray-600 ml-1">
                  /{plan.billingInterval === 'monthly' ? 'month' : plan.billingInterval}
                </span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">
                    {plan.maxBusinesses === -1 ? 'Unlimited' : plan.maxBusinesses} businesses
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">
                    {plan.maxStaffPerBusiness === -1 ? 'Unlimited' : plan.maxStaffPerBusiness} staff per business
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-700">
                    {plan.maxAppointmentsPerDay === -1 ? 'Unlimited' : plan.maxAppointmentsPerDay} appointments/day
                  </span>
                </li>
                
                {plan.features && Array.isArray(plan.features) && plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700 capitalize">
                      {feature.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => onPlanSelect(plan)}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-200 ${
                  plan.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}