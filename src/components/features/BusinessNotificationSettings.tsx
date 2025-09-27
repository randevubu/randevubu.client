'use client';

import { useState, useEffect } from 'react';
import { businessService } from '../../lib/services/business';
import { handleApiError, showSuccessToast, showErrorToast } from '../../lib/utils/toast';
import { FormField } from '../ui/FormField';
import usePushNotifications from '../../lib/hooks/usePushNotifications';
import useSMSCountdown from '../../lib/hooks/useSMSCountdown';
import TestButton from '../ui/TestButton';
import SMSCostWarning from '../ui/SMSCostWarning';

interface BusinessNotificationSettingsData {
  id: string;
  businessId: string;
  enableAppointmentReminders: boolean;
  reminderChannels: string[];
  reminderTiming: number[];
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHours?: {
    start: string;
    end: string;
  } | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface TestReminderResponse {
  success: boolean;
  data: {
    results: Array<{
      success: boolean;
      error?: string;
      channel: 'SMS' | 'PUSH' | 'EMAIL';
      status: 'SENT' | 'FAILED' | 'RATE_LIMITED';
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      channels: string[];
      testMessage: string;
    };
  };
  message: string;
}

interface NotificationTestState {
  sms: {
    isRateLimited: boolean;
    lastTestTime: Date | null;
  };
  push: {
    canTest: boolean;
    lastTestTime: Date | null;
  };
}

interface BusinessNotificationSettingsProps {
  className?: string;
}

export default function BusinessNotificationSettings({ className = '' }: BusinessNotificationSettingsProps) {
  const [settings, setSettings] = useState<BusinessNotificationSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSMSTesting, setIsSMSTesting] = useState(false);
  const [isPushTesting, setIsPushTesting] = useState(false);

  // Push notification management
  const pushNotifications = usePushNotifications();

  // SMS rate limiting
  const smsCountdown = useSMSCountdown();

