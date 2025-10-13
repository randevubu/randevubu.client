/**
 * Customer Policy Status Component
 *
 * Displays a customer's current cancellation and no-show policy status.
 * Shows violations, ban status, grace period, and warning indicators.
 */

'use client';

import React from 'react';
import { usePolicyStatus } from '../../lib/hooks/usePolicyStatus';
import {
  getMaxMonthlyCancellationsDisplayValue,
  getMaxMonthlyNoShowsDisplayValue
} from '../../types/cancellationPolicies';

interface CustomerPolicyStatusProps {
  customerId: string;
  compact?: boolean;
  showRefreshButton?: boolean;
  className?: string;
}

export const CustomerPolicyStatus: React.FC<CustomerPolicyStatusProps> = ({
  customerId,
  compact = false,
  showRefreshButton = false,
  className = ''
}) => {
  const { status, isLoading, error, refetch, statusIndicator, isAtRisk } = usePolicyStatus(customerId);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-[var(--theme-backgroundSecondary)] rounded-lg p-4 border border-[var(--theme-border)] ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-[var(--theme-foregroundSecondary)]">Politika durumu yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !status) {
    return (
      <div className={`bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[var(--theme-error)]">⚠️</span>
            <span className="text-sm text-[var(--theme-error)]">
              {error || 'Politika durumu yüklenemedi'}
            </span>
          </div>
          {showRefreshButton && (
            <button
              onClick={refetch}
              className="text-xs px-3 py-1 bg-[var(--theme-background)] text-[var(--theme-foreground)] border border-[var(--theme-border)] rounded hover:bg-[var(--theme-backgroundSecondary)] transition-colors"
            >
              Tekrar Dene
            </button>
          )}
        </div>
      </div>
    );
  }

  // Compact view (for lists/tables)
  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <span className="text-sm">{statusIndicator.icon}</span>
        <span
          className={`text-xs font-medium ${
            statusIndicator.color === 'red'
              ? 'text-[var(--theme-error)]'
              : statusIndicator.color === 'yellow'
              ? 'text-[var(--theme-warning)]'
              : statusIndicator.color === 'blue'
              ? 'text-[var(--theme-info)]'
              : 'text-[var(--theme-success)]'
          }`}
        >
          {statusIndicator.text}
        </span>
      </div>
    );
  }

  // Full detailed view
  return (
    <div className={`bg-[var(--theme-backgroundSecondary)] rounded-lg border border-[var(--theme-border)] ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--theme-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                statusIndicator.color === 'red'
                  ? 'bg-[var(--theme-error)]/10'
                  : statusIndicator.color === 'yellow'
                  ? 'bg-[var(--theme-warning)]/10'
                  : statusIndicator.color === 'blue'
                  ? 'bg-[var(--theme-info)]/10'
                  : 'bg-[var(--theme-success)]/10'
              }`}
            >
              <span className="text-xl">{statusIndicator.icon}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Politika Durumu</h3>
              <p
                className={`text-xs font-medium ${
                  statusIndicator.color === 'red'
                    ? 'text-[var(--theme-error)]'
                    : statusIndicator.color === 'yellow'
                    ? 'text-[var(--theme-warning)]'
                    : statusIndicator.color === 'blue'
                    ? 'text-[var(--theme-info)]'
                    : 'text-[var(--theme-success)]'
                }`}
              >
                {statusIndicator.text}
              </p>
            </div>
          </div>
          {showRefreshButton && (
            <button
              onClick={refetch}
              className="text-xs px-3 py-1.5 bg-[var(--theme-background)] text-[var(--theme-foreground)] border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-backgroundSecondary)] transition-colors"
            >
              Yenile
            </button>
          )}
        </div>
      </div>

      {/* Status Content */}
      <div className="p-4 space-y-4">
        {/* Banned Status */}
        {status.isBanned && (
          <div className="p-3 bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-[var(--theme-error)] text-lg">🚫</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--theme-error)]">Müşteri Engellenmiş</p>
                {status.banReason && (
                  <p className="text-xs text-[var(--theme-error)] mt-1">Sebep: {status.banReason}</p>
                )}
                {status.bannedUntil && (
                  <p className="text-xs text-[var(--theme-error)] mt-1">
                    Engel Bitiş: {new Date(status.bannedUntil).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grace Period */}
        {status.gracePeriodActive && !status.isBanned && (
          <div className="p-3 bg-[var(--theme-info)]/5 border border-[var(--theme-info)]/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-[var(--theme-info)] text-lg">🆕</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--theme-info)]">Yeni Müşteri - Deneme Süresi</p>
                {status.gracePeriodEndsAt && (
                  <p className="text-xs text-[var(--theme-info)] mt-1">
                    Bitiş: {new Date(status.gracePeriodEndsAt).toLocaleDateString('tr-TR')}
                  </p>
                )}
                <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                  Deneme süresi boyunca politikalar uygulanmaz
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cancellations */}
          <div className="p-3 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--theme-foregroundSecondary)]">Bu Ay İptal</span>
              <span
                className={`text-xs font-semibold ${
                  status.currentCancellations >= status.policySettings.maxMonthlyCancellations
                    ? 'text-[var(--theme-error)]'
                    : status.currentCancellations >= status.policySettings.maxMonthlyCancellations * 0.8
                    ? 'text-[var(--theme-warning)]'
                    : 'text-[var(--theme-success)]'
                }`}
              >
                {status.currentCancellations} / {status.policySettings.maxMonthlyCancellations}
              </span>
            </div>
            <div className="w-full bg-[var(--theme-backgroundSecondary)] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  status.currentCancellations >= status.policySettings.maxMonthlyCancellations
                    ? 'bg-[var(--theme-error)]'
                    : status.currentCancellations >= status.policySettings.maxMonthlyCancellations * 0.8
                    ? 'bg-[var(--theme-warning)]'
                    : 'bg-[var(--theme-success)]'
                }`}
                style={{
                  width: `${Math.min(
                    (status.currentCancellations / status.policySettings.maxMonthlyCancellations) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>

          {/* No-Shows */}
          <div className="p-3 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--theme-foregroundSecondary)]">Bu Ay Gelmeme</span>
              <span
                className={`text-xs font-semibold ${
                  status.currentNoShows >= status.policySettings.maxMonthlyNoShows
                    ? 'text-[var(--theme-error)]'
                    : status.currentNoShows >= status.policySettings.maxMonthlyNoShows * 0.8
                    ? 'text-[var(--theme-warning)]'
                    : 'text-[var(--theme-success)]'
                }`}
              >
                {status.currentNoShows} / {status.policySettings.maxMonthlyNoShows}
              </span>
            </div>
            <div className="w-full bg-[var(--theme-backgroundSecondary)] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  status.currentNoShows >= status.policySettings.maxMonthlyNoShows
                    ? 'bg-[var(--theme-error)]'
                    : status.currentNoShows >= status.policySettings.maxMonthlyNoShows * 0.8
                    ? 'bg-[var(--theme-warning)]'
                    : 'bg-[var(--theme-success)]'
                }`}
                style={{
                  width: `${Math.min(
                    (status.currentNoShows / status.policySettings.maxMonthlyNoShows) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Policy Settings Summary */}
        {!status.isBanned && (
          <div className="pt-3 border-t border-[var(--theme-border)]">
            <p className="text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Geçerli Politikalar</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[var(--theme-foregroundSecondary)]">Maksimum İptal:</span>
                <span className="ml-1 text-[var(--theme-foreground)] font-medium">
                  {getMaxMonthlyCancellationsDisplayValue(status.policySettings.maxMonthlyCancellations)}
                </span>
              </div>
              <div>
                <span className="text-[var(--theme-foregroundSecondary)]">Maksimum Gelmeme:</span>
                <span className="ml-1 text-[var(--theme-foreground)] font-medium">
                  {getMaxMonthlyNoShowsDisplayValue(status.policySettings.maxMonthlyNoShows)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Violations History */}
        {status.violations && status.violations.length > 0 && (
          <div className="pt-3 border-t border-[var(--theme-border)]">
            <p className="text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Son İhlaller</p>
            <div className="space-y-2">
              {status.violations.slice(0, 3).map((violation) => (
                <div
                  key={violation.id}
                  className="p-2 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium ${
                        violation.type === 'no-show' ? 'text-[var(--theme-error)]' : 'text-[var(--theme-warning)]'
                      }`}
                    >
                      {violation.type === 'no-show' ? 'Gelmeme' : 'İptal'}
                    </span>
                    <span className="text-[var(--theme-foregroundSecondary)]">
                      {new Date(violation.occurredAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  {violation.description && (
                    <p className="text-[var(--theme-foregroundSecondary)] mt-1">{violation.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning if at risk */}
        {isAtRisk && !status.isBanned && !status.gracePeriodActive && (
          <div className="p-3 bg-[var(--theme-warning)]/5 border border-[var(--theme-warning)]/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-[var(--theme-warning)] text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--theme-warning)]">Dikkat Gerekli</p>
                <p className="text-xs text-[var(--theme-warning)] mt-1">
                  {status.policySettings.policyWarningMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPolicyStatus;
