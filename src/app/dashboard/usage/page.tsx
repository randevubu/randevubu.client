'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardUser } from '../../../context/DashboardContext';
import {
  USAGE_ALERT_MESSAGES,
  USAGE_ALERT_TYPES,
  USAGE_COLOR_SCHEMES,
  USAGE_PAGE_TEXTS,
USAGE_PROGRESS_CONFIGS,
  USAGE_STATS_LABELS
} from '../../../lib/constants/usage';
import { useUsageData } from '../../../lib/hooks/useUsageData';

// Mobile-first responsive components
const UsageProgressBar: React.FC<{
  current: number;
  limit: number;
  label: string;
  unit?: string;
  icon?: React.ReactNode;
  colorScheme?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}> = ({ current, limit, label, unit = '', icon, colorScheme = 'blue' }) => {
  // Add null/undefined checks for current and limit
  const safeCurrent = current ?? 0;
  const safeLimit = limit ?? 0;
  
  // Handle infinite limits
  const isInfiniteLimit = !isFinite(safeLimit);
  
  // Handle division by zero - if limit is 0, show 0% instead of NaN%
  // For infinite limits, show 0% progress
  const percentage = isInfiniteLimit ? 0 : (safeLimit === 0 ? 0 : Math.min((safeCurrent / safeLimit) * 100, 100));
  const isNearLimit = isInfiniteLimit ? false : percentage >= 80;
  const isAtLimit = isInfiniteLimit ? false : percentage >= 100;

  const baseColors = USAGE_COLOR_SCHEMES[colorScheme];
  const colors = {
    ...baseColors,
    progress: isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : baseColors.progress
  };

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
              {safeCurrent.toLocaleString()}{unit} / {isInfiniteLimit ? '∞' : safeLimit.toLocaleString()}{unit}
            </p>
          </div>
        </div>
        <div className={`px-2 sm:px-3 py-1 rounded-full font-bold ${
          isInfiniteLimit ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
        } ${
          isAtLimit ? 'bg-red-100 text-red-800' : 
          isNearLimit ? 'bg-amber-100 text-amber-800' : 
          'bg-green-100 text-green-800'
        }`}>
          {isInfiniteLimit ? '∞' : `${isNaN(percentage) ? '0' : percentage.toFixed(0)}%`}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
          <span>Kullanım</span>
          <span className={`font-semibold ${
            isInfiniteLimit ? 'text-green-600' : (safeLimit - safeCurrent) <= 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {isInfiniteLimit ? '∞' : (safeLimit === 0 ? '0' : (safeLimit - safeCurrent).toLocaleString())}{unit} kaldı
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div 
            className={`${colors.progress} h-2 sm:h-3 rounded-full transition-all duration-700 ease-out`}
            style={{ width: isInfiniteLimit ? '0%' : `${Math.min(percentage, 100)}%` }}
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
  const classes = USAGE_ALERT_TYPES[type];

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

const SkeletonCard: React.FC = () => (
  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-4 sm:p-6 border border-gray-300 shadow-lg animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-2xl"></div>
        <div>
          <div className="h-5 w-24 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
        <div className="h-4 w-20 bg-gray-300 rounded"></div>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2 sm:h-3"></div>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-8">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6 lg:pt-8">
      {/* Header Skeleton */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-2xl mb-4 sm:mb-6 animate-pulse"></div>
        <div className="h-8 w-64 bg-gray-300 rounded mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 w-96 bg-gray-300 rounded mx-auto animate-pulse"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Stats Summary Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 animate-pulse">
        <div className="h-6 w-48 bg-gray-300 rounded mx-auto mb-4 sm:mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center p-3 sm:p-4 bg-gray-100 rounded-2xl border border-gray-200">
              <div className="h-8 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-300 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function UsagePage() {
  const router = useRouter();
  const user = useDashboardUser(); // DashboardGuard ensures user exists
  const { 
    usageSummary, 
    usageAlerts, 
    limitsCheck,
    currentMonth,
    planLimits,
    remainingQuotas,
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useUsageData({
    includeAlerts: true, // Only fetch alerts when needed
    includeLimits: false, // We can calculate limits from summary data
    includeCharts: false, // Don't fetch chart data unless needed
  });

  const formatCurrency = (amount: number, currency: string | undefined = 'TRY') => {
    if (!currency) {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount);
    }
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{USAGE_PAGE_TEXTS.errorTitle}</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error?.message || 'Bilinmeyen bir hata oluştu'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-semibold text-sm sm:text-base"
          >
            {USAGE_PAGE_TEXTS.retryButton}
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
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{USAGE_PAGE_TEXTS.noDataFoundTitle}</h3>
          <p className="text-sm sm:text-base text-gray-600">{USAGE_PAGE_TEXTS.noDataFoundMessage}</p>
        </div>
      </div>
    );
  }

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

  // Ensure all values are numbers, not undefined
  const safeCurrentMonthValues = {
    smssSent: Number(safeCurrentMonth.smssSent) || 0,
    appointmentsCreated: Number(safeCurrentMonth.appointmentsCreated) || 0,
    staffMembersActive: Number(safeCurrentMonth.staffMembersActive) || 0,
    customersAdded: Number(safeCurrentMonth.customersAdded) || 0,
    servicesActive: Number(safeCurrentMonth.servicesActive) || 0,
    storageUsedMB: Number(safeCurrentMonth.storageUsedMB) || 0,
    apiCallsCount: Number(safeCurrentMonth.apiCallsCount) || 0
  };

  const safePlanLimitsValues = {
    smsQuota: Number(safePlanLimits.smsQuota) || 0,
    maxStaffPerBusiness: Number(safePlanLimits.maxStaffPerBusiness) || 0,
    maxAppointmentsPerDay: Number.POSITIVE_INFINITY, // Infinite daily appointments
    maxCustomers: Number.POSITIVE_INFINITY, // Infinite customers
    maxServices: Number.POSITIVE_INFINITY, // Infinite services
    storageGB: Number(safePlanLimits.storageGB) || 0
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
            {USAGE_PAGE_TEXTS.title}
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            {USAGE_PAGE_TEXTS.subtitle}
          </p>
        </div>

        {/* Info message when no current month data */}
        {!hasCurrentMonthData && (
          <div className="mb-6 sm:mb-8">
            <UsageAlert
              type="info"
              title={USAGE_PAGE_TEXTS.noDataTitle}
              message={USAGE_PAGE_TEXTS.noDataMessage}
            />
          </div>
        )}

        {/* Usage Summary Cards - Mobile-first grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <UsageProgressBar
            current={safeCurrentMonthValues.smssSent}
            limit={safePlanLimitsValues.smsQuota}
            label={USAGE_PROGRESS_CONFIGS.sms.label}
            unit={USAGE_PROGRESS_CONFIGS.sms.unit}
            colorScheme={USAGE_PROGRESS_CONFIGS.sms.colorScheme}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={USAGE_PROGRESS_CONFIGS.sms.iconPath} />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonthValues.staffMembersActive}
            limit={safePlanLimitsValues.maxStaffPerBusiness}
            label={USAGE_PROGRESS_CONFIGS.staff.label}
            unit={USAGE_PROGRESS_CONFIGS.staff.unit}
            colorScheme={USAGE_PROGRESS_CONFIGS.staff.colorScheme}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={USAGE_PROGRESS_CONFIGS.staff.iconPath} />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonthValues.customersAdded}
            limit={safePlanLimitsValues.maxCustomers}
            label={USAGE_PROGRESS_CONFIGS.customers.label}
            unit={USAGE_PROGRESS_CONFIGS.customers.unit}
            colorScheme={USAGE_PROGRESS_CONFIGS.customers.colorScheme}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={USAGE_PROGRESS_CONFIGS.customers.iconPath} />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonthValues.servicesActive}
            limit={safePlanLimitsValues.maxServices}
            label={USAGE_PROGRESS_CONFIGS.services.label}
            unit={USAGE_PROGRESS_CONFIGS.services.unit}
            colorScheme={USAGE_PROGRESS_CONFIGS.services.colorScheme}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={USAGE_PROGRESS_CONFIGS.services.iconPath} />
              </svg>
            }
          />

          <UsageProgressBar
            current={safeCurrentMonthValues.storageUsedMB}
            limit={safePlanLimitsValues.storageGB * 1024}
            label={USAGE_PROGRESS_CONFIGS.storage.label}
            unit={USAGE_PROGRESS_CONFIGS.storage.unit}
            colorScheme={USAGE_PROGRESS_CONFIGS.storage.colorScheme}
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={USAGE_PROGRESS_CONFIGS.storage.iconPath} />
              </svg>
            }
          />

          {/* Daily Appointments - separate card */}
          <div className="sm:col-span-2 lg:col-span-1">
            <UsageProgressBar
              current={Math.floor(safeCurrentMonthValues.appointmentsCreated / 30)} // Daily average
              limit={safePlanLimitsValues.maxAppointmentsPerDay}
              label={USAGE_PROGRESS_CONFIGS.appointments.label}
              unit={USAGE_PROGRESS_CONFIGS.appointments.unit}
              colorScheme={USAGE_PROGRESS_CONFIGS.appointments.colorScheme}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={USAGE_PROGRESS_CONFIGS.appointments.iconPath} />
                </svg>
              }
            />
          </div>
        </div>

        {/* Alerts Section */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{USAGE_PAGE_TEXTS.alertsTitle}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {safeUsageAlerts.smsQuotaAlert.isNearLimit && (
                <UsageAlert
                  type="warning"
                  title="SMS Kotası Uyarısı"
                  message={USAGE_ALERT_MESSAGES.smsQuotaWarning(
                    safeUsageAlerts.smsQuotaAlert.percentage || 0,
                    safeUsageAlerts.smsQuotaAlert.remaining || 0
                  )}
                />
              )}

              {safeUsageAlerts.staffLimitAlert.isAtLimit && (
                <UsageAlert
                  type="error"
                  title="Personel Limiti Doldu"
                  message={USAGE_ALERT_MESSAGES.staffLimitReached(
                    safeUsageAlerts.staffLimitAlert.current || 0,
                    safeUsageAlerts.staffLimitAlert.limit || 0
                  )}
                />
              )}

              {safeUsageAlerts.customerLimitAlert.isNearLimit && (
                <UsageAlert
                  type="warning"
                  title="Müşteri Limiti Yaklaşıyor"
                  message={USAGE_ALERT_MESSAGES.customerLimitWarning(
                    safeUsageAlerts.customerLimitAlert.percentage || 0,
                    (safeUsageAlerts.customerLimitAlert.limit || 0) - (safeUsageAlerts.customerLimitAlert.current || 0)
                  )}
                />
              )}

              {safeUsageAlerts.storageLimitAlert.isNearLimit && (
                <UsageAlert
                  type="warning"
                  title="Depolama Alanı Doluyor"
                  message={USAGE_ALERT_MESSAGES.storageLimitWarning(
                    safeUsageAlerts.storageLimitAlert.percentage || 0,
                    formatStorage((safeUsageAlerts.storageLimitAlert.limitMB || 0) - (safeUsageAlerts.storageLimitAlert.usedMB || 0))
                  )}
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
                    message={USAGE_ALERT_MESSAGES.allGood}
                  />
                </div>
              )}
            </div>
          </div>

        {/* Quick Stats Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">{USAGE_PAGE_TEXTS.summaryTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">
                {safeCurrentMonthValues.smssSent.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{USAGE_STATS_LABELS.smsSent}</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-2xl border border-green-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">
                {safeCurrentMonthValues.appointmentsCreated.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{USAGE_STATS_LABELS.appointmentsCreated}</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-2xl border border-purple-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
                {safeCurrentMonthValues.customersAdded.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{USAGE_STATS_LABELS.newCustomers}</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-amber-600 mb-1">
                {formatStorage(safeCurrentMonthValues.storageUsedMB)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">{USAGE_STATS_LABELS.storage}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Mobile optimized */}
        <div className="text-center space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg text-sm sm:text-lg touch-manipulation"
          >
            {USAGE_PAGE_TEXTS.updatePlanButton}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium text-sm sm:text-lg touch-manipulation"
          >
            {USAGE_PAGE_TEXTS.backToDashboard}
          </button>
          <button
            onClick={() => refetch()}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-medium text-sm sm:text-lg touch-manipulation"
          >
            {USAGE_PAGE_TEXTS.refreshButton}
          </button>
        </div>
      </div>
    </div>
  );
}