  // Test state
  const [testState, setTestState] = useState<NotificationTestState>({
    sms: {
      isRateLimited: false,
      lastTestTime: null
    },
    push: {
      canTest: true,
      lastTestTime: null
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await businessService.getBusinessNotificationSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<BusinessNotificationSettingsData>) => {
    if (!settings) return;

    // Update local state optimistically
    const updatedSettings = { ...settings };
    Object.keys(updates).forEach(key => {
      const value = updates[key as keyof BusinessNotificationSettingsData];
      if (value === undefined && key === 'quietHours') {
        // When quietHours is undefined, remove it from local state
        updatedSettings.quietHours = null;
      } else {
        (updatedSettings as any)[key] = value;
      }
    });
    setSettings(updatedSettings);

    try {
      setIsSaving(true);

      // TEMPORARY WORKAROUND: Until backend implements smart validation,
      // we need to send complete payload with auto-synced reminderChannels
      const finalUpdates = { ...updates };

      // Auto-sync reminderChannels based on enabled toggles
      if ('smsEnabled' in updates || 'pushEnabled' in updates || 'emailEnabled' in updates) {
        const currentChannels = [...(settings.reminderChannels || [])];

        // Handle SMS toggle
        if ('smsEnabled' in updates) {
          if (updates.smsEnabled && !currentChannels.includes('SMS')) {
            currentChannels.push('SMS');
          } else if (!updates.smsEnabled && currentChannels.includes('SMS')) {
            const index = currentChannels.indexOf('SMS');
            currentChannels.splice(index, 1);
          }
        }

        // Handle PUSH toggle
        if ('pushEnabled' in updates) {
          if (updates.pushEnabled && !currentChannels.includes('PUSH')) {
            currentChannels.push('PUSH');
          } else if (!updates.pushEnabled && currentChannels.includes('PUSH')) {
            const index = currentChannels.indexOf('PUSH');
            currentChannels.splice(index, 1);
          }
        }

        // Handle EMAIL toggle
        if ('emailEnabled' in updates) {
          if (updates.emailEnabled && !currentChannels.includes('EMAIL')) {
            currentChannels.push('EMAIL');
          } else if (!updates.emailEnabled && currentChannels.includes('EMAIL')) {
            const index = currentChannels.indexOf('EMAIL');
            currentChannels.splice(index, 1);
          }
        }

        finalUpdates.reminderChannels = currentChannels;
      }

      // Clean undefined values from finalUpdates to avoid sending null
      const cleanedUpdates = Object.fromEntries(
        Object.entries(finalUpdates).filter(([_, value]) => value !== undefined)
      );

      const response = await businessService.updateBusinessNotificationSettings(cleanedUpdates);
      if (response.success && response.data) {
        // Update with the complete response from backend
        setSettings(response.data);
        showSuccessToast('Bildirim ayarları güncellendi');
      } else {
        // Revert changes on error
        setSettings(settings);
        handleApiError(response);
      }
    } catch (error) {
      // Revert changes on error
      setSettings(settings);
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestReminder = async (channels?: string[]) => {
    try {
      setIsTesting(true);
      const testData = {
        channels: channels || (settings?.reminderChannels ?? ['PUSH']),
        customMessage: 'Bu, randevu hatırlatma bildirim ayarlarınızın test mesajıdır.'
      };

      const response = await businessService.testBusinessNotificationSettings(testData);

      if (response.success && response.data) {
        const { summary, results } = response.data;

        // Handle rate limiting responses
        handleTestResponse({ success: response.success, data: { results, summary }, message: response.message || '' } as TestReminderResponse);

        showSuccessToast(`Test başarılı: ${summary.successful}/${summary.total} bildirim gönderildi`);
      } else {
        handleApiError(response);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestResponse = (response: TestReminderResponse) => {
    response.data.results.forEach(result => {
      if (result.channel === 'SMS' && result.status === 'RATE_LIMITED') {
        // Extract remaining time from error message
        const timeMatch = result.error?.match(/(\d+) more minute\(s\)/);
        const remainingMinutes = timeMatch ? parseInt(timeMatch[1]) : 5;

        // Start countdown timer
        smsCountdown.startCountdown(remainingMinutes * 60);

        // Update test state
        setTestState(prev => ({
          ...prev,
          sms: {
            isRateLimited: true,
            lastTestTime: new Date()
          }
        }));

        // Show user-friendly message
        showErrorToast(
          `SMS testleri maliyet kontrolü için 5 dakikada bir ile sınırlıdır. ${remainingMinutes} dakika bekleyin.`
        );
      }
    });
  };

  const handleSMSTest = async () => {
    if (smsCountdown.isRateLimited) {
      showErrorToast(`SMS testi için ${smsCountdown.formatTime()} bekleyin`);
      return;
    }

    try {
      setIsSMSTesting(true);
      await handleTestReminder(['SMS']);

      // Update last test time
      setTestState(prev => ({
        ...prev,
        sms: {
          ...prev.sms,
          lastTestTime: new Date()
        }
      }));
    } finally {
      setIsSMSTesting(false);
    }
  };

  const handlePushTest = async () => {
    try {
      setIsPushTesting(true);
      await pushNotifications.testNotification('Bu, push bildirim ayarlarınızın test mesajıdır.');

      // Update last test time
      setTestState(prev => ({
        ...prev,
        push: {
          ...prev.push,
          lastTestTime: new Date()
        }
      }));
    } finally {
      setIsPushTesting(false);
    }
  };

  const testNotifications = async (channels: string[]) => {
    // Always test push first (free and fast)
    if (channels.includes('PUSH')) {
      await handlePushTest();
    }

    // SMS requires confirmation due to costs
    if (channels.includes('SMS')) {
      if (smsCountdown.isRateLimited) {
        showErrorToast(`SMS testi için ${smsCountdown.formatTime()} bekleyin`);
        return;
      }

      const confirmed = await new Promise<boolean>((resolve) => {
        const result = window.confirm(
          'SMS testleri maliyet kontrolü için 5 dakikada bir ile sınırlıdır. Devam etmek istiyor musunuz?'
        );
        resolve(result);
      });

      if (confirmed) {
        await handleSMSTest();
      }
    }
  };


  const handleTimingChange = (timing: number, enabled: boolean) => {
    if (!settings) return;

    const updatedTiming = enabled
      ? [...settings.reminderTiming.filter(t => t !== timing), timing].sort((a, b) => a - b)
      : settings.reminderTiming.filter(t => t !== timing);

    updateSettings({ reminderTiming: updatedTiming });
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    if (!settings) return;

    if (enabled) {
      updateSettings({ quietHours: { start: '22:00', end: '08:00' } });
    } else {
      // When disabling, send an update without the quietHours field
      // The backend will handle removing it
      updateSettings({ quietHours: undefined } as any);
    }
  };

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    if (!settings?.quietHours) return;

    const updatedQuietHours = {
      ...settings.quietHours,
      [field]: value
    };

    updateSettings({ quietHours: updatedQuietHours });
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">Bildirim ayarları yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-backgroundSecondary)] mb-4">
            <svg className="h-8 w-8 text-[var(--theme-foregroundMuted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">Ayarlar Yüklenemedi</h3>
          <p className="text-[var(--theme-foregroundSecondary)]">Bildirim ayarları yüklenirken bir hata oluştu.</p>
          <button
            onClick={loadSettings}
            className="mt-4 px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg hover:bg-[var(--theme-primaryHover)] transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Master Switch */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Randevu Hatırlatmaları</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--theme-foreground)]">Müşteri Hatırlatma Sistemi</p>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Müşterilerinize otomatik randevu hatırlatma mesajları gönderin
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAppointmentReminders}
              onChange={(e) => updateSettings({ enableAppointmentReminders: e.target.checked })}
              disabled={isSaving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-primary)]"></div>
          </label>
        </div>
      </div>

      {/* Channel Settings */}
      {settings.enableAppointmentReminders && (
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-info)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Bildirim Kanalları</h3>
          </div>
          <div className="space-y-3">
            {/* SMS Channel */}
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--theme-foreground)]">SMS Bildirimleri</p>
                  <p className="text-xs text-[var(--theme-foregroundSecondary)]">Müşterilere SMS ile hatırlatma gönder</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;

                    // Backend will handle auto-syncing reminderChannels
                    updateSettings({
                      smsEnabled: enabled
                    });
                  }}
                  disabled={isSaving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-success)]"></div>
              </label>
            </div>

            {/* Push Channel */}
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--theme-foreground)]">Push Bildirimleri</p>
                  <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                    Tarayıcı üzerinden push bildirimi gönder
                    {!pushNotifications.isSupported && " (Desteklenmiyor)"}
                    {pushNotifications.isSupported && pushNotifications.permission === 'denied' && " (İzin reddedildi)"}
                    {pushNotifications.isSupported && pushNotifications.isSubscribed && " ✓"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushEnabled}
                    onChange={async (e) => {
                      const enabled = e.target.checked;

                      if (enabled) {
                        // Step 1: Subscribe to push notifications (User Level)
                        if (!pushNotifications.isSubscribed && pushNotifications.isSupported) {
                          try {
                            console.log('Step 1: Subscribing to push notifications (User Level)...');
                            await pushNotifications.subscribe();
                            console.log('Step 1: Successfully subscribed to push notifications');
                          } catch (error) {
                            console.error('Step 1 failed: Could not subscribe to push notifications:', error);
                            // If browser subscription fails, don't enable the business setting
                            return;
                          }
                        }
                      } else {
                        // When disabling, optionally unsubscribe from push notifications
                        if (pushNotifications.isSubscribed) {
                          try {
                            console.log('Unsubscribing from push notifications (User Level)...');
                            await pushNotifications.unsubscribe();
                            console.log('Successfully unsubscribed from push notifications');
                          } catch (error) {
                            console.warn('Failed to unsubscribe from push notifications:', error);
                            // Continue with business setting update even if unsubscribe fails
                          }
                        }
                      }

                      // Step 2: Update business notification settings (Business Level)
                      console.log(`Step 2: ${enabled ? 'Enabling' : 'Disabling'} push in business settings...`);
                      updateSettings({
                        pushEnabled: enabled
                      });
                    }}
                    disabled={isSaving || pushNotifications.isLoading || !pushNotifications.isSupported}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-primary)] peer-disabled:opacity-50"></div>
                </label>
                {pushNotifications.isSupported && pushNotifications.permission === 'default' && (
                  <button
                    onClick={pushNotifications.requestPermission}
                    disabled={pushNotifications.isLoading}
                    className="px-2 py-1 text-xs bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded hover:bg-[var(--theme-primaryHover)] disabled:opacity-50"
                  >
                    İzin Ver
                  </button>
                )}
                {pushNotifications.isSupported && pushNotifications.isSubscribed && settings.pushEnabled && (
                  <button
                    onClick={async () => {
                      try {
                        await pushNotifications.unsubscribe();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        await pushNotifications.subscribe();
                        showSuccessToast('Abonelik yenilendi');
                      } catch (error) {
                        showErrorToast('Yenileme başarısız');
                      }
                    }}
                    disabled={pushNotifications.isLoading}
                    className="px-2 py-1 text-xs bg-[var(--theme-warning)] text-white rounded hover:opacity-90 disabled:opacity-50"
                  >
                    🔄 Yenile
                  </button>
                )}
              </div>
            </div>

            {/* Email Channel */}
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--theme-foreground)]">E-posta Bildirimleri</p>
                  <p className="text-xs text-[var(--theme-foregroundSecondary)]">Müşterilere e-posta ile hatırlatma gönder</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;

                    // Backend will handle auto-syncing reminderChannels
                    updateSettings({
                      emailEnabled: enabled
                    });
                  }}
                  disabled={isSaving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-warning)]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Timing Settings */}
      {settings.enableAppointmentReminders && (
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Hatırlatma Zamanları</h3>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mb-3">
              Randevudan ne kadar önce hatırlatma mesajları gönderilsin? (Birden fazla seçebilirsiniz)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { minutes: 15, label: '15 dakika önce' },
                { minutes: 30, label: '30 dakika önce' },
                { minutes: 60, label: '1 saat önce' },
                { minutes: 120, label: '2 saat önce' },
                { minutes: 1440, label: '1 gün önce' },
                { minutes: 2880, label: '2 gün önce' },
              ].map(({ minutes, label }) => (
                <label key={minutes} className="flex items-center space-x-2 p-2 border border-[var(--theme-border)] rounded-lg hover:bg-[var(--theme-background)] transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminderTiming.includes(minutes)}
                    onChange={(e) => handleTimingChange(minutes, e.target.checked)}
                    disabled={isSaving}
                    className="h-4 w-4 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] border-[var(--theme-border)] rounded"
                  />
                  <span className="text-xs text-[var(--theme-foreground)]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quiet Hours */}
      {settings.enableAppointmentReminders && (
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-accent)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Sessiz Saatler</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--theme-foreground)]">Sessiz Saatleri Aktif Et</p>
                <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
                  Belirttiğiniz saatler arasında hatırlatma gönderilmez
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.quietHours}
                  onChange={(e) => handleQuietHoursToggle(e.target.checked)}
                  disabled={isSaving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-accent)]"></div>
              </label>
            </div>

            {settings.quietHours && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--theme-border)]">
                <div>
                  <label className="block text-xs font-medium text-[var(--theme-foreground)] mb-2">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--theme-foreground)] mb-2">Bitiş Saati</label>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timezone Setting */}
      {settings.enableAppointmentReminders && (
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-6 h-6 bg-[var(--theme-info)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Saat Dilimi</h3>
          </div>
          <FormField
            label="Saat Dilimi"
            name="timezone"
            type="select"
            value={settings.timezone}
            onChange={(e) => updateSettings({ timezone: e.target.value })}
            isEditing={true}
            displayValue={settings.timezone}
          >
            <option value="Europe/Istanbul">Türkiye (UTC+3)</option>
            <option value="UTC">UTC (Koordineli Evrensel Zaman)</option>
            <option value="Europe/London">Londra (UTC+0/+1)</option>
            <option value="Europe/Berlin">Berlin (UTC+1/+2)</option>
          </FormField>
        </div>
      )}

      {/* Cost Warning */}
      {settings.enableAppointmentReminders && settings.smsEnabled && (
        <SMSCostWarning className="mb-6" />
      )}

      {/* Test Section */}
      {settings.enableAppointmentReminders && settings.reminderChannels.length > 0 && (
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)] transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center">
              <svg className="w-3 h-3 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Test Bildirimi</h3>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-[var(--theme-foregroundSecondary)]">
              Bildirim ayarlarınızı test etmek için her kanalı ayrı ayrı test edebilirsiniz.
            </p>

            {/* Separate Test Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Push Notification Test */}
              {settings.reminderChannels.includes('PUSH') && (
                <div className="space-y-2">
                  <TestButton
                    channel="PUSH"
                    disabled={isPushTesting || isSaving || pushNotifications.isLoading || !pushNotifications.isSubscribed}
                    cooldown={0} // No cooldown for push
                    onTest={handlePushTest}
                    className="w-full justify-center"
                  >
                    {isPushTesting ? 'Test Gönderiliyor...' : 'Push Test'}
                  </TestButton>
                  {!pushNotifications.isSubscribed && (
                    <p className="text-xs text-[var(--theme-foregroundSecondary)] text-center">
                      Push bildirimleri aktif değil
                    </p>
                  )}
                </div>
              )}

              {/* SMS Test */}
              {settings.reminderChannels.includes('SMS') && (
                <div className="space-y-2">
                  <TestButton
                    channel="SMS"
                    disabled={isSMSTesting || isSaving || smsCountdown.isRateLimited}
                    cooldown={smsCountdown.remainingSeconds}
                    showCostWarning={true}
                    onTest={handleSMSTest}
                    className="w-full justify-center"
                  >
                    {isSMSTesting ? 'Test Gönderiliyor...' : 'SMS Test (Sınırlı)'}
                  </TestButton>
                  {smsCountdown.isRateLimited && (
                    <p className="text-xs text-[var(--theme-warning)] text-center">
                      {smsCountdown.formatTime()} kaldı
                    </p>
                  )}
                </div>
              )}

              {/* Email Test (if enabled) */}
              {settings.reminderChannels.includes('EMAIL') && (
                <div className="space-y-2">
                  <TestButton
                    channel="EMAIL"
                    disabled={isTesting || isSaving}
                    onTest={() => handleTestReminder(['EMAIL'])}
                    className="w-full justify-center"
                  >
                    E-posta Test
                  </TestButton>
                </div>
              )}
            </div>

            {/* Test All Button */}
            <div className="pt-2 border-t border-[var(--theme-border)]">
              <button
                onClick={() => testNotifications(settings.reminderChannels)}
                disabled={isTesting || isSaving}
                className="w-full px-4 py-2 bg-[var(--theme-success)] text-[var(--theme-successForeground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-successHover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Test Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Tüm Aktif Kanallara Test Gönder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Kaydediliyor...</span>
        </div>
      )}
    </div>
  );
}