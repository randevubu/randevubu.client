'use client';

import React, { useState, useEffect } from 'react';
import { businessService } from '../../lib/services/business';
import { StaffPrivacySettings, StaffPrivacySettingsRequest } from '../../types/staffPrivacy';
import { handleApiError, showSuccessToast } from '../../lib/utils/toast';
import { 
  getPreviewDisplayNames, 
  validateCustomLabels, 
  getDisplayModeLabel,
  getRoleDisplayNameForUI 
} from '../../lib/utils/staffDisplay';

interface StaffPrivacySettingsProps {
  onSettingsUpdated?: () => void;
}

export const StaffPrivacySettings: React.FC<StaffPrivacySettingsProps> = ({ 
  onSettingsUpdated 
}) => {
  const [settings, setSettings] = useState<StaffPrivacySettings>({
    hideStaffNames: false,
    staffDisplayMode: 'NAMES',
    customStaffLabels: {
      owner: 'Sahip',
      manager: 'Müdür',
      staff: 'Personel',
      receptionist: 'Resepsiyonist'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-save with debouncing
  useEffect(() => {
    if (!hasChanges || loading) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [settings, hasChanges, loading]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await businessService.getStaffPrivacySettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load staff privacy settings:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (showToast = true) => {
    // Validate custom labels if in GENERIC mode
    if (settings.hideStaffNames && settings.staffDisplayMode === 'GENERIC') {
      const validation = validateCustomLabels(settings.customStaffLabels);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }
    }
    
    setValidationErrors({});

    try {
      setSaving(true);
      const updateData: StaffPrivacySettingsRequest = {
        hideStaffNames: settings.hideStaffNames,
        staffDisplayMode: settings.staffDisplayMode,
        customStaffLabels: settings.customStaffLabels
      };

      const response = await businessService.updateStaffPrivacySettings(updateData);
      if (response.success) {
        if (showToast) {
          showSuccessToast('Personel gizlilik ayarları güncellendi');
        }
        setHasChanges(false);
        onSettingsUpdated?.();
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Failed to save staff privacy settings:', error);
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHideNames = (hide: boolean) => {
    setSettings(prev => ({
      ...prev,
      hideStaffNames: hide,
      // Reset to NAMES mode when disabling privacy
      staffDisplayMode: hide ? prev.staffDisplayMode : 'NAMES'
    }));
    setValidationErrors({});
    setHasChanges(true);
  };

  const handleDisplayModeChange = (mode: 'NAMES' | 'ROLES' | 'GENERIC') => {
    setSettings(prev => ({
      ...prev,
      staffDisplayMode: mode
    }));
    setValidationErrors({});
    setHasChanges(true);
  };

  const handleLabelChange = (role: keyof StaffPrivacySettings['customStaffLabels'], value: string) => {
    setSettings(prev => ({
      ...prev,
      customStaffLabels: {
        ...prev.customStaffLabels,
        [role]: value
      }
    }));
    
    // Clear validation error for this field
    if (validationErrors[role]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[role];
        return newErrors;
      });
    }
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)]">Ayarlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  const previewData = getPreviewDisplayNames(settings);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Privacy Toggle */}
      <div className="bg-[var(--theme-backgroundSecondary)] rounded-xl p-4 sm:p-6 border border-[var(--theme-border)] transition-colors duration-300">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[var(--theme-primary)]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--theme-foreground)]">Personel Gizlilik Ayarları</h3>
            <p className="text-xs sm:text-sm text-[var(--theme-foregroundSecondary)] mt-1 leading-relaxed">
              Müşterilerin personel isimlerini görmesini kontrol edin
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Hide Names Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-[var(--theme-background)] rounded-lg border border-[var(--theme-border)] space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-[var(--theme-foreground)] mb-1">
                Personel isimlerini gizle
              </h4>
              <p className="text-xs text-[var(--theme-foregroundSecondary)] leading-relaxed">
                Müşteriler personel isimlerini görmek yerine genel etiketler görecek
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 self-start sm:self-center">
              <input
                type="checkbox"
                checked={settings.hideStaffNames}
                onChange={(e) => handleToggleHideNames(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--theme-primary)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--theme-primary)]"></div>
            </label>
          </div>

          {/* Display Mode Selection */}
          {settings.hideStaffNames && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[var(--theme-foreground)]">Görüntüleme Modu</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['ROLES', 'GENERIC'] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`relative flex cursor-pointer rounded-lg p-3 sm:p-4 border-2 transition-all ${
                      settings.staffDisplayMode === mode
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/5'
                        : 'border-[var(--theme-border)] hover:border-[var(--theme-borderSecondary)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="displayMode"
                      value={mode}
                      checked={settings.staffDisplayMode === mode}
                      onChange={() => handleDisplayModeChange(mode)}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--theme-foreground)]">
                        {getDisplayModeLabel(mode)}
                      </div>
                      <div className="text-xs text-[var(--theme-foregroundSecondary)] mt-1 leading-relaxed">
                        {mode === 'ROLES' 
                          ? 'Sahip, Müdür, Personel gibi roller'
                          : 'Özel etiketler kullan'
                        }
                      </div>
                    </div>
                    {settings.staffDisplayMode === mode && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Labels */}
          {settings.hideStaffNames && settings.staffDisplayMode === 'GENERIC' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[var(--theme-foreground)]">Özel Etiketler</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {Object.entries(settings.customStaffLabels).map(([role, label]) => (
                  <div key={role} className="min-w-0">
                    <label className="block text-xs font-medium text-[var(--theme-foregroundSecondary)] mb-2">
                      {getRoleDisplayNameForUI(role.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => handleLabelChange(role as keyof StaffPrivacySettings['customStaffLabels'], e.target.value)}
                      maxLength={50}
                      className={`w-full px-3 py-2 border rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] transition-colors text-sm ${
                        validationErrors[role] 
                          ? 'border-red-500' 
                          : 'border-[var(--theme-border)]'
                      }`}
                      placeholder={`${getRoleDisplayNameForUI(role.toUpperCase())} etiketi`}
                    />
                    {validationErrors[role] && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors[role]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {settings.hideStaffNames && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[var(--theme-foreground)]">Önizleme</h4>
              <div className="bg-[var(--theme-background)] rounded-lg p-3 sm:p-4 border border-[var(--theme-border)]">
                <p className="text-xs text-[var(--theme-foregroundSecondary)] mb-3">
                  Müşteriler şunları görecek:
                </p>
                <div className="space-y-2">
                  {previewData.map(({ role, roleDisplayName, displayName }) => (
                    <div key={role} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--theme-foregroundSecondary)] truncate pr-2">{roleDisplayName}:</span>
                      <span className="font-medium text-[var(--theme-foreground)] truncate">{displayName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {hasChanges && (
        <div className="flex items-center justify-center space-x-2 text-sm text-[var(--theme-foregroundSecondary)]">
          <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full animate-pulse"></div>
          <span>Değişiklikler otomatik kaydediliyor...</span>
        </div>
      )}
    </div>
  );
};
