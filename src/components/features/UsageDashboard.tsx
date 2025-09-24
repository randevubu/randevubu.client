'use client';

import React from 'react';
import { useUsageTracking } from '@/lib/hooks/useUsageTracking';

interface UsageDashboardProps {
  businessId: string;
  compact?: boolean;
}

interface UsageBarProps {
  label: string;
  current: number;
  limit: number;
  isNearLimit?: boolean;
  isAtLimit?: boolean;
  icon?: string;
}

function UsageBar({
  label,
  current,
  limit,
  isNearLimit = false,
  isAtLimit = false,
  icon = '📊'
}: UsageBarProps) {
  // Handle infinite limits
  const isInfiniteLimit = !isFinite(limit) || limit === 0;
  const percentage = isInfiniteLimit ? 0 : Math.min((current / limit) * 100, 100);

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-yellow-500'
    : 'bg-green-500';

  const textColor = isAtLimit
    ? 'text-red-600'
    : isNearLimit
    ? 'text-yellow-600'
    : 'text-green-600';

  return (
    <div className="usage-bar mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-lg mr-2">{icon}</span>
          <span className="font-medium text-[var(--theme-foreground)]">{label}</span>
        </div>
        <span className="text-sm text-[var(--theme-foregroundSecondary)]">
          {current.toLocaleString()} / {isInfiniteLimit ? '∞' : limit.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-[var(--theme-border)] rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${isInfiniteLimit ? 0 : Math.min(percentage, 100)}%` }}
        />
      </div>
      {isAtLimit && (
        <div className="text-red-500 text-xs">⚠️ Limit reached!</div>
      )}
      {isNearLimit && !isAtLimit && (
        <div className="text-yellow-600 text-xs">⚡ Approaching limit</div>
      )}
    </div>
  );
}

export default function UsageDashboard({ businessId, compact = false }: UsageDashboardProps) {
  const { usageSummary, usageAlerts, isLoading, error } = useUsageTracking(businessId);

  if (isLoading) {
    return (
      <div className="usage-dashboard p-4 bg-[var(--theme-card)] rounded-lg border border-[var(--theme-border)]">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
          <span className="ml-2 text-[var(--theme-foregroundSecondary)]">Loading usage data...</span>
        </div>
      </div>
    );
  }

  if (error || !usageSummary) {
    return (
      <div className="usage-dashboard p-4 bg-[var(--theme-card)] rounded-lg border border-[var(--theme-border)]">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-[var(--theme-foregroundSecondary)] text-sm">
            {error || 'Unable to load usage data'}
          </p>
        </div>
      </div>
    );
  }

  const { currentMonth, planLimits } = usageSummary;

  // Safe access with fallback values
  const safeCurrentMonth = currentMonth || {
    smssSent: 0,
    staffMembersActive: 0,
    servicesActive: 0,
    customersAdded: 0
  };

  const safePlanLimits = planLimits || {
    smsQuota: 0,
    maxStaffPerBusiness: 0,
    maxServices: 0,
    maxCustomers: 0
  };

  const usageItems = [
    {
      label: 'SMS',
      current: safeCurrentMonth.smssSent || 0,
      limit: safePlanLimits.smsQuota || 0,
      isNearLimit: usageAlerts?.smsQuotaAlert?.isNearLimit || false,
      isAtLimit: usageAlerts?.smsQuotaAlert?.isAtLimit || false,
      icon: '📱'
    },
    {
      label: 'Staff Members',
      current: safeCurrentMonth.staffMembersActive || 0,
      limit: safePlanLimits.maxStaffPerBusiness || 0,
      isNearLimit: usageAlerts?.staffLimitAlert?.isNearLimit || false,
      isAtLimit: usageAlerts?.staffLimitAlert?.isAtLimit || false,
      icon: '👥'
    },
    {
      label: 'Services',
      current: safeCurrentMonth.servicesActive || 0,
      limit: safePlanLimits.maxServices || Number.POSITIVE_INFINITY,
      isNearLimit: false,
      isAtLimit: false,
      icon: '⚙️'
    },
    {
      label: 'Customers',
      current: safeCurrentMonth.customersAdded || 0,
      limit: safePlanLimits.maxCustomers || Number.POSITIVE_INFINITY,
      isNearLimit: usageAlerts?.customerLimitAlert?.isNearLimit || false,
      isAtLimit: usageAlerts?.customerLimitAlert?.isAtLimit || false,
      icon: '👤'
    }
  ];

  const displayItems = compact ? usageItems.slice(0, 2) : usageItems;

  return (
    <div className="usage-dashboard p-4 bg-[var(--theme-card)] rounded-lg border border-[var(--theme-border)] transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">
          {compact ? 'Usage Overview' : 'Usage Summary'}
        </h3>
        {!compact && (
          <button
            onClick={() => window.location.href = '/dashboard/usage'}
            className="text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] transition-colors"
          >
            View Details →
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayItems.map((item) => (
          <UsageBar
            key={item.label}
            label={item.label}
            current={item.current}
            limit={item.limit}
            isNearLimit={item.isNearLimit}
            isAtLimit={item.isAtLimit}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Alert Summary */}
      {usageAlerts && (
        <div className="mt-4 pt-4 border-t border-[var(--theme-border)]">
          {(usageAlerts.smsQuotaAlert?.isAtLimit ||
            usageAlerts.staffLimitAlert?.isAtLimit ||
            usageAlerts.customerLimitAlert?.isAtLimit) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">🚨</span>
                <span className="text-red-700 text-sm font-medium">
                  One or more limits have been reached
                </span>
              </div>
            </div>
          )}

          {(usageAlerts.smsQuotaAlert?.isNearLimit ||
            usageAlerts.staffLimitAlert?.isNearLimit ||
            usageAlerts.customerLimitAlert?.isNearLimit) &&
           !(usageAlerts.smsQuotaAlert?.isAtLimit ||
             usageAlerts.staffLimitAlert?.isAtLimit ||
             usageAlerts.customerLimitAlert?.isAtLimit) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2">⚠️</span>
                <span className="text-yellow-700 text-sm font-medium">
                  Approaching usage limits
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {compact && (
        <div className="mt-4 text-center">
          <button
            onClick={() => window.location.href = '/dashboard/usage'}
            className="text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] transition-colors"
          >
            View Full Usage Report →
          </button>
        </div>
      )}
    </div>
  );
}