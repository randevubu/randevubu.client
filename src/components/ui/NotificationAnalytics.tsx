'use client';

import { useState, useEffect } from 'react';
import { businessService } from '../../lib/services/business';
import { handleApiError } from '../../lib/utils/toast';

interface NotificationAnalyticsData {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalAppointments: number;
    remindedAppointments: number;
    reminderCoverage: number;
    noShowRate: number;
    completionRate: number;
  };
  channelPerformance: {
    [key: string]: {
      sent: number;
      delivered: number;
      read: number;
      failed: number;
    };
  };
  reminderEffectiveness: {
    withReminder: {
      total: number;
      noShow: number;
      completed: number;
      noShowRate: number;
    };
    withoutReminder: {
      total: number;
      noShow: number;
      completed: number;
      noShowRate: number;
    };
  };
}

interface NotificationAnalyticsProps {
  className?: string;
}

export default function NotificationAnalytics({ className = '' }: NotificationAnalyticsProps) {
  const [analytics, setAnalytics] = useState<NotificationAnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await businessService.getNotificationAnalytics({ days });
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">Analiz yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
            <svg className="h-8 w-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">Veri Bulunamadı</h3>
          <p className="text-[var(--theme-foregroundSecondary)]">Henüz analiz verisi mevcut değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period Selector */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Bildirim Analizi</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                days === 7
                  ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)]'
                  : 'bg-[var(--theme-background)] text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)]'
              }`}
            >
              7 Gün
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                days === 30
                  ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)]'
                  : 'bg-[var(--theme-background)] text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)]'
              }`}
            >
              30 Gün
            </button>
            <button
              onClick={() => setDays(90)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                days === 90
                  ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)]'
                  : 'bg-[var(--theme-background)] text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)]'
              }`}
            >
              90 Gün
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
          <h4 className="text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Toplam Randevu</h4>
          <p className="text-2xl font-bold text-[var(--theme-foreground)]">{analytics.summary.totalAppointments}</p>
        </div>

        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
          <h4 className="text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Hatırlatma Kapsamı</h4>
          <p className="text-2xl font-bold text-[var(--theme-primary)]">{analytics.summary.reminderCoverage.toFixed(1)}%</p>
        </div>

        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
          <h4 className="text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Gelmeme Oranı</h4>
          <p className="text-2xl font-bold text-[var(--theme-error)]">{analytics.summary.noShowRate.toFixed(1)}%</p>
        </div>

        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
          <h4 className="text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">Tamamlanma Oranı</h4>
          <p className="text-2xl font-bold text-[var(--theme-success)]">{analytics.summary.completionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Effectiveness Comparison */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
        <h3 className="text-sm font-semibold text-[var(--theme-foreground)] mb-4">Hatırlatma Etkinliği</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* With Reminders */}
          <div className="p-4 border border-[var(--theme-border)] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--theme-foreground)]">Hatırlatmalı</h4>
              <span className="px-2 py-1 text-xs bg-[var(--theme-success)]/10 text-[var(--theme-success)] rounded">
                Aktif
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-foregroundSecondary)]">Toplam:</span>
                <span className="font-medium text-[var(--theme-foreground)]">{analytics.reminderEffectiveness.withReminder.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-foregroundSecondary)]">Gelmedi:</span>
                <span className="font-medium text-[var(--theme-error)]">{analytics.reminderEffectiveness.withReminder.noShow}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-foregroundSecondary)]">Tamamlandı:</span>
                <span className="font-medium text-[var(--theme-success)]">{analytics.reminderEffectiveness.withReminder.completed}</span>
              </div>
              <div className="pt-2 border-t border-[var(--theme-border)]">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[var(--theme-foreground)]">Gelmeme Oranı:</span>
                  <span className="font-bold text-[var(--theme-success)]">{analytics.reminderEffectiveness.withReminder.noShowRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Without Reminders */}
          <div className="p-4 border border-[var(--theme-border)] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[var(--theme-foreground)]">Hatırlatmasız</h4>
              <span className="px-2 py-1 text-xs bg-[var(--theme-error)]/10 text-[var(--theme-error)] rounded">
                Pasif
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-foregroundSecondary)]">Toplam:</span>
                <span className="font-medium text-[var(--theme-foreground)]">{analytics.reminderEffectiveness.withoutReminder.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-foregroundSecondary)]">Gelmedi:</span>
                <span className="font-medium text-[var(--theme-error)]">{analytics.reminderEffectiveness.withoutReminder.noShow}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--theme-foregroundSecondary)]">Tamamlandı:</span>
                <span className="font-medium text-[var(--theme-success)]">{analytics.reminderEffectiveness.withoutReminder.completed}</span>
              </div>
              <div className="pt-2 border-t border-[var(--theme-border)]">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[var(--theme-foreground)]">Gelmeme Oranı:</span>
                  <span className="font-bold text-[var(--theme-error)]">{analytics.reminderEffectiveness.withoutReminder.noShowRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
        <h3 className="text-sm font-semibold text-[var(--theme-foreground)] mb-4">Kanal Performansı</h3>
        <div className="space-y-4">
          {Object.entries(analytics.channelPerformance).map(([channel, stats]) => {
            const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent * 100).toFixed(1) : '0.0';
            const readRate = stats.delivered > 0 ? (stats.read / stats.delivered * 100).toFixed(1) : '0.0';

            return (
              <div key={channel} className="p-3 border border-[var(--theme-border)] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-[var(--theme-foreground)]">{channel}</h4>
                  <div className="flex space-x-3 text-xs">
                    <span className="text-[var(--theme-foregroundSecondary)]">
                      Teslimat: <span className="font-medium text-[var(--theme-success)]">{deliveryRate}%</span>
                    </span>
                    <span className="text-[var(--theme-foregroundSecondary)]">
                      Okunma: <span className="font-medium text-[var(--theme-primary)]">{readRate}%</span>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)]">Gönderilen</p>
                    <p className="text-lg font-semibold text-[var(--theme-foreground)]">{stats.sent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)]">Teslim Edilen</p>
                    <p className="text-lg font-semibold text-[var(--theme-success)]">{stats.delivered}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)]">Okunan</p>
                    <p className="text-lg font-semibold text-[var(--theme-primary)]">{stats.read}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--theme-foregroundSecondary)]">Başarısız</p>
                    <p className="text-lg font-semibold text-[var(--theme-error)]">{stats.failed}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}