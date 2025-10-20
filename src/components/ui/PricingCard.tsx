'use client';

import { useTranslations } from 'next-intl';
import { Check, Star, Zap, Shield, Users, Building, Calendar, Clock, Mail, Phone, BarChart3, Settings, CreditCard, FileText, HelpCircle, CheckCircle, AlertTriangle, Ban, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Save, Loader2, Moon, Sun, XCircle, Tag, Bell, Plus, Edit, Trash2, RefreshCw, Home } from 'lucide-react';
import { SubscriptionPlan } from '../../types/subscription';
import { getTierDisplayName } from '../../lib/hooks/useSubscriptionPlans';

interface PricingCardProps {
  plan: SubscriptionPlan;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  onSelect?: (plan: SubscriptionPlan) => void;
  className?: string;
}

export default function PricingCard({ plan, tier, onSelect, className = '' }: PricingCardProps) {
  const t = useTranslations('pricing');

  // Check if this is the Pro plan
  const isProPlan = plan.id === 'pro_plan';

  // Translate plan descriptions to Turkish
  const getTranslatedDescription = (plan: SubscriptionPlan) => {
    if (isProPlan) {
      return plan.description; // Already in Turkish
    }
    
    // Translate common English descriptions to Turkish
    const descriptionMap: Record<string, string> = {
      'Perfect for small businesses in major cities': 'Büyük şehirlerdeki küçük işletmeler için mükemmel',
      'Advanced features for growing businesses in major cities': 'Büyük şehirlerde büyüyen işletmeler için gelişmiş özellikler',
      'Perfect for small businesses in regional centers': 'Bölgesel merkezlerdeki küçük işletmeler için mükemmel',
      'Advanced features for growing businesses in regional centers': 'Bölgesel merkezlerde büyüyen işletmeler için gelişmiş özellikler',
      'Perfect for small businesses in smaller cities': 'Küçük şehirlerdeki küçük işletmeler için mükemmel',
      'Advanced features for growing businesses in smaller cities': 'Küçük şehirlerde büyüyen işletmeler için gelişmiş özellikler'
    };
    
    return descriptionMap[plan.description] || plan.description;
  };

  // Translate plan names to Turkish
  const getTranslatedPlanName = (planName: string) => {
    const planNameMap: Record<string, string> = {
      'Basic Plan': 'Temel Plan',
      'Premium Plan': 'Premium Plan',
      'Pro Plan': 'Pro Plan'
    };
    
    return planNameMap[planName] || planName;
  };

  // Translate feature descriptions to Turkish
  const getTranslatedFeature = (feature: string) => {
    const featureMap: Record<string, string> = {
      'Online appointment booking system': 'Online randevu sistemi',
      'Up to 1 staff member': 'En fazla 1 personel',
      'Unlimited customers': 'Sınırsız müşteri',
      'Email & SMS notifications': 'E-posta ve SMS bildirimleri',
      'Email and SMS notifications': 'E-posta ve SMS bildirimleri',
      '1,000 SMS per month': 'Aylık 1.000 SMS',
      'Basic reporting & analytics': 'Temel raporlama ve analiz',
      'Advanced reporting and analytics': 'Gelişmiş raporlama ve analiz',
      'WhatsApp integration': 'WhatsApp entegrasyonu',
      'Google Calendar sync': 'Google Takvim senkronizasyonu',
      'Unlimited appointments': 'Sınırsız randevu',
      'Email support': 'E-posta desteği',
      'Mobile app access': 'Mobil uygulama erişimi',
      'Customer management': 'Müşteri yönetimi',
      'Service management': 'Hizmet yönetimi',
      'Basic customer segmentation': 'Temel müşteri segmentasyonu',
      'Appointment reminders': 'Randevu hatırlatmaları',
      'Business hours management': 'İş saatleri yönetimi',
      'All Basic features': 'Tüm Temel özellikler',
      'Up to 5 staff members': 'En fazla 5 personel',
      '1,500 SMS per month': 'Aylık 1.500 SMS',
      'Advanced reporting & analytics': 'Gelişmiş raporlama ve analiz',
      'Custom branding & themes': 'Özel markalama ve temalar',
      'Google Calendar & Outlook integration': 'Google Takvim ve Outlook entegrasyonu',
      'Priority email & phone support': 'Öncelikli e-posta ve telefon desteği',
      'API access': 'API erişimi',
      'Advanced customer segmentation': 'Gelişmiş müşteri segmentasyonu',
      'Automated marketing campaigns': 'Otomatik pazarlama kampanyaları',
      'Customer loyalty programs': 'Müşteri sadakat programları',
      'Advanced appointment scheduling': 'Gelişmiş randevu planlama',
      'Staff performance tracking': 'Personel performans takibi',
      'Revenue analytics': 'Gelir analizi',
      'Customer feedback system': 'Müşteri geri bildirim sistemi',
      'Advanced notification settings': 'Gelişmiş bildirim ayarları',
      'Custom business rules': 'Özel iş kuralları'
    };
    
    return featureMap[feature] || feature;
  };

  const getTierColor = (tierId: 'TIER_1' | 'TIER_2' | 'TIER_3') => {
    // Special styling for Pro plan
    if (isProPlan) {
      return {
        gradient: 'from-yellow-400 to-amber-500',
        ring: 'ring-yellow-400',
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'bg-gradient-to-r from-yellow-400 to-amber-500',
        cardBg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        cardBorder: 'border-yellow-300'
      };
    }

    switch (tierId) {
      case 'TIER_1':
        return {
          gradient: 'from-indigo-500 to-purple-600',
          ring: 'ring-indigo-500',
          text: 'text-indigo-600',
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          badge: 'bg-gradient-to-r from-indigo-500 to-purple-600',
          cardBg: 'bg-white',
          cardBorder: 'border-gray-200'
        };
      case 'TIER_2':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          ring: 'ring-emerald-500',
          text: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          cardBg: 'bg-white',
          cardBorder: 'border-gray-200'
        };
      case 'TIER_3':
        return {
          gradient: 'from-orange-500 to-amber-600',
          ring: 'ring-orange-500',
          text: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          badge: 'bg-gradient-to-r from-orange-500 to-amber-600',
          cardBg: 'bg-white',
          cardBorder: 'border-gray-200'
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          ring: 'ring-gray-500',
          text: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gradient-to-r from-gray-500 to-gray-600',
          cardBg: 'bg-white',
          cardBorder: 'border-gray-200'
        };
    }
  };

  const colors = getTierColor(tier);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(plan);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'TRY') {
      return `₺${price.toLocaleString('tr-TR')}`;
    }
    return `$${price.toLocaleString('en-US')}`;
  };

  const getFeatureIcon = (feature: string) => {
    // Map feature names to appropriate icons
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'staff': Users,
      'appointment': Calendar,
      'sms': Phone,
      'email': Mail,
      'report': BarChart3,
      'api': Settings,
      'branding': Zap,
      'support': HelpCircle,
      'location': Building,
      'integration': Settings,
      'analytics': BarChart3,
      'notification': Bell,
      'customer': Users,
      'service': Settings,
      'booking': Calendar,
      'management': Settings,
      'unlimited': Zap,
      'priority': Star,
      'advanced': Zap,
      'basic': Check,
      'custom': Settings,
      'multi': Building,
      'single': Home
    };

    const lowerFeature = feature.toLowerCase();
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (lowerFeature.includes(key)) {
        return Icon;
      }
    }
    return Check; // Default icon
  };

  return (
    <div
      className={`relative ${colors.cardBg} rounded-3xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        isProPlan
          ? `${colors.cardBorder} ring-2 ${colors.ring}`
          : plan.isPopular
            ? `${colors.border} ring-2 ${colors.ring}`
            : 'border-gray-200 hover:border-gray-300'
      } ${className}`}
    >
      {/* Popular Badge */}
      {plan.isPopular && !isProPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`${colors.badge} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1`}>
            <Star className="w-4 h-4" />
            <span>En Popüler</span>
          </div>
        </div>
      )}

      {/* Pro Plan Badge */}
      {isProPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`${colors.badge} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1`}>
            <Star className="w-4 h-4" />
            <span>Pro Plan</span>
          </div>
        </div>
      )}


      <div className="p-8">
        {/* Header */}
         <div className="text-center mb-8">
           <h3 className="text-2xl font-bold text-gray-900 mb-2">
             {getTranslatedPlanName(plan.displayName.replace(' - Tier 1', '').replace(' - Tier 2', '').replace(' - Tier 3', ''))}
           </h3>
          
          <p className="text-gray-600 mb-6">
            {getTranslatedDescription(plan)}
          </p>
          
           {/* Price */}
           <div className="mb-6">
             <div className="flex items-baseline justify-center">
               {isProPlan ? (
                 <div className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent leading-none pt-2 pb-2">
                   Özel
                 </div>
               ) : (
                 <>
                   <span className="text-5xl font-black text-gray-900">
                     {formatPrice(plan.price, plan.currency)}
                   </span>
                   <span className="text-xl text-gray-500 ml-2">
                     /{plan.billingInterval.toLowerCase() === 'monthly' ? 'ay' : 'yıl'}
                   </span>
                 </>
               )}
             </div>
           </div>

          {/* Select Button */}
          <button
            onClick={handleSelect}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl ${
              isProPlan
                ? `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-2xl`
                : plan.isPopular
                  ? `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-2xl`
                  : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isProPlan ? 'İletişime Geç' : plan.isPopular ? 'Hemen Başla' : 'Planı Seç'}
          </button>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {/* Staff Limit */}
          {plan.maxStaffPerBusiness > 0 && (
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                En fazla {plan.maxStaffPerBusiness} personel
              </span>
            </div>
          )}

          {/* SMS Quota */}
          {plan.features.smsQuota > 0 && (
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                Aylık {plan.features.smsQuota.toLocaleString('tr-TR')} SMS
              </span>
            </div>
          )}

          {/* Key Features */}
          {plan.features.apiAccess && (
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                API Erişimi
              </span>
            </div>
          )}

          {plan.features.customBranding && (
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                Özel Markalama
              </span>
            </div>
          )}

          {plan.features.multiLocation && (
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                Çoklu Lokasyon Desteği
              </span>
            </div>
          )}

          {plan.features.advancedReports && (
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                Gelişmiş Raporlar
              </span>
            </div>
          )}

          {plan.features.prioritySupport && (
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-700 text-sm leading-relaxed">
                Öncelikli Destek
              </span>
            </div>
          )}

          {/* Description Features */}
          {plan.features.description && Array.isArray(plan.features.description) && (
            <>
              {plan.features.description.slice(0, 5).map((feature, index) => {
                const Icon = getFeatureIcon(feature);
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                     <span className="text-gray-700 text-sm leading-relaxed">
                       {getTranslatedFeature(feature)}
                     </span>
                  </div>
                );
              })}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
