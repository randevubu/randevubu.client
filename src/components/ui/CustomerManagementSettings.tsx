'use client';

import { useState, useEffect } from 'react';
import { useCustomerManagement } from '@/src/lib/hooks/useCustomerManagement';
import {
  ACTIVE_CUSTOMER_MONTHS_OPTIONS,
  LOYALTY_APPOINTMENTS_OPTIONS,
  NOTE_LENGTH_OPTIONS,
  BIRTHDAY_REMINDER_DAYS_OPTIONS,
  UpdateCustomerManagementSettingsRequest
} from '@/src/types/customerManagement';

interface CustomerManagementSettingsProps {
  onSettingsUpdated?: () => void;
}

export default function CustomerManagementSettings({
  onSettingsUpdated
}: CustomerManagementSettingsProps) {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    saveError,
    validationErrors,
    updateSettings
  } = useCustomerManagement();

  // Local state for form values
  const [activeMonths, setActiveMonths] = useState(3);
  const [activeCustomerEnabled, setActiveCustomerEnabled] = useState(true);
  const [loyaltyThreshold, setLoyaltyThreshold] = useState(5);
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [allowStaffNotes, setAllowStaffNotes] = useState(true);
  const [allowInternalNotes, setAllowInternalNotes] = useState(true);
  const [maxNoteLength, setMaxNoteLength] = useState(1000);
  const [allowCustomerView, setAllowCustomerView] = useState(true);
  const [showCancelled, setShowCancelled] = useState(true);
  const [showNoShow, setShowNoShow] = useState(false);
  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [birthdayReminderDays, setBirthdayReminderDays] = useState<number[]>([1, 3, 7]);
  const [birthdayMessage, setBirthdayMessage] = useState('Doğum gününüz kutlu olsun! Size özel indirimli randevu fırsatı için bizimle iletişime geçin.');
  const [evaluationsEnabled, setEvaluationsEnabled] = useState(false);
  const [requiredForCompletion, setRequiredForCompletion] = useState(false);
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form with fetched settings
  useEffect(() => {
    if (settings) {
      setActiveMonths(settings.activeCustomerDefinition.monthsThreshold);
      setActiveCustomerEnabled(settings.activeCustomerDefinition.enabled);
      setLoyaltyThreshold(settings.loyaltyProgram.appointmentThreshold);
      setLoyaltyEnabled(settings.loyaltyProgram.enabled);
      setAllowStaffNotes(settings.customerNotes.allowStaffNotes);
      setAllowInternalNotes(settings.customerNotes.allowInternalNotes);
      setMaxNoteLength(settings.customerNotes.maxNoteLength);
      setAllowCustomerView(settings.appointmentHistory.allowCustomerView);
      setShowCancelled(settings.appointmentHistory.showCancelledAppointments);
      setShowNoShow(settings.appointmentHistory.showNoShowAppointments);
      setBirthdayEnabled(settings.birthdayReminders.enabled);
      setBirthdayReminderDays(settings.birthdayReminders.reminderDays);
      setBirthdayMessage(settings.birthdayReminders.messageTemplate);
      setEvaluationsEnabled(settings.customerEvaluations.enabled);
      setRequiredForCompletion(settings.customerEvaluations.requiredForCompletion);
      setAllowAnonymous(settings.customerEvaluations.allowAnonymous);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      const updates: UpdateCustomerManagementSettingsRequest = {
        activeCustomerDefinition: {
          monthsThreshold: activeMonths,
          enabled: activeCustomerEnabled
        },
        loyaltyProgram: {
          appointmentThreshold: loyaltyThreshold,
          enabled: loyaltyEnabled
        },
        customerNotes: {
          allowStaffNotes,
          allowInternalNotes,
          maxNoteLength
        },
        appointmentHistory: {
          allowCustomerView,
          showCancelledAppointments: showCancelled,
          showNoShowAppointments: showNoShow
        },
        birthdayReminders: {
          enabled: birthdayEnabled,
          reminderDays: birthdayReminderDays,
          messageTemplate: birthdayMessage
        },
        customerEvaluations: {
          enabled: evaluationsEnabled,
          requiredForCompletion,
          allowAnonymous,
          questions: settings?.customerEvaluations.questions || []
        }
      };

      await updateSettings(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const toggleReminderDay = (day: number) => {
    setBirthdayReminderDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--theme-card)] rounded-lg p-6 border border-[var(--theme-border)]">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--theme-card)] rounded-lg p-6 border border-[var(--theme-border)]">
        <div className="text-[var(--theme-error)] text-center py-8">
          <p className="font-semibold mb-2">Ayarlar yüklenemedi</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--theme-card)] rounded-lg p-6 border border-[var(--theme-border)] space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">Müşteri Yönetimi</h3>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">✓ Ayarlar başarıyla kaydedildi</p>
        </div>
      )}

      {/* Error Messages */}
      {(saveError || validationErrors.length > 0) && (
        <div className="bg-[var(--theme-error)]/5 border border-[var(--theme-error)]/20 rounded-lg p-4">
          <p className="text-[var(--theme-error)] text-sm font-semibold mb-2">Kaydetme Hatası</p>
          {saveError && <p className="text-[var(--theme-error)] text-sm">{saveError.message}</p>}
          {validationErrors.map((err, idx) => (
            <p key={idx} className="text-[var(--theme-error)] text-sm">{err}</p>
          ))}
        </div>
      )}

      {/* Active Customer Definition */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[var(--theme-foreground)]">
              Aktif Müşteri Tanımı
            </label>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Son kaç ay içinde randevusu olan müşteriler aktif kabul edilir
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveCustomerEnabled(!activeCustomerEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              activeCustomerEnabled ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                activeCustomerEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {activeCustomerEnabled && (
          <select
            value={activeMonths}
            onChange={(e) => setActiveMonths(Number(e.target.value))}
            className="w-full p-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] text-sm"
          >
            {ACTIVE_CUSTOMER_MONTHS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Loyalty Program */}
      <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[var(--theme-foreground)]">
              Sadakat Programı
            </label>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Kaç randevu sonrası müşteri sadık müşteri olarak kabul edilir
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLoyaltyEnabled(!loyaltyEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              loyaltyEnabled ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                loyaltyEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {loyaltyEnabled && (
          <select
            value={loyaltyThreshold}
            onChange={(e) => setLoyaltyThreshold(Number(e.target.value))}
            className="w-full p-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] text-sm"
          >
            {LOYALTY_APPOINTMENTS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Customer Notes */}
      <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
        <div>
          <label className="text-sm font-medium text-[var(--theme-foreground)]">
            Müşteri Notları
          </label>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Personel ve dahili notlar için ayarlar
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--theme-foreground)]">Personel notlarına izin ver</span>
            <button
              type="button"
              onClick={() => setAllowStaffNotes(!allowStaffNotes)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                allowStaffNotes ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  allowStaffNotes ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--theme-foreground)]">Dahili notlara izin ver</span>
            <button
              type="button"
              onClick={() => setAllowInternalNotes(!allowInternalNotes)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                allowInternalNotes ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  allowInternalNotes ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          <div className="mt-2">
            <label className="text-xs text-[var(--theme-foregroundSecondary)]">
              Maksimum not uzunluğu
            </label>
            <select
              value={maxNoteLength}
              onChange={(e) => setMaxNoteLength(Number(e.target.value))}
              className="w-full p-2 mt-1 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] text-sm"
            >
              {NOTE_LENGTH_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
        <div>
          <label className="text-sm font-medium text-[var(--theme-foreground)]">
            Randevu Geçmişi
          </label>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
            Müşterilerin kendi randevu geçmişlerini görebilme ayarları
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--theme-foreground)]">Müşterilerin görüntülemesine izin ver</span>
            <button
              type="button"
              onClick={() => setAllowCustomerView(!allowCustomerView)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                allowCustomerView ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  allowCustomerView ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {allowCustomerView && (
            <>
              <label className="flex items-center justify-between">
                <span className="text-sm text-[var(--theme-foreground)]">İptal edilen randevuları göster</span>
                <button
                  type="button"
                  onClick={() => setShowCancelled(!showCancelled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showCancelled ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showCancelled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-[var(--theme-foreground)]">Gelmeme kayıtlarını göster</span>
                <button
                  type="button"
                  onClick={() => setShowNoShow(!showNoShow)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showNoShow ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showNoShow ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Birthday Reminders */}
      <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[var(--theme-foreground)]">
              Doğum Günü Hatırlatıcıları
            </label>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Müşterilerin doğum günlerinde otomatik hatırlatıcı gönder
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBirthdayEnabled(!birthdayEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              birthdayEnabled ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                birthdayEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {birthdayEnabled && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--theme-foregroundSecondary)] mb-2 block">
                Hatırlatma günleri (birden fazla seçebilirsiniz)
              </label>
              <div className="flex flex-wrap gap-2">
                {BIRTHDAY_REMINDER_DAYS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleReminderDay(option.value)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      birthdayReminderDays.includes(option.value)
                        ? 'bg-[var(--theme-primary)] text-white'
                        : 'bg-[var(--theme-background)] border border-[var(--theme-border)] text-[var(--theme-foreground)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--theme-foregroundSecondary)] mb-2 block">
                Mesaj şablonu
              </label>
              <textarea
                value={birthdayMessage}
                onChange={(e) => setBirthdayMessage(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full p-2 border border-[var(--theme-border)] rounded-lg bg-[var(--theme-background)] text-[var(--theme-foreground)] text-sm resize-none"
                placeholder="Doğum günü mesajı şablonu..."
              />
              <p className="text-xs text-[var(--theme-foregroundMuted)] mt-1">
                {birthdayMessage.length}/500 karakter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Customer Evaluations */}
      <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-[var(--theme-foreground)]">
              Müşteri Değerlendirmeleri
            </label>
            <p className="text-xs text-[var(--theme-foregroundSecondary)] mt-1">
              Randevu sonrası müşteri geri bildirimi toplama
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEvaluationsEnabled(!evaluationsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              evaluationsEnabled ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                evaluationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {evaluationsEnabled && (
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--theme-foreground)]">Randevu tamamlama için zorunlu</span>
              <button
                type="button"
                onClick={() => setRequiredForCompletion(!requiredForCompletion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  requiredForCompletion ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    requiredForCompletion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-[var(--theme-foreground)]">Anonim değerlendirmeye izin ver</span>
              <button
                type="button"
                onClick={() => setAllowAnonymous(!allowAnonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowAnonymous ? 'bg-[var(--theme-primary)]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowAnonymous ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-[var(--theme-border)]">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[var(--theme-primary)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--theme-primaryHover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Kaydediliyor...
            </span>
          ) : (
            'Ayarları Kaydet'
          )}
        </button>
      </div>
    </div>
  );
}
