'use client';

import { useState, useEffect } from 'react';
import { Clock, Moon, Check, X, Plus, Edit, Trash2, Save, RefreshCw, AlertCircle, CheckCircle, User, Phone, Mail, MapPin, Settings, BarChart3, Home, CreditCard, FileText, HelpCircle, Info, Warning, AlertTriangle, Ban, Shield, Users, Building, Star, Heart, Zap, Lock, Unlock, Eye, EyeOff, Calendar, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Loader2, Sun, XCircle, Tag, Bell, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { businessService } from '../../lib/services/business';
import { handleApiError, showSuccessToast, showErrorToast } from '../../lib/utils/toast';
import { FormField } from './FormField';
import { usePushNotifications } from '../../context/PushNotificationContext';
import useSMSCountdown from '../../lib/hooks/useSMSCountdown';
import TestButton from './TestButton';
import SMSCostWarning from './SMSCostWarning';

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
      await pushNotifications.sendTestNotification();

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
            <RefreshCw className="h-8 w-8 text-[var(--theme-foregroundMuted)]" />
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
            <RefreshCw className="w-3 h-3 text-[var(--theme-primary)]" />
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
              <Bell className="w-3 h-3 text-[var(--theme-info)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--theme-foreground)]">Bildirim Kanalları</h3>
          </div>
          <div className="space-y-3">
            {/* SMS Channel */}
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[var(--theme-success)]" />
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
                  <Bell className="w-4 h-4 text-[var(--theme-primary)]" />
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
                            await pushNotifications.enableNotifications();
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
                            await pushNotifications.disableNotifications();
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
                    disabled={isSaving || pushNotifications.isInitializing || !pushNotifications.isSupported}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-primary)] peer-disabled:opacity-50"></div>
                </label>
                {pushNotifications.isSupported && pushNotifications.permission === 'default' && (
                  <button
                    onClick={pushNotifications.requestPermission}
                    disabled={pushNotifications.isInitializing}
                    className="px-2 py-1 text-xs bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded hover:bg-[var(--theme-primaryHover)] disabled:opacity-50"
                  >
                    İzin Ver
                  </button>
                )}
              </div>
            </div>

            {/* Email Channel */}
            <div className="flex items-center justify-between p-3 border border-[var(--theme-border)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[var(--theme-warning)]" />
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
              <Clock className="w-3 h-3 text-[var(--theme-warning)]" />
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
        <div className="bg-gradient-to-br from-[var(--theme-backgroundSecondary)] to-[var(--theme-backgroundSecondary)]/80 rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300 relative overflow-hidden">
          {/* Coming Soon Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--theme-warning)]/10 text-[var(--theme-warning)] border border-[var(--theme-warning)]/20">
              <Clock className="w-3 h-3 mr-1.5" />
              Yakında
            </span>
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-accent)]/20 to-[var(--theme-accent)]/10 rounded-xl flex items-center justify-center shadow-sm">
              <Moon className="w-5 h-5 text-[var(--theme-accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Sessiz Saatler</h3>
              <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
                Müşterilerinizin dinlenme saatlerini koruyun
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[var(--theme-background)]/30 rounded-lg border border-[var(--theme-border)]/30 opacity-60">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-[var(--theme-foreground)] mb-2">Sessiz Saatleri Aktif Et</h4>
                <p className="text-xs text-[var(--theme-foregroundSecondary)] leading-relaxed">
                  Belirttiğiniz saatler arasında hatırlatma gönderilmez. Müşteri deneyimini iyileştirir.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed ml-4">
                <input
                  type="checkbox"
                  checked={false}
                  disabled={true}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-[var(--theme-backgroundSecondary)] rounded-full opacity-50 cursor-not-allowed"></div>
              </label>
            </div>

            {/* Time inputs disabled - feature coming soon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[var(--theme-border)]/30 opacity-50">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)]">Başlangıç Saati</label>
                <input
                  type="time"
                  disabled={true}
                  className="w-full px-4 py-3 border border-[var(--theme-border)]/50 rounded-lg bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)] cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--theme-foregroundSecondary)]">Bitiş Saati</label>
                <input
                  type="time"
                  disabled={true}
                  className="w-full px-4 py-3 border border-[var(--theme-border)]/50 rounded-lg bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foregroundSecondary)] cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Cost Warning */}
      {settings.enableAppointmentReminders && settings.smsEnabled && (
        <SMSCostWarning className="mb-6" />
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