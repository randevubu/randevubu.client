/**
 * Cancellation Policy Settings Component
 *
 * Component for managing business cancellation and no-show policies.
 * Provides a clean, accessible form interface for configuring
 * cancellation policies with proper validation and error handling.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useCancellationPolicies } from '../../lib/hooks/useCancellationPolicies';
import {
  MIN_CANCELLATION_HOURS_OPTIONS,
  MAX_MONTHLY_CANCELLATIONS_OPTIONS,
  MAX_MONTHLY_NO_SHOWS_OPTIONS,
  GRACE_PERIOD_DAYS_OPTIONS,
  BAN_DURATION_DAYS_OPTIONS,
  getMinCancellationHoursDisplayValue,
  getMaxMonthlyCancellationsDisplayValue,
  getMaxMonthlyNoShowsDisplayValue,
  getGracePeriodDaysDisplayValue,
  getBanDurationDaysDisplayValue,
  DEFAULT_POLICY_WARNING_MESSAGE
} from '../../types/cancellationPolicies';

interface CancellationPolicySettingsProps {
  onSettingsUpdated?: () => void;
  className?: string;
}

export const CancellationPolicySettings: React.FC<CancellationPolicySettingsProps> = ({
  onSettingsUpdated,
  className = ''
}) => {
  const {
    policies,
    isLoading,
    isUpdating,
    error,
    updatePolicies,
    clearError,
    validatePolicies
  } = useCancellationPolicies();

  // Local form state
  const [formData, setFormData] = useState({
    minCancellationHours: 4,
    maxMonthlyCancellations: 3,
    maxMonthlyNoShows: 2,
    enablePolicyEnforcement: true,
    policyWarningMessage: DEFAULT_POLICY_WARNING_MESSAGE,
    gracePeriodDays: 0,
    autoBanEnabled: false,
    banDurationDays: 30
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when policies are loaded
  useEffect(() => {
    if (policies) {
      const newFormData = {
        minCancellationHours: policies.minCancellationHours,
        maxMonthlyCancellations: policies.maxMonthlyCancellations,
        maxMonthlyNoShows: policies.maxMonthlyNoShows,
        enablePolicyEnforcement: policies.enablePolicyEnforcement,
        policyWarningMessage: policies.policyWarningMessage || DEFAULT_POLICY_WARNING_MESSAGE,
        gracePeriodDays: policies.gracePeriodDays,
        autoBanEnabled: policies.autoBanEnabled,
        banDurationDays: policies.banDurationDays
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [policies]);

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Check if there are changes
    const hasFormChanges = policies
      ? newFormData.minCancellationHours !== policies.minCancellationHours ||
        newFormData.maxMonthlyCancellations !== policies.maxMonthlyCancellations ||
        newFormData.maxMonthlyNoShows !== policies.maxMonthlyNoShows ||
        newFormData.enablePolicyEnforcement !== policies.enablePolicyEnforcement ||
        newFormData.policyWarningMessage !== policies.policyWarningMessage ||
        newFormData.gracePeriodDays !== policies.gracePeriodDays ||
        newFormData.autoBanEnabled !== policies.autoBanEnabled ||
        newFormData.banDurationDays !== policies.banDurationDays
      : true;

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
      // Validate policies
      const errors = validatePolicies(formData);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Update policies
      await updatePolicies(formData);
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
    if (!policies) return;

    try {
      const defaultSettings = {
        minCancellationHours: 4,
        maxMonthlyCancellations: 3,
        maxMonthlyNoShows: 2,
        enablePolicyEnforcement: true,
        policyWarningMessage: DEFAULT_POLICY_WARNING_MESSAGE,
        gracePeriodDays: 0,
        autoBanEnabled: false,
        banDurationDays: 30
      };

      await updatePolicies(defaultSettings);
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
            <span className="text-[var(--theme-foregroundSecondary)]">İptal ve gelmeme politikaları yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--theme-backgroundSecondary)] rounded-xl p-6 border border-[var(--theme-border)] transition-colors duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-[var(--theme-warning)]/10 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-[var(--theme-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">İptal ve Gelmeme Politikaları</h3>
          <p className="text-sm text-[var(--theme-foregroundSecondary)] mt-1">
            Müşteri randevu iptal ve gelmeme kurallarını yapılandırın
          </p>
        </div>
      </div>

      {/* Danger Warning */}
      <div className="mb-6 p-4 bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-5 h-5 mt-0.5">
            <svg className="w-5 h-5 text-[var(--theme-error)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--theme-error)] mb-1">Önemli Uyarı</h4>
            <p className="text-xs text-[var(--theme-error)] leading-relaxed">
              {formData.policyWarningMessage}
            </p>
          </div>
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
        {/* Enable Policy Enforcement */}
        <div className="flex items-center justify-between p-4 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)]">
          <div>
            <p className="text-sm font-medium text-[var(--theme-foreground)]">Politika Uygulamasını Aktif Et</p>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              İptal ve gelmeme politikalarını zorla
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enablePolicyEnforcement}
              onChange={(e) => handleInputChange('enablePolicyEnforcement', e.target.checked)}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-success)]"></div>
          </label>
        </div>

        {/* Min Cancellation Hours */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Randevu İptali İçin Minimum Süre
          </label>
          <select
            value={formData.minCancellationHours}
            onChange={(e) => handleInputChange('minCancellationHours', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
          >
            {MIN_CANCELLATION_HOURS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Randevudan kaç saat önce iptal edilebilir
          </p>
        </div>

        {/* Max Monthly Cancellations */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Maksimum İptal Sayısı (Aylık)
          </label>
          <select
            value={formData.maxMonthlyCancellations}
            onChange={(e) => handleInputChange('maxMonthlyCancellations', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
          >
            {MAX_MONTHLY_CANCELLATIONS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Müşteri ayda kaç kez iptal edebilir
          </p>
        </div>

        {/* Max Monthly No-Shows */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Maksimum Gelmeme Sayısı (Aylık)
          </label>
          <select
            value={formData.maxMonthlyNoShows}
            onChange={(e) => handleInputChange('maxMonthlyNoShows', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
          >
            {MAX_MONTHLY_NO_SHOWS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Müşteri ayda kaç kez randevuya gelmeyebilir
          </p>
        </div>

        {/* Grace Period Days */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Yeni Müşteriler İçin Deneme Süresi
          </label>
          <select
            value={formData.gracePeriodDays}
            onChange={(e) => handleInputChange('gracePeriodDays', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
          >
            {GRACE_PERIOD_DAYS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Yeni müşteriler bu süre boyunca politikalardan muaf tutulur
          </p>
        </div>

        {/* Auto Ban Enabled */}
        <div className="flex items-center justify-between p-4 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)]">
          <div>
            <p className="text-sm font-medium text-[var(--theme-foreground)]">Otomatik Engelleme</p>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Limitleri aşan müşterileri otomatik olarak engelle
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoBanEnabled}
              onChange={(e) => handleInputChange('autoBanEnabled', e.target.checked)}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--theme-backgroundSecondary)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-error)]"></div>
          </label>
        </div>

        {/* Ban Duration Days - Only show if autoBanEnabled */}
        {formData.autoBanEnabled && (
          <div>
            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
              Engelleme Süresi
            </label>
            <select
              value={formData.banDurationDays}
              onChange={(e) => handleInputChange('banDurationDays', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
              disabled={isUpdating}
            >
              {BAN_DURATION_DAYS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Engellenen müşteriler bu süre boyunca randevu alamaz
            </p>
          </div>
        )}

        {/* Policy Warning Message */}
        <div>
          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
            Politika Uyarı Mesajı
          </label>
          <textarea
            value={formData.policyWarningMessage}
            onChange={(e) => handleInputChange('policyWarningMessage', e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors"
            disabled={isUpdating}
            placeholder="Müşterilere gösterilecek uyarı mesajını girin..."
          />
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Maksimum 500 karakter ({formData.policyWarningMessage.length}/500)
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
      {policies && (
        <div className="mt-6 p-4 bg-[var(--theme-background)] rounded-lg border border-[var(--theme-border)]">
          <h4 className="text-sm font-semibold text-[var(--theme-foreground)] mb-3">Mevcut Ayarlar</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Minimum İptal Süresi:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {getMinCancellationHoursDisplayValue(policies.minCancellationHours)}
              </p>
            </div>
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Maksimum Aylık İptal:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {getMaxMonthlyCancellationsDisplayValue(policies.maxMonthlyCancellations)}
              </p>
            </div>
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Maksimum Aylık Gelmeme:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {getMaxMonthlyNoShowsDisplayValue(policies.maxMonthlyNoShows)}
              </p>
            </div>
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Politika Uygulaması:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {policies.enablePolicyEnforcement ? 'Aktif' : 'Pasif'}
              </p>
            </div>
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Deneme Süresi:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {getGracePeriodDaysDisplayValue(policies.gracePeriodDays)}
              </p>
            </div>
            <div>
              <span className="text-[var(--theme-foregroundSecondary)]">Otomatik Engelleme:</span>
              <p className="font-medium text-[var(--theme-foreground)]">
                {policies.autoBanEnabled ? `Aktif (${getBanDurationDaysDisplayValue(policies.banDurationDays)})` : 'Pasif'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancellationPolicySettings;
