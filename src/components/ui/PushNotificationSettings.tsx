'use client';

/**
 * Push Notification Settings Component
 *
 * Professional UI for managing push notification preferences.
 * Follows industry best practices for permission UX and user control.
 */

import React, { useState } from 'react';
import { X, Bell, AlertTriangle, CheckCircle, Check, Plus, Edit, Trash2, Save, RefreshCw, AlertCircle, Clock, User, Phone, Mail, MapPin, Settings, BarChart3, Home, CreditCard, FileText, HelpCircle, Info, Warning, Ban, Shield, Users, Building, Star, Heart, Zap, Lock, Unlock, Eye, EyeOff, Calendar, Search, Filter, SortAsc, SortDesc, MoreVertical, MoreHorizontal, Download, Upload, Loader2, Moon, Sun, XCircle, Tag, ChevronDown, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
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
          <X className="w-6 h-6 text-[var(--theme-error)]" />
        </div>
      );
    }

    if (isSubscribed && permission === 'granted') {
      return (
        <div className="w-12 h-12 bg-[var(--theme-success)]/10 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-[var(--theme-success)]" />
        </div>
      );
    }

    if (permission === 'denied') {
      return (
        <div className="w-12 h-12 bg-[var(--theme-warning)]/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[var(--theme-warning)]" />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-[var(--theme-primary)]" />
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3">
              <button
                onClick={handleToggleNotifications}
                disabled={isInitializing}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${
                  isSubscribed
                    ? 'bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] border-2 border-[var(--theme-border)] hover:border-[var(--theme-error)] hover:text-[var(--theme-error)]'
                    : 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] hover:bg-[var(--theme-primaryHover)] shadow-sm'
                }`}
              >
                {isInitializing ? (
                  <div className="flex items-center justify-center space-x-2">
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
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] border-2 border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
            <AlertTriangle className="w-6 h-6 text-[var(--theme-warning)] flex-shrink-0 mt-0.5" />
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
                <CheckCircle className="w-4 h-4 text-[var(--theme-success)]" />
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
                <Info className="w-4 h-4 text-[var(--theme-info)]" />
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
                <Clock className="w-4 h-4 text-[var(--theme-warning)]" />
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
                <Bell className="w-4 h-4 text-[var(--theme-accent)]" />
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
