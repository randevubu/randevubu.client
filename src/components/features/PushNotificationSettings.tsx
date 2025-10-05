'use client';

/**
 * Push Notification Settings Component
 *
 * Professional UI for managing push notification preferences.
 * Follows industry best practices for permission UX and user control.
 */

import React, { useState } from 'react';
import { usePushNotifications, usePermissionInstructions } from '../../context/PushNotificationContext';

export function PushNotificationSettings() {
  const [showInstructions, setShowInstructions] = useState(false);
  const permissionInstructions = usePermissionInstructions();

  const {
    isSupported,
    isSubscribed,
    permission,
    isInitializing,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
  } = usePushNotifications();

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await disableNotifications();
    } else {
      if (permission === 'denied') {
        setShowInstructions(true);
        return;
      }
      await enableNotifications();
    }
  };

  const handleTestNotification = async () => {
    if (!isSubscribed) return;
    await sendTestNotification();
  };

  const getStatusIcon = () => {
    if (!isSupported) {
      return (
        <div className="w-12 h-12 bg-[var(--theme-error)]/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
      );
    }

    if (isSubscribed && permission === 'granted') {
      return (
        <div className="w-12 h-12 bg-[var(--theme-success)]/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
    }

    if (permission === 'denied') {
      return (
        <div className="w-12 h-12 bg-[var(--theme-warning)]/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.732-1.333-2.464 0L4.35 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    }

    return (
      <div className="w-12 h-12 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
    );
  };

  const getStatusText = () => {
    if (!isSupported) {
      return {
        title: 'Desteklenmiyor',
        description: 'Tarayıcınız push bildirimleri desteklemiyor. Lütfen modern bir tarayıcı kullanın.',
        color: 'error'
      };
    }

    if (isSubscribed && permission === 'granted') {
      return {
        title: 'Bildirimler Etkin',
        description: 'Önemli güncellemeler ve hatırlatmalar için push bildirimleri alıyorsunuz.',
        color: 'success'
      };
    }

    if (permission === 'denied') {
      return {
        title: 'İzin Reddedildi',
        description: 'Bildirim izni reddedildi. Tarayıcı ayarlarından izin vermeniz gerekiyor.',
        color: 'warning'
      };
    }

    return {
      title: 'Bildirimler Devre Dışı',
      description: 'Randevu hatırlatmaları ve önemli güncellemeleri kaçırmamak için bildirimleri etkinleştirin.',
      color: 'primary'
    };
  };

  const status = getStatusText();

  // Not supported - show info message
  if (!isSupported) {
    return (
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)]">
        <div className="flex items-start space-x-4">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">
              {status.title}
            </h3>
            <p className="text-sm text-[var(--theme-foregroundSecondary)]">
              {status.description}
            </p>
            <div className="mt-4 p-4 bg-[var(--theme-info)]/10 border border-[var(--theme-info)]/20 rounded-lg">
              <p className="text-sm text-[var(--theme-info)]">
                <strong>Not:</strong> Chrome, Firefox, Safari ve Edge tarayıcılarının güncel sürümleri push bildirimleri destekler.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)]">
        <div className="flex items-start space-x-4">
          {getStatusIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--theme-foreground)] mb-2">
              {status.title}
            </h3>
            <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-4">
              {status.description}
            </p>

            {/* Toggle Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleNotifications}
                disabled={isInitializing}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSubscribed
                    ? 'bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] border-2 border-[var(--theme-border)] hover:border-[var(--theme-error)] hover:text-[var(--theme-error)]'
                    : 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] hover:bg-[var(--theme-primaryHover)] shadow-sm'
                }`}
              >
                {isInitializing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>İşleniyor...</span>
                  </div>
                ) : isSubscribed ? (
                  'Bildirimleri Kapat'
                ) : permission === 'denied' ? (
                  'Ayarları Göster'
                ) : (
                  'Bildirimleri Aç'
                )}
              </button>

              {/* Test Button - only show when subscribed */}
              {isSubscribed && (
                <button
                  onClick={handleTestNotification}
                  disabled={isInitializing}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] border-2 border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Bildirimi Gönder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permission Instructions - show when denied */}
      {permission === 'denied' && showInstructions && (
        <div className="bg-[var(--theme-warning)]/5 border border-[var(--theme-warning)]/20 rounded-xl p-6">
          <div className="flex items-start space-x-3 mb-4">
            <svg className="w-6 h-6 text-[var(--theme-warning)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[var(--theme-warning)] mb-2">
                Bildirim İzni Nasıl Verilir?
              </h4>
              <p className="text-sm text-[var(--theme-foregroundSecondary)] mb-4">
                Bildirimleri etkinleştirmek için aşağıdaki adımları izleyin:
              </p>
              <ol className="space-y-2 ml-5 list-decimal">
                {permissionInstructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-[var(--theme-foreground)]">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="text-sm text-[var(--theme-warning)] hover:underline font-medium"
          >
            Talimatları Gizle
          </button>
        </div>
      )}

      {/* Benefits Section */}
      {!isSubscribed && permission !== 'denied' && (
        <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)]">
          <h4 className="text-base font-semibold text-[var(--theme-foreground)] mb-4">
            Push Bildirimleri ile Neler Yapabilirsiniz?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[var(--theme-success)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-[var(--theme-foreground)] text-sm mb-1">Randevu Hatırlatmaları</h5>
                <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                  Yaklaşan randevularınız için zamanında hatırlatma alın
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[var(--theme-info)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--theme-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-[var(--theme-foreground)] text-sm mb-1">Önemli Güncellemeler</h5>
                <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                  Randevu değişiklikleri ve önemli duyurular hakkında anında bilgilenin
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-[var(--theme-foreground)] text-sm mb-1">Promosyon & Kampanyalar</h5>
                <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                  Özel teklifler ve kampanyalardan haberdar olun
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[var(--theme-accent)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[var(--theme-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h5 className="font-medium text-[var(--theme-foreground)] text-sm mb-1">Müşteri Mesajları</h5>
                <p className="text-xs text-[var(--theme-foregroundSecondary)]">
                  İşletmenizden gelen mesajları anında görün
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 border border-[var(--theme-border)]">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-[var(--theme-foregroundSecondary)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h5 className="font-medium text-[var(--theme-foreground)] text-sm mb-1">
              Gizlilik & Güvenlik
            </h5>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] leading-relaxed">
              Bildirim ayarlarınız cihazınızda güvenli bir şekilde saklanır. Bildirimleri istediğiniz zaman kapatabilirsiniz.
              Kişisel bilgileriniz hiçbir zaman üçüncü taraflarla paylaşılmaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
