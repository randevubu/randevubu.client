/**
 * Reservation Rules Settings Component
 * 
 * Component for managing business reservation rules settings.
 * Provides a clean, accessible form interface for configuring
 * reservation rules with proper validation and error handling.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useReservationRules } from '../../lib/hooks/useReservationRules';
import {
  ADVANCE_BOOKING_OPTIONS,
  NOTIFICATION_HOURS_OPTIONS,
  DAILY_APPOINTMENTS_OPTIONS,
  getAdvanceBookingDisplayValue,
  getNotificationHoursDisplayValue,
  getDailyAppointmentsDisplayValue
} from '../../types/reservationRules';

interface ReservationRulesSettingsProps {
  onSettingsUpdated?: () => void;
  className?: string;
}

export const ReservationRulesSettings: React.FC<ReservationRulesSettingsProps> = ({
  onSettingsUpdated,
  className = ''
}) => {
  const {
    settings,
    isLoading,
    isUpdating,
    error,
    updateSettings,
    clearError,
    validateSettings
  } = useReservationRules();

  // Local form state
  const [formData, setFormData] = useState({
    maxAdvanceBookingDays: 30,
    minNotificationHours: 2,
    maxDailyAppointments: 50
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      const newFormData = {
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
        minNotificationHours: settings.minNotificationHours,
        maxDailyAppointments: settings.maxDailyAppointments
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [settings]);

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Check if there are changes
    const hasFormChanges = settings ? (
      newFormData.maxAdvanceBookingDays !== settings.maxAdvanceBookingDays ||
      newFormData.minNotificationHours !== settings.minNotificationHours ||
      newFormData.maxDailyAppointments !== settings.maxDailyAppointments
    ) : true;
    
    setHasChanges(hasFormChanges);
    
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    
    // Clear API errors when user makes changes
    if (error) {
      clearError();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate settings
      const errors = validateSettings(formData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Update settings
      await updateSettings(formData);
      setHasChanges(false);
      setValidationErrors([]);
      
      // Call callback if provided
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      // Error is already handled by the hook
      // No need to log as it's already handled by the hook
    }
  };

  // Handle reset to defaults
  const handleResetToDefaults = async () => {
    if (!settings) return;
    
    try {
      const defaultSettings = {
        maxAdvanceBookingDays: 30,
        minNotificationHours: 2,
        maxDailyAppointments: 50
      };
      
      await updateSettings(defaultSettings);
      setHasChanges(false);
      setValidationErrors([]);
      
      // Call callback if provided
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (error) {
      // Error is already handled by the hook
      // No need to log as it's already handled by the hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)]">Rezervasyon kuralları yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Rezervasyon Kuralları</h3>
          <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
            Müşterilerin randevu alabilme kurallarını yapılandırın
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg className="w-5 h-5 text-[var(--theme-error)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--theme-error)] mb-1">Hata</h4>
              <p className="text-xs text-[var(--theme-error)] leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-[var(--theme-warning)]/5 border border-[var(--theme-warning)]/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg className="w-5 h-5 text-[var(--theme-warning)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--theme-warning)] mb-1">Doğrulama Hatası</h4>
              <ul className="text-xs text-[var(--theme-warning)] leading-relaxed list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Max Advance Booking Days */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Kaç Gün Öncesinden Randevu Alınabilir
          </label>
          <select
            value={formData.maxAdvanceBookingDays}
            onChange={(e) => handleInputChange('maxAdvanceBookingDays', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
          >
            {ADVANCE_BOOKING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Müşteriler en fazla kaç gün öncesinden randevu alabilir
          </p>
        </div>

        {/* Min Notification Hours */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Minimum Randevu Bildirimi Süresi
          </label>
          <select
            value={formData.minNotificationHours}
            onChange={(e) => handleInputChange('minNotificationHours', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
          >
            {NOTIFICATION_HOURS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Randevu alabilmek için minimum kaç saat önceden bildirim gerekli
          </p>
        </div>

        {/* Max Daily Appointments */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Aynı Gün İçin Maksimum Randevu Sayısı
          </label>
          <select
            value={formData.maxDailyAppointments}
            onChange={(e) => handleInputChange('maxDailyAppointments', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
          >
            {DAILY_APPOINTMENTS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Aynı gün için maksimum kaç randevu alınabilir
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--theme-border)]">
          <button
            type="submit"
            disabled={!hasChanges || isUpdating}
            className="flex-1 px-4 py-3 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={isUpdating}
            className="flex-1 px-4 py-3 bg-[var(--theme-backgroundSecondary)] text-[var(--theme-foreground)] border border-[var(--theme-border)] rounded-lg font-semibold hover:bg-[var(--theme-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Varsayılanlara Sıfırla
          </button>
        </div>
      </form>

      {/* Current Settings Display */}
      {settings && (
        <div className="mt-6 p-4 bg-[var(--theme-background)] rounded-lg border border-[var(--theme-border)]">
          <h4 className="text-sm font-semibold text-[var(--theme-foreground)] mb-3">Mevcut Ayarlar</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Maksimum İleri Tarih:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {getAdvanceBookingDisplayValue(settings.maxAdvanceBookingDays)}
              </p>
            </div>
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Minimum Bildirim:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {getNotificationHoursDisplayValue(settings.minNotificationHours)}
              </p>
            </div>
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Günlük Maksimum:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {getDailyAppointmentsDisplayValue(settings.maxDailyAppointments)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationRulesSettings;
