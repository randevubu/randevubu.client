'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { businessService } from '../../../lib/services/business';
import { useUsageTracking, useUsageCharts, useUsageLimits } from '../../../lib/hooks/useUsageTracking';
import { Business } from '../../../types/business';
import { canViewBusinessStats } from '../../../lib/utils/permissions';
import { handleApiError } from '../../../lib/utils/toast';

// Mobile-first responsive components
const UsageProgressBar: React.FC<{
  current: number;
  limit: number;
  label: string;
  unit?: string;
  icon?: React.ReactNode;
  colorScheme?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}> = ({ current, limit, label, unit = '', icon, colorScheme = 'blue' }) => {
  // Handle division by zero - if limit is 0, show 0% instead of NaN%
  const percentage = limit === 0 ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-800',
      progress: isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500',
      icon: 'bg-blue-500'
    },
    green: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-800',
      progress: isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-green-500',
      icon: 'bg-green-500'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-800',
      progress: isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-purple-500',
      icon: 'bg-purple-500'
    },
    amber: {
      bg: 'from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-800',
      progress: isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-amber-500',
      icon: 'bg-amber-500'
    },
    red: {
      bg: 'from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-800',
      progress: 'bg-red-500',
      icon: 'bg-red-500'
    }
  };

  const colors = colorClasses[colorScheme];

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-3xl p-4 sm:p-6 border ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.icon} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {icon}
            </div>
          )}
          <div>
            <h3 className={`font-bold ${colors.text} text-base sm:text-lg`}>{label}</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {current.toLocaleString()}{unit} / {limit.toLocaleString()}{unit}
            </p>
          </div>
        </div>
        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
          isAtLimit ? 'bg-red-100 text-red-800' : 
          isNearLimit ? 'bg-amber-100 text-amber-800' : 
          'bg-green-100 text-green-800'
        }`}>
          {isNaN(percentage) ? '0' : percentage.toFixed(0)}%
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
          <span>Kullanım</span>
          <span className={`font-semibold ${
            (limit - current) <= 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {limit === 0 ? '0' : (limit - current).toLocaleString()}{unit} kaldı
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div 
            className={`${colors.progress} h-2 sm:h-3 rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {isAtLimit && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-xs text-red-700 font-medium">⚠️ Limit doldu</p>
        </div>
      )}
      {isNearLimit && !isAtLimit && (
        <div className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 font-medium">⚡ Limite yaklaşıyor</p>
        </div>
      )}
    </div>
  );
};

const UsageAlert: React.FC<{
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
}> = ({ type, title, message }) => {
  const alertClasses = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: '⚠️',
      titleColor: 'text-amber-800',
      textColor: 'text-amber-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '🚨',
      titleColor: 'text-red-800',
      textColor: 'text-red-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'ℹ️',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: '✅',
      titleColor: 'text-green-800',
      textColor: 'text-green-700'
    }
  };

  const classes = alertClasses[type];

  return (
    <div className={`${classes.bg} border ${classes.border} rounded-2xl p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        <div className="text-lg sm:text-xl">{classes.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${classes.titleColor} text-sm sm:text-base mb-1`}>
            {title}
          </h4>
          <p className={`${classes.textColor} text-xs sm:text-sm leading-relaxed`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function UsagePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const { usageSummary, usageAlerts, isLoading, error, refreshUsage } = useUsageTracking(
    business?.id || ''
  );
  const { limitsCheck } = useUsageLimits(business?.id || '');

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    if (!canViewBusinessStats(user)) {
      router.push('/dashboard');
      return;
    }

    loadBusinessData();
  }, [user, isAuthenticated, authLoading, router]);

  const loadBusinessData = async () => {
    try {
      const businessResponse = await businessService.getMyBusiness();
      if (businessResponse.success && businessResponse.data?.businesses?.[0]) {
        setBusiness(businessResponse.data.businesses[0]);
      }
    } catch (error) {
      console.error('Data loading failed:', error);
      handleApiError(error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  if (isLoading || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Kullanım Bilgileri Yükleniyor</h3>
          <p className="text-sm text-gray-500">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshUsage}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold text-sm sm:text-base"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  if (!usageSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Kullanım Bilgileri Bulunamadı</h3>
          <p className="text-sm sm:text-base text-gray-600">Aktif bir aboneliğiniz bulunmuyor.</p>
        </div>
      </div>
    );
  }

  const { currentMonth, planLimits, remainingQuotas } = usageSummary || {};
  
  // Check if currentMonth is null (no data for current month yet)
  const hasCurrentMonthData = currentMonth !== null;
  
  // Safe access with fallback values - handle null currentMonth from API
  const safeCurrentMonth = currentMonth || {
    smssSent: 0,
    appointmentsCreated: 0,
    staffMembersActive: 0,
    customersAdded: 0,
    servicesActive: 0,
    storageUsedMB: 0,
    businessId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    apiCallsCount: 0,
    lastUpdatedAt: new Date().toISOString()
  };
  
  const safePlanLimits = planLimits || {
    smsQuota: 0,
    maxStaffPerBusiness: 0,
    maxAppointmentsPerDay: 0,
    maxCustomers: 0,
    maxServices: 0,
    storageGB: 0
  };
  
  // Safe access for usage alerts with fallback values and optional chaining
  const safeUsageAlerts = {
    smsQuotaAlert: {
      isNearLimit: usageAlerts?.smsQuotaAlert?.isNearLimit || false,
      isAtLimit: usageAlerts?.smsQuotaAlert?.isAtLimit || false,
      percentage: usageAlerts?.smsQuotaAlert?.percentage || 0,
      remaining: usageAlerts?.smsQuotaAlert?.remaining || 0
    },
    staffLimitAlert: {
      isNearLimit: usageAlerts?.staffLimitAlert?.isNearLimit || false,
      isAtLimit: usageAlerts?.staffLimitAlert?.isAtLimit || false,
      current: usageAlerts?.staffLimitAlert?.current || 0,
      limit: usageAlerts?.staffLimitAlert?.limit || 0
    },
    customerLimitAlert: {
      isNearLimit: usageAlerts?.customerLimitAlert?.isNearLimit || false,
      isAtLimit: usageAlerts?.customerLimitAlert?.isAtLimit || false,
      percentage: usageAlerts?.customerLimitAlert?.percentage || 0,
      current: usageAlerts?.customerLimitAlert?.current || 0,
      limit: usageAlerts?.customerLimitAlert?.limit || 0
    },
    storageLimitAlert: {
      isNearLimit: usageAlerts?.storageLimitAlert?.isNearLimit || false,
      isAtLimit: usageAlerts?.storageLimitAlert?.isAtLimit || false,
      percentage: usageAlerts?.storageLimitAlert?.percentage || 0,
      usedMB: usageAlerts?.storageLimitAlert?.usedMB || 0,
      limitMB: usageAlerts?.storageLimitAlert?.limitMB || 0
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
        
        {/* Mobile-first Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 sm:mb-6 shadow-lg">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2 sm:mb-4">
            Kullanım Durumu
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Plan limitlerinizi ve kalan kullanımlarınızı takip edin
          </p>
        </div>

        {/* Info message when no current month data */}
        {!hasCurrentMonthData && (
          <div className="mb-6 sm:mb-8">
            <UsageAlert
              type="info"
              title="Bu Ay Verisi Henüz Mevcut Değil"
              message="Bu ay için henüz kullanım verisi toplanmamış. Sistem otomatik olarak veri toplamaya başlayacak ve bu sayfada görüntülenecektir."
            />
          </div>
        )}

        {/* Usage Summary Cards - Mobile-first grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <UsageProgressBar
            current={safeCurrentMonth.smssSent}
            limit={safePlanLimits.smsQuota}
            label="SMS Kullanımı"
            unit=" SMS"
            colorScheme="blue"
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonth.staffMembersActive}
            limit={safePlanLimits.maxStaffPerBusiness}
            label="Personel Sayısı"
            unit=" kişi"
            colorScheme="green"
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonth.customersAdded}
            limit={safePlanLimits.maxCustomers}
            label="Müşteri Sayısı"
            unit=" müşteri"
            colorScheme="purple"
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonth.servicesActive}
            limit={safePlanLimits.maxServices}
            label="Hizmet Sayısı"
            unit=" hizmet"
            colorScheme="amber"
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonth.storageUsedMB}
            limit={safePlanLimits.storageGB * 1024}
            label="Depolama Alanı"
            unit=" MB"
            colorScheme="red"
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
          />

          {/* Daily Appointments - separate card */}
          <div className="sm:col-span-2 lg:col-span-1">
            <UsageProgressBar
              current={Math.floor(safeCurrentMonth.appointmentsCreated / 30)} // Daily average
              limit={safePlanLimits.maxAppointmentsPerDay}
              label="Günlük Randevu"
              unit=" randevu"
              colorScheme="green"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Alerts Section */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Uyarılar ve Öneriler</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {safeUsageAlerts.smsQuotaAlert.isNearLimit && (
                <UsageAlert
                  type="warning"
                  title="SMS Kotası Uyarısı"
                  message={`SMS kotanızın %${(safeUsageAlerts.smsQuotaAlert.percentage || 0).toFixed(1)}'ine ulaştınız. ${safeUsageAlerts.smsQuotaAlert.remaining || 0} SMS hakkınız kaldı.`}
                />
              )}

              {safeUsageAlerts.staffLimitAlert.isAtLimit && (
                <UsageAlert
                  type="error"
                  title="Personel Limiti Doldu"
                  message={`Personel limitinize ulaştınız (${safeUsageAlerts.staffLimitAlert.current || 0}/${safeUsageAlerts.staffLimitAlert.limit || 0}). Yeni personel eklemek için planınızı yükseltmeniz gerekiyor.`}
                />
              )}

              {safeUsageAlerts.customerLimitAlert.isNearLimit && (
                <UsageAlert
                  type="warning"
                  title="Müşteri Limiti Yaklaşıyor"
                  message={`Müşteri limitinizin %${(safeUsageAlerts.customerLimitAlert.percentage || 0).toFixed(1)}'ine ulaştınız. ${(safeUsageAlerts.customerLimitAlert.limit || 0) - (safeUsageAlerts.customerLimitAlert.current || 0)} müşteri daha ekleyebilirsiniz.`}
                />
              )}

              {safeUsageAlerts.storageLimitAlert.isNearLimit && (
                <UsageAlert
                  type="warning"
                  title="Depolama Alanı Doluyor"
                  message={`Depolama alanınızın %${(safeUsageAlerts.storageLimitAlert.percentage || 0).toFixed(1)}'ini kullandınız. ${formatStorage((safeUsageAlerts.storageLimitAlert.limitMB || 0) - (safeUsageAlerts.storageLimitAlert.usedMB || 0))} alan kaldı.`}
                />
              )}

              {/* Success message if everything is good */}
              {!safeUsageAlerts.smsQuotaAlert.isNearLimit && 
               !safeUsageAlerts.staffLimitAlert.isAtLimit && 
               !safeUsageAlerts.customerLimitAlert.isNearLimit && 
               !safeUsageAlerts.storageLimitAlert.isNearLimit && (
                <div className="lg:col-span-2">
                  <UsageAlert
                    type="success"
                    title="Kullanım Durumu Mükemmel"
                    message="Tüm limitler sağlıklı aralıkta. Plan limitlerinizi verimli kullanıyorsunuz ve büyüme için yeterli alanınız var."
                  />
                </div>
              )}
            </div>
          </div>

        {/* Quick Stats Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Bu Ay Özeti</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                {safeCurrentMonth.smssSent.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">SMS Gönderildi</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-2xl border border-green-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                {safeCurrentMonth.appointmentsCreated.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Randevu Oluştu</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-2xl border border-purple-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
                {safeCurrentMonth.customersAdded.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Yeni Müşteri</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-amber-600 mb-1">
                {formatStorage(safeCurrentMonth.storageUsedMB)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Depolama</div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile optimized */}
        <div className="text-center space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg text-sm sm:text-lg touch-manipulation"
          >
            Planı Güncelle
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium text-sm sm:text-lg touch-manipulation"
          >
            Dashboard'a Dön
          </button>
          <button
            onClick={refreshUsage}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-medium text-sm sm:text-lg touch-manipulation"
          >
            Yenile
          </button>
        </div>
      </div>
    </div>
  );
}