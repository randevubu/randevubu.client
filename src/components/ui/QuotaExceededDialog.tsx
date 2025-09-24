'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUsageTracking } from '@/lib/hooks/useUsageTracking';

interface QuotaExceededDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorCode: string;
  errorMessage: string;
  businessId: string;
}

export default function QuotaExceededDialog({
  isOpen,
  onClose,
  errorCode,
  errorMessage,
  businessId
}: QuotaExceededDialogProps) {
  const router = useRouter();
  const { usageSummary, usageAlerts } = useUsageTracking(businessId);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getQuotaInfo = () => {
    switch (errorCode) {
      case 'SMS_QUOTA_EXCEEDED':
        return {
          icon: '📱',
          title: 'SMS Kotası Doldu',
          current: usageSummary?.currentMonth?.smssSent || 0,
          limit: usageSummary?.planLimits?.smsQuota || 0,
          feature: 'SMS'
        };
      case 'STAFF_LIMIT_EXCEEDED':
        return {
          icon: '👥',
          title: 'Personel Limiti Doldu',
          current: usageSummary?.currentMonth?.staffMembersActive || 0,
          limit: usageSummary?.planLimits?.maxStaffPerBusiness || 0,
          feature: 'Personel'
        };
      case 'SERVICE_LIMIT_EXCEEDED':
        return {
          icon: '⚙️',
          title: 'Hizmet Limiti Doldu',
          current: usageSummary?.currentMonth?.servicesActive || 0,
          limit: usageSummary?.planLimits?.maxServices || 0,
          feature: 'Hizmet'
        };
      case 'CUSTOMER_LIMIT_EXCEEDED':
        return {
          icon: '👤',
          title: 'Müşteri Limiti Doldu',
          current: usageSummary?.currentMonth?.customersAdded || 0,
          limit: usageSummary?.planLimits?.maxCustomers || 0,
          feature: 'Müşteri'
        };
      default:
        return {
          icon: '⚠️',
          title: 'Limit Aşıldı',
          current: 0,
          limit: 0,
          feature: 'Özellik'
        };
    }
  };

  const quotaInfo = getQuotaInfo();

  const handleUpgrade = () => {
    router.push('/dashboard/subscription');
    onClose();
  };

  const handleViewUsage = () => {
    router.push('/dashboard/usage');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--theme-card)] rounded-lg shadow-xl max-w-md w-full border border-[var(--theme-border)] transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-3xl mr-3">{quotaInfo.icon}</div>
              <h2 className="text-lg font-semibold text-[var(--theme-foreground)]">
                {quotaInfo.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          <div className="mb-6">
            <div className="bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/20 rounded-lg p-4">
              <p className="text-[var(--theme-error)] text-sm font-medium">
                {errorMessage}
              </p>
            </div>
          </div>

          {/* Usage Information */}
          {usageSummary && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[var(--theme-foreground)] mb-3">
                Mevcut Kullanım
              </h3>
              <div className="bg-[var(--theme-backgroundSecondary)] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[var(--theme-foregroundSecondary)]">
                    {quotaInfo.feature}
                  </span>
                  <span className="text-sm font-medium text-[var(--theme-foreground)]">
                    {quotaInfo.current} / {quotaInfo.limit}
                  </span>
                </div>
                <div className="w-full bg-[var(--theme-border)] rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[var(--theme-error)]"
                    style={{ width: `${Math.min((quotaInfo.current / quotaInfo.limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Solutions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[var(--theme-foreground)] mb-3">
              Çözüm Seçenekleri
            </h3>
            <div className="space-y-2">
              <div className="flex items-start p-3 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 rounded-lg">
                <div className="text-[var(--theme-primary)] mr-3 mt-0.5">🚀</div>
                <div>
                  <div className="text-sm font-medium text-[var(--theme-primary)]">
                    Paketinizi Yükseltin
                  </div>
                  <div className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                    Daha yüksek limitler ve ek özellikler için planınızı değiştirin
                  </div>
                </div>
              </div>

              {errorCode === 'SMS_QUOTA_EXCEEDED' && (
                <div className="flex items-start p-3 bg-[var(--theme-backgroundSecondary)] border border-[var(--theme-border)] rounded-lg">
                  <div className="text-[var(--theme-foregroundSecondary)] mr-3 mt-0.5">📅</div>
                  <div>
                    <div className="text-sm font-medium text-[var(--theme-foreground)]">
                      Yeni Döngüyü Bekleyin
                    </div>
                    <div className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                      SMS kotanız her ay yenilenir
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--theme-foreground)] bg-[var(--theme-backgroundSecondary)] hover:bg-[var(--theme-backgroundTertiary)] rounded-md transition-colors duration-200"
            >
              Anladım
            </button>
            <button
              onClick={handleViewUsage}
              className="flex-1 px-4 py-2 text-sm font-medium text-[var(--theme-primary)] bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)]/20 rounded-md transition-colors duration-200"
            >
              Kullanımı Görüntüle
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryHover)] rounded-md transition-colors duration-200"
            >
              Planı Yükselt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}