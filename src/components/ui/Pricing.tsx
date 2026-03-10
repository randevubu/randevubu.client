'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Info, Phone, Check, X, Star, Heart, Zap, Shield, Users, Building, Calendar, Clock, User, Mail, MapPin, Settings, BarChart3, Home, CreditCard, FileText, HelpCircle, CheckCircle, AlertTriangle, Ban, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Save, Loader2, Moon, Sun, XCircle, Tag, Bell, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useSubscriptionPlansWithAutoDetection, getTierDisplayName } from '../../lib/hooks/useSubscriptionPlans';
import { SubscriptionPlan } from '../../types/subscription';
import PricingCard from './PricingCard';

interface PricingProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void;
  city?: string; // Optional city prop for explicit override
}

export default function Pricing({ onPlanSelect, city: cityProp }: PricingProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('pricing');

  // Check for city in URL params (for development/testing) or prop, otherwise use frontend auto-detection
  // Example: /pricing?city=Antalya or /?city=Antalya
  const cityFromUrl = searchParams?.get('city') || undefined;
  const explicitCity = cityProp || cityFromUrl;

  // Use frontend auto-detection - detects city via IP geolocation and sends as parameter
  // If city is explicitly provided (via prop or URL), uses it; otherwise detects from IP
  const { plans, detectedCity, tier, location, isLoading, isError, error } = useSubscriptionPlansWithAutoDetection(explicitCity);

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    if (onPlanSelect) {
      onPlanSelect(plan);
    } else {
      router.push(`/subscription?plan=${plan.id}`);
    }
  };

  // Create Pro plan data (fallback when not returned from API)
  const proPlan: SubscriptionPlan = {
    id: 'plan_pro',
    name: 'pro',
    displayName: 'Pro Plan',
    description: 'Özel ihtiyaçlarınız için özelleştirilmiş çözüm',
    price: 2999,
    currency: 'TRY',
    billingInterval: 'monthly',
    maxBusinesses: 1,
    maxStaffPerBusiness: 999,
    maxAppointmentsPerDay: 0,
    features: {
      trialDays: 0,
      appointmentBooking: true,
      staffManagement: true,
      basicReports: true,
      emailNotifications: true,
      smsNotifications: true,
      customBranding: true,
      advancedReports: true,
      apiAccess: true,
      multiLocation: true,
      prioritySupport: true,
      integrations: ['whatsapp', 'calendar', 'google', 'outlook', 'analytics', 'custom'],
      maxServices: 0,
      maxCustomers: 0,
      smsQuota: 0,
      pricingTier: tier, // Pro uses tier for display; backend uses 'PRO'
      description: [
        'Unlimited staff',
        'Unlimited SMS',
        'Unlimited customers',
        'Email & SMS notifications',
        'Mobile app access',
        'Advanced reports',
        'WhatsApp integration',
        'Google Calendar & Outlook integration',
        'Unlimited appointments',
        'Customer management',
        'Service management',
        'Advanced customer segmentation',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Priority support',
        'Custom reporting',
        'Custom branding',
        'Multi-location support'
      ]
    },
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="ml-3 text-gray-600">
              Planlar yükleniyor...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">
              {error?.message || 'Abonelik planları yüklenemedi'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Filter and sort plans, then add Pro plan
  // Handle both uppercase (MONTHLY) and lowercase (monthly) from API
  const sortedPlans = [
    ...plans
      .filter(plan => plan.billingInterval?.toLowerCase() === 'monthly')
      .sort((a, b) => a.sortOrder - b.sortOrder),
    proPlan
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 font-medium text-xs mb-4">
            💳 Abonelik Planları
          </div>

          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4 leading-tight">
            İşiniz İçin Doğru Planı Seçin
          </h2>

          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            İşinizin ihtiyaçlarına uygun planı seçin. Fiyatlandırma şehrinize göre otomatik olarak belirlenir.
          </p>
        </div>

        {/* Location Info */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {detectedCity} için fiyatlandırma
              {location?.detected && (
                <span className="ml-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  📍 {location.source === 'ip_geolocation' ? 'Otomatik' : 'Manuel'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {sortedPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              tier={tier}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>

        {/* Common Footer for all plans */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Tüm planlar 7/24 destek ve düzenli güncellemeler içerir
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Tüm Planlar Dahil
            </h3>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-900 font-medium">Ücretsiz Deneme</span>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-900 font-medium">İstediğiniz Zaman İptal</span>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-900 font-medium">Türkçe Destek</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Tüm planlar 7/24 destek, düzenli güncellemeler ve güvenli veri işleme içerir.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Sorularınız mı Var?
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-2xl font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all">
                Karşılaştırma Tablosu
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}