'use client';

import { useState } from 'react';
import { SubscriptionPlan } from '../../types/subscription';
import { TrialSubscriptionRequest } from '../../types/subscription';
import { useTrialSubscription } from '../../lib/hooks/useTrialSubscription';
import DiscountCodeInput from './DiscountCodeInput';

interface TrialPaymentFormProps {
  selectedPlan: SubscriptionPlan;
  onSubmit: (trialData: TrialSubscriptionRequest) => void;
  onBack: () => void;
  loading?: boolean;
}

type PaymentStep = 'card' | 'billing';

export default function TrialPaymentForm({ selectedPlan, onSubmit, onBack, loading = false }: TrialPaymentFormProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('card');
  const { createTrialSubscription, isLoading: trialLoading } = useTrialSubscription();

  const [cardData, setCardData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });

  const [buyerData, setBuyerData] = useState({
    name: '',
    surname: '',
    email: '',
    gsmNumber: '',
    address: '',
    city: '',
    country: 'Turkey',
    zipCode: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED';
  } | null>(null);

  const validateCard = (card: any): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!card.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Kart sahibinin adı gereklidir';
    }

    const cardNumber = card.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'Kart numarası gereklidir';
    } else if (cardNumber.length < 15 || cardNumber.length > 19) {
      newErrors.cardNumber = 'Geçersiz kart numarası';
    }

    if (!card.expireMonth) {
      newErrors.expireMonth = 'Son kullanma ayı gereklidir';
    } else if (parseInt(card.expireMonth) < 1 || parseInt(card.expireMonth) > 12) {
      newErrors.expireMonth = 'Geçersiz ay';
    }

    if (!card.expireYear) {
      newErrors.expireYear = 'Son kullanma yılı gereklidir';
    } else if (parseInt(card.expireYear) < new Date().getFullYear()) {
      newErrors.expireYear = 'Kart süresi dolmuş';
    }

    if (!card.cvc) {
      newErrors.cvc = 'CVC gereklidir';
    } else if (card.cvc.length < 3 || card.cvc.length > 4) {
      newErrors.cvc = 'Geçersiz CVC';
    }

    return newErrors;
  };

  const validateBuyer = (buyer: any): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!buyer.name.trim()) newErrors.name = 'Ad gereklidir';
    if (!buyer.surname.trim()) newErrors.surname = 'Soyad gereklidir';
    if (!buyer.email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(buyer.email)) {
      newErrors.email = 'Geçersiz e-posta formatı';
    }
    if (!buyer.gsmNumber.trim()) newErrors.gsmNumber = 'Telefon gereklidir';
    if (!buyer.address.trim()) newErrors.address = 'Adres gereklidir';
    if (!buyer.city.trim()) newErrors.city = 'Şehir gereklidir';
    if (!buyer.zipCode.trim()) newErrors.zipCode = 'Posta kodu gereklidir';

    return newErrors;
  };

  const handleCardNext = (e: React.FormEvent) => {
    e.preventDefault();

    const cardErrors = validateCard(cardData);
    setErrors(cardErrors);

    if (Object.keys(cardErrors).length === 0) {
      setCurrentStep('billing');
    }
  };

  const handleDiscountApplied = (discount: {
    code: string;
    discountAmount: number;
    finalAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED';
  }) => {
    setAppliedDiscount(discount);
  };

  const handleDiscountRemoved = () => {
    setAppliedDiscount(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const buyerErrors = validateBuyer(buyerData);
    setErrors(buyerErrors);

    if (Object.keys(buyerErrors).length === 0) {
      const trialData: TrialSubscriptionRequest = {
        planId: selectedPlan.id,
        card: cardData,
        buyer: buyerData,
        discountCode: appliedDiscount?.code
      };

      try {
        await createTrialSubscription(trialData);
        onSubmit(trialData);
      } catch (error) {
        console.error('Trial subscription error:', error);
        setErrors({ submit: 'Trial subscription failed. Please try again.' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 'billing') {
      setCurrentStep('card');
    } else {
      onBack();
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const isTrialPlan = selectedPlan.features.trialDays > 0;
  const trialDays = selectedPlan.features.trialDays;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isTrialPlan ? 'Start Free Trial' : 'Complete Payment'}
              </h2>
              <p className="text-blue-100 text-sm">
                {selectedPlan.displayName}
              </p>
            </div>
            <div className="text-right">
              {isTrialPlan ? (
                <div className="text-white">
                  <div className="text-2xl font-bold">Free for {trialDays} days</div>
                  <div className="text-blue-100 text-sm">Then {selectedPlan.price} {selectedPlan.currency}/month</div>
                </div>
              ) : (
                <div className="text-white">
                  <div className="text-2xl font-bold">{selectedPlan.price} {selectedPlan.currency}</div>
                  <div className="text-blue-100 text-sm">per {selectedPlan.billingInterval.toLowerCase()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trial Notice */}
        {isTrialPlan && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Your card will be verified but not charged during the trial period.</strong>
                  After {trialDays} days, you'll be automatically charged {selectedPlan.price} {selectedPlan.currency} per month.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Steps */}
        <div className="p-6">
          {currentStep === 'card' && (
            <form onSubmit={handleCardNext} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardData.cardHolderName}
                      onChange={(e) => setCardData({ ...cardData, cardHolderName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                    {errors.cardHolderName && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardHolderName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Month
                      </label>
                      <select
                        value={cardData.expireMonth}
                        onChange={(e) => setCardData({ ...cardData, expireMonth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      {errors.expireMonth && (
                        <p className="mt-1 text-sm text-red-600">{errors.expireMonth}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <select
                        value={cardData.expireYear}
                        onChange={(e) => setCardData({ ...cardData, expireYear: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">YYYY</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                      {errors.expireYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.expireYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cvc && (
                        <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {currentStep === 'billing' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={buyerData.name}
                      onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={buyerData.surname}
                      onChange={(e) => setBuyerData({ ...buyerData, surname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.surname && (
                      <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={buyerData.email}
                      onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={buyerData.gsmNumber}
                      onChange={(e) => setBuyerData({ ...buyerData, gsmNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+905350000000"
                    />
                    {errors.gsmNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.gsmNumber}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={buyerData.address}
                      onChange={(e) => setBuyerData({ ...buyerData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={buyerData.city}
                      onChange={(e) => setBuyerData({ ...buyerData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={buyerData.zipCode}
                      onChange={(e) => setBuyerData({ ...buyerData, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Discount Code Input */}
              <DiscountCodeInput
                planId={selectedPlan.id}
                originalAmount={selectedPlan.price}
                onDiscountApplied={handleDiscountApplied}
                onDiscountRemoved={handleDiscountRemoved}
                appliedDiscount={appliedDiscount}
                className="mt-6"
              />

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || trialLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || trialLoading ? 'Processing...' : (isTrialPlan ? 'Start Free Trial' : 'Complete Payment')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

