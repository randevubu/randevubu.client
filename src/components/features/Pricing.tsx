'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PaymentsService } from '../../lib/services/payments';
import { SubscriptionPlan } from '../../types/subscription';

export default function Pricing() {
  const router = useRouter();
  const t = useTranslations('subscription');
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

  const handlePlanSelect = (planId: string) => {
    router.push(`/subscription?plan=${planId}`);
  };

  // Helper function to get translated plan name
  const getTranslatedPlanName = (planName: string) => {
    try {
      return t(`plans.${planName}.name`);
    } catch {
      return planName; // Fallback to original name if translation not found
    }
  };

  // Helper function to get translated plan description
  const getTranslatedPlanDescription = (planName: string) => {
    try {
      return t(`plans.${planName}.description`);
    } catch {
      return ''; // Fallback to empty string if translation not found
    }
  };

  // Helper function to get translated feature name
  const getTranslatedFeatureName = (feature: string) => {
    try {
      return t(`features.${feature}`);
    } catch {
      return feature.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-[var(--theme-background)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-[var(--theme-background)] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded hover:bg-[var(--theme-primaryHover)]"
            >
              {t('ui.tryAgain')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const sortedPlans = Array.isArray(plans) 
    ? plans
        .filter(plan => plan.billingInterval === 'monthly') // Show only monthly plans
        .sort((a, b) => a.sortOrder - b.sortOrder) 
    : [];

  const getPlanColor = (index: number) => {
    const colors = ['indigo', 'purple', 'emerald'];
    return colors[index % colors.length];
  };

  const colorClasses = {
    indigo: {
      gradient: "from-[var(--theme-primary)] to-[var(--theme-primaryHover)]",
      ring: "ring-[var(--theme-primary)]",
      text: "text-[var(--theme-primary)]",
      bg: "bg-[var(--theme-primary)]/10",
      border: "border-[var(--theme-primary)]/30"
    },
    purple: {
      gradient: "from-[var(--theme-accent)] to-[var(--theme-accentHover)]", 
      ring: "ring-[var(--theme-accent)]",
      text: "text-[var(--theme-accent)]",
      bg: "bg-[var(--theme-accent)]/10",
      border: "border-[var(--theme-accent)]/30"
    },
    emerald: {
      gradient: "from-[var(--theme-success)] to-[var(--theme-success)]",
      ring: "ring-[var(--theme-success)]", 
      text: "text-[var(--theme-success)]",
      bg: "bg-[var(--theme-success)]/10",
      border: "border-[var(--theme-success)]/30"
    }
  } as const;

  return (
    <section className="py-16 bg-[var(--theme-background)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-[var(--theme-primary)]/10 rounded-full text-[var(--theme-primary)] font-medium text-xs mb-4 transition-colors duration-300">
            💳 {t('ui.subscriptionPlans')}
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black text-[var(--theme-foreground)] mb-4 leading-tight transition-colors duration-300">
            {t('ui.choosePlan')}
          </h2>
          
          <p className="text-base lg:text-lg text-[var(--theme-foregroundSecondary)] max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            {t('ui.planDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {sortedPlans.map((plan, index) => {
            const planColor = getPlanColor(index);
            return (
              <div 
                key={plan.id}
                className={`relative bg-[var(--theme-card)] rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.isPopular 
                    ? `${colorClasses[planColor as keyof typeof colorClasses].border} ring-2 ${colorClasses[planColor as keyof typeof colorClasses].ring}` 
                    : 'border-[var(--theme-border)] hover:border-[var(--theme-borderSecondary)]'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`bg-gradient-to-r ${colorClasses[planColor as keyof typeof colorClasses].gradient} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                      ⭐ {t('ui.mostPopular')}
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-[var(--theme-cardForeground)] mb-2 transition-colors duration-300">
                      {getTranslatedPlanName(plan.name)}
                    </h3>
                    <p className="text-[var(--theme-foregroundSecondary)] mb-6 transition-colors duration-300">
                      {getTranslatedPlanDescription(plan.name) || plan.description || 'Perfect for your business needs'}
                    </p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-black text-[var(--theme-cardForeground)] transition-colors duration-300">
                          {plan.currency === 'TRY' ? '₺' : '$'}{plan.price.toLocaleString('tr-TR')}
                        </span>
                        <span className="text-xl text-[var(--theme-foregroundMuted)] ml-2 transition-colors duration-300">
                          /{plan.billingInterval === 'monthly' ? t('ui.monthly') : t('ui.yearly')}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
                        plan.isPopular
                          ? `bg-gradient-to-r ${colorClasses[planColor as keyof typeof colorClasses].gradient} text-white hover:shadow-2xl`
                          : `bg-[var(--theme-foreground)] text-[var(--theme-background)] hover:bg-[var(--theme-foregroundSecondary)]`
                      }`}
                    >
                      {plan.isPopular ? t('ui.startNow') : t('ui.selectPlan')}
                    </button>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colorClasses[planColor as keyof typeof colorClasses].gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[var(--theme-cardForeground)] text-sm leading-relaxed transition-colors duration-300">
                        {t('ui.maxBusinesses')}: {plan.maxBusinesses === -1 ? t('ui.unlimited') : plan.maxBusinesses}
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colorClasses[planColor as keyof typeof colorClasses].gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[var(--theme-cardForeground)] text-sm leading-relaxed transition-colors duration-300">
                        {t('ui.maxStaff')}: {plan.maxStaffPerBusiness === -1 ? t('ui.unlimited') : plan.maxStaffPerBusiness}
                      </span>
                    </div>
                    
                    {plan.features && Array.isArray(plan.features) && plan.features.slice(0, 5).map((feature) => (
                      <div key={feature} className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colorClasses[planColor as keyof typeof colorClasses].gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-[var(--theme-cardForeground)] text-sm leading-relaxed transition-colors duration-300">
                          {getTranslatedFeatureName(feature)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[var(--theme-backgroundSecondary)] to-[var(--theme-backgroundTertiary)] rounded-3xl p-8 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4 transition-colors duration-300">
              {t('ui.allPlansBenefits')}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-[var(--theme-success)]/20 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5 text-[var(--theme-success)] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[var(--theme-foreground)] font-medium transition-colors duration-300">{t('ui.freeTrial')}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-[var(--theme-info)]/20 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5 text-[var(--theme-info)] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[var(--theme-foreground)] font-medium transition-colors duration-300">{t('ui.cancelAnytime')}</span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-[var(--theme-accent)]/20 rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg className="w-5 h-5 text-[var(--theme-accent)] transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <span className="text-[var(--theme-foreground)] font-medium transition-colors duration-300">{t('ui.turkishSupport')}</span>
              </div>
            </div>

            <p className="text-sm text-[var(--theme-foregroundMuted)] mb-6 transition-colors duration-300">
              {t('ui.pricingNote')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-8 py-3 rounded-2xl font-semibold hover:bg-[var(--theme-primaryHover)] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                {t('ui.haveQuestions')}
              </button>
              <button className="border-2 border-[var(--theme-border)] text-[var(--theme-foreground)] px-8 py-3 rounded-2xl font-semibold hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-all duration-300">
                {t('ui.comparisonTable')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}