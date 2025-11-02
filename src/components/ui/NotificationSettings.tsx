'use client';

import { useState, useRef } from 'react';
import { notificationService, NotificationSettings as Settings, handleNotificationError } from '../../lib/services/notifications';
import { 
  getServiceWorkerRegistration, 
  isServiceWorkerSupported, 
  isServiceWorkerActive 
} from '../../lib/utils/serviceWorkerRegistration';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  className?: string;
}

export default function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<Settings>({
    enableAppointmentReminders: true,
    enableBusinessNotifications: true,
    enablePromotionalMessages: false,
    reminderTiming: {
      hours: [1, 24],
    },
    preferredChannels: {
      channels: ['PUSH'],
    },
    quietHours: null,
    timezone: 'Europe/Istanbul',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const initializedRef = useRef(false);

  // Initialize once using ref pattern (industry standard for one-time initialization)
  if (typeof window !== 'undefined' && !initializedRef.current) {
    initializedRef.current = true;
    // Use Promise to avoid blocking render
    Promise.resolve().then(async () => {
      const supported = isServiceWorkerSupported();
      setIsSupported(supported);
      
      if (supported) {
        const active = await isServiceWorkerActive();
        setIsActive(active);
        
        if (active) {
          const registration = await getServiceWorkerRegistration();
          if (registration) {
            await initializeNotifications(registration);
          }
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  }

  const initializeNotifications = async (registration: ServiceWorkerRegistration) => {
    const initialized = await notificationService.initialize(registration);
    if (initialized) {
      loadSettings();
      checkSubscriptionStatus();
    } else {
      setError('Bildirim servisi başlatılamadı');
      setIsLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const currentSettings = await notificationService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      toast.error('Bildirim ayarları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = () => {
    setIsSubscribed(notificationService.isSubscribed());
    setPermissionStatus(notificationService.getPermissionStatus());
  };

  const handlePermissionRequest = async () => {
    try {
      const permission = await notificationService.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        await handleSubscribe();
      } else {
        toast.error('Bildirim izni reddedildi');
      }
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      toast.error(errorMessage);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await notificationService.subscribe();
      setIsSubscribed(true);
      toast.success('Bildirimler etkinleştirildi');
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await notificationService.unsubscribe();
      setIsSubscribed(false);
      toast.success('Bildirimler devre dışı bırakıldı');
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    try {
      await notificationService.updateSettings({ [key]: value });
      toast.success('Bildirim ayarları güncellendi');
    } catch (error) {
      // Revert on error
      setSettings(settings);
      toast.error('Ayarlar güncellenemedi');
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationService.sendTestNotification({
        title: 'Test Bildirimi',
        body: 'RandevuBu PWA test bildirimi başarıyla çalışıyor! 🎉'
      });
      toast.success('Test bildirimi gönderildi');
    } catch (error) {
      const errorMessage = handleNotificationError(error);
      toast.error(errorMessage);
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Bildirimler Desteklenmiyor
        </h3>
        <p className="text-yellow-700">
          Tarayıcınız push bildirimlerini desteklemiyor. Lütfen modern bir tarayıcı kullanın.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Push Bildirimleri
        </h3>
        
        {/* Permission and Subscription Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">Durum:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              isSubscribed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isSubscribed ? 'Etkin' : 'Devre Dışı'}
            </span>
          </div>
          
          {permissionStatus === 'default' && (
            <button
              onClick={handlePermissionRequest}
              className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Bildirim İzni Ver
            </button>
          )}
          
          {permissionStatus === 'denied' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">
                Bildirim izni reddedildi. Tarayıcı ayarlarından izni manuel olarak etkinleştirin.
              </p>
            </div>
          )}
          
          {permissionStatus === 'granted' && !isSubscribed && (
            <button
              onClick={handleSubscribe}
              className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Bildirimleri Etkinleştir
            </button>
          )}
          
          {isSubscribed && (
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleUnsubscribe}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Devre Dışı Bırak
              </button>
              <button
                onClick={handleTestNotification}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Test Gönder
              </button>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        {isSubscribed && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Bildirim Türleri</h4>
            
            <div className="space-y-3">
              <SettingToggle
                id="enableAppointmentReminders"
                label="Randevu Hatırlatmaları"
                description="Yaklaşan randevular için hatırlatma bildirimleri"
                checked={settings.enableAppointmentReminders}
                onChange={(value) => handleSettingChange('enableAppointmentReminders', value)}
              />
              
              <SettingToggle
                id="enableBusinessNotifications"
                label="İş Bildirimleri"
                description="Randevu onayları, iptaller ve değişiklikler"
                checked={settings.enableBusinessNotifications}
                onChange={(value) => handleSettingChange('enableBusinessNotifications', value)}
              />
              
              <SettingToggle
                id="enablePromotionalMessages"
                label="Promosyonlar ve Kampanyalar"
                description="Özel teklifler ve kampanya bildirimleri"
                checked={settings.enablePromotionalMessages}
                onChange={(value) => handleSettingChange('enablePromotionalMessages', value)}
              />
            </div>
            
            {/* Reminder Timing */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Hatırlatma Zamanları</h4>
              <div className="space-y-2">
                {[0.5, 1, 2, 24].map(hours => (
                  <label key={hours} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.reminderTiming.hours.includes(hours)}
                      onChange={(e) => {
                        const newHours = e.target.checked
                          ? [...settings.reminderTiming.hours, hours]
                          : settings.reminderTiming.hours.filter(h => h !== hours);
                        
                        handleSettingChange('reminderTiming', {
                          ...settings.reminderTiming,
                          hours: newHours
                        });
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {hours < 1 ? `${hours * 60} dakika` : `${hours} saat`} önce
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Quiet Hours */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">Sessiz Saatler</h4>
                  <p className="text-sm text-gray-500">Bu saatler arasında bildirim almayın</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.quietHours !== null}
                  onChange={(e) => {
                    handleSettingChange('quietHours', e.target.checked ? {
                      start: '22:00',
                      end: '08:00',
                      timezone: 'Europe/Istanbul'
                    } : null);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              {settings.quietHours && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Başlangıç</label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => {
                        handleSettingChange('quietHours', {
                          ...settings.quietHours!,
                          start: e.target.value
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bitiş</label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => {
                        handleSettingChange('quietHours', {
                          ...settings.quietHours!,
                          end: e.target.value
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({ id, label, description, checked, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-1">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}