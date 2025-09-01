'use client';

import { useState, useEffect } from 'react';
import { businessService } from '../../lib/services/business';
import { handleApiError } from '../../lib/utils/toast';
import {
  EnhancedClosureData,
  NotificationChannel,
  RecurringPattern,
  ClosureFormData,
  ClosureValidationErrors,
  ClosureImpactPreview
} from '../../types/business';
import { ClosureType } from '../../types/enums';
import {
  validateClosureForm,
  validateClosureField,
  validateDateRange,
  validateNotificationSettings,
  createDebouncedValidator,
  CreateEnhancedClosureData
} from '../../lib/validation/closure';

interface ClosureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTimeSlots: string[];
  selectedDate: string;
  onClosureCreated: () => void;
  availableServices?: Array<{ id: string; name: string }>;
}

const CLOSURE_TYPES = [
  { value: ClosureType.VACATION, label: 'Tatil', icon: '🏖️' },
  { value: ClosureType.MAINTENANCE, label: 'Bakım', icon: '🔧' },
  { value: ClosureType.EMERGENCY, label: 'Acil Durum', icon: '🚨' },
  { value: ClosureType.HOLIDAY, label: 'Resmi Tatil', icon: '🎉' },
  { value: ClosureType.STAFF_SHORTAGE, label: 'Personel Yetersizliği', icon: '👥' },
  { value: ClosureType.OTHER, label: 'Diğer', icon: '📝' },
] as const;

// Helper function to get Turkish label for closure type
const getClosureTypeLabel = (type: ClosureType): string => {
  const closureType = CLOSURE_TYPES.find(ct => ct.value === type);
  return closureType ? closureType.label : type;
};

const NOTIFICATION_CHANNELS = [
  { value: 'EMAIL', label: 'E-posta', icon: '📧' },
  { value: 'SMS', label: 'SMS', icon: '💬' },
  { value: 'PUSH', label: 'Uygulama Bildirimi', icon: '🔔' },
] as const;

const RECURRING_FREQUENCIES = [
  { value: 'WEEKLY', label: 'Haftalık' },
  { value: 'MONTHLY', label: 'Aylık' },
  { value: 'YEARLY', label: 'Yıllık' },
] as const;

export default function ClosureDialog({ 
  isOpen, 
  onClose, 
  selectedTimeSlots, 
  selectedDate,
  onClosureCreated,
  availableServices = []
}: ClosureDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [impactPreview, setImpactPreview] = useState<ClosureImpactPreview | null>(null);
  const [errors, setErrors] = useState<ClosureValidationErrors>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Helper function to generate datetime from date and time
  const generateDateTime = (date: string, time: string) => {
    return `${date}T${time}:00`;
  };

  // Helper function to get start and end times from selected slots
  const getTimeRangeFromSlots = () => {
    if (selectedTimeSlots.length === 0) {
      return { startTime: '09:00', endTime: '17:00' }; // Default business hours
    }
    
    const sorted = [...selectedTimeSlots].sort();
    const startTime = sorted[0];
    
    // Calculate end time: last slot + 15 minutes (since each slot is 15 minutes)
    const lastSlot = sorted[sorted.length - 1];
    const [hours, minutes] = lastSlot.split(':').map(Number);
    const endMinutes = minutes + 15;
    const endHours = endMinutes >= 60 ? hours + 1 : hours;
    const finalMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
    const endTime = `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
    
    return { startTime, endTime };
  };

  const timeRange = getTimeRangeFromSlots();
  
  const [formData, setFormData] = useState<ClosureFormData>({
    type: ClosureType.VACATION,
    reason: '',
    startDate: generateDateTime(selectedDate, timeRange.startTime),
    endDate: generateDateTime(selectedDate, timeRange.endTime),
    notifyCustomers: true,
    notificationMessage: '',
    notificationChannels: ['EMAIL'],
    affectedServices: [],
    isRecurring: false,
    recurringPattern: undefined,
    customClosureType: '',
    additionalNotes: ''
  });

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Update form data when selectedDate or selectedTimeSlots change
  useEffect(() => {
    const newTimeRange = getTimeRangeFromSlots();
    setFormData(prev => ({
      ...prev,
      startDate: generateDateTime(selectedDate, newTimeRange.startTime),
      endDate: generateDateTime(selectedDate, newTimeRange.endTime)
    }));
  }, [selectedDate, selectedTimeSlots]);

  // Generate default notification message based on closure type
  useEffect(() => {
    if (formData.notifyCustomers && !formData.notificationMessage) {
      const defaultMessages: Record<ClosureType, string> = {
        [ClosureType.VACATION]: 'İşletmemiz tatil nedeniyle kapalı olacaktır. Randevunuzu yeniden planlamak için lütfen bizimle iletişime geçin.',
        [ClosureType.MAINTENANCE]: 'Bakım çalışmaları nedeniyle geçici olarak kapalıyız. En kısa sürede hizmetinizde olacağız.',
        [ClosureType.EMERGENCY]: 'Beklenmedik bir durum nedeniyle geçici olarak kapalıyız. Anlayışınız için teşekkür ederiz.',
        [ClosureType.HOLIDAY]: 'Resmi tatil nedeniyle kapalıyız. Takip eden iş günü hizmetinizdeyiz.',
        [ClosureType.STAFF_SHORTAGE]: 'Personel yetersizliği nedeniyle geçici olarak kapalıyız. En kısa sürede normal hizmetimize dönüyoruz.',
        [ClosureType.OTHER]: 'İşletmemiz geçici olarak kapalı olacaktır. Randevularınız için alternatif tarih önerileri sunacağız.'
      };
      setFormData(prev => ({
        ...prev,
        notificationMessage: defaultMessages[formData.type]
      }));
    }
  }, [formData.type, formData.notifyCustomers]);

  // Load impact preview when form changes (only when dialog is open)
  useEffect(() => {
    if (!isOpen) {
      setImpactPreview(null);
      return;
    }

    const loadImpactPreview = async () => {
      if (formData.startDate && formData.endDate) {
        try {
          // This will be implemented later with the backend method
          const preview = await businessService.getClosureImpactPreview?.({
            startDate: formData.startDate,
            endDate: formData.endDate,
            affectedServices: formData.affectedServices
          });
          setImpactPreview(preview || null);
        } catch (error) {
          // Silently handle - preview is optional
          setImpactPreview(null);
        }
      }
    };

    const debounceTimer = setTimeout(loadImpactPreview, 500);
    return () => clearTimeout(debounceTimer);
  }, [isOpen, formData.startDate, formData.endDate, formData.affectedServices]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const validationData: CreateEnhancedClosureData = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.type === ClosureType.OTHER ? (formData.additionalNotes || 'Özel kapatma') : getClosureTypeLabel(formData.type),
      type: formData.type,
      notifyCustomers: formData.notifyCustomers,
      notificationMessage: formData.notificationMessage,
      notificationChannels: formData.notificationChannels,
      affectedServices: formData.affectedServices,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.recurringPattern
    };

    const validation = validateClosureForm(validationData, true);
    
    // Convert Zod errors to our error format
    const newErrors: ClosureValidationErrors = {};
    
    if (validation.errors.reason) newErrors.reason = validation.errors.reason;
    if (validation.errors.startDate) newErrors.startDate = validation.errors.startDate;
    if (validation.errors.endDate) newErrors.endDate = validation.errors.endDate;
    if (validation.errors.notificationMessage) newErrors.notificationMessage = validation.errors.notificationMessage;
    if (validation.errors.notificationChannels) newErrors.general = validation.errors.notificationChannels;
    if (validation.fieldErrors?.['recurringPattern.interval']) newErrors.recurringPattern = validation.fieldErrors['recurringPattern.interval'];
    
    // Add any general validation errors
    if (!validation.isValid && Object.keys(newErrors).length === 0) {
      newErrors.general = 'Lütfen tüm alanları doğru şekilde doldurun';
    }
    
    setErrors(newErrors);
    setFieldErrors(validation.fieldErrors || {});
    return validation.isValid;
  };

  // Real-time field validation
  const validateField = (fieldName: keyof CreateEnhancedClosureData, value: any) => {
    const error = validateClosureField(fieldName, value, formData as Partial<CreateEnhancedClosureData>);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error;
  };

  // Create debounced validator for performance
  const debouncedValidator = createDebouncedValidator(validateClosureForm, 500);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const enhancedClosureData: EnhancedClosureData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.type === ClosureType.OTHER ? (formData.additionalNotes || 'Özel kapatma').trim() : getClosureTypeLabel(formData.type),
        type: formData.type,
        notifyCustomers: formData.notifyCustomers,
        notificationMessage: formData.notificationMessage.trim(),
        notificationChannels: formData.notificationChannels,
        affectedServices: formData.affectedServices,
        isRecurring: formData.isRecurring,
        recurringPattern: formData.recurringPattern
      };
      
      // Use current working endpoint for now - enhanced features will be implemented later
      await businessService.createClosure({
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.type === ClosureType.OTHER ? (formData.additionalNotes || 'Özel kapatma').trim() : getClosureTypeLabel(formData.type),
        type: formData.type
      });
      
      // TODO: Implement enhanced closure creation when backend is ready
      // await businessService.createEnhancedClosure(enhancedClosureData);
      
      onClosureCreated();
      handleClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    const newTimeRange = getTimeRangeFromSlots();
    setFormData({
      type: ClosureType.VACATION,
      reason: '',
      startDate: generateDateTime(selectedDate, newTimeRange.startTime),
      endDate: generateDateTime(selectedDate, newTimeRange.endTime),
      notifyCustomers: true,
      notificationMessage: '',
      notificationChannels: ['EMAIL'],
      affectedServices: [],
      isRecurring: false,
      recurringPattern: undefined,
      customClosureType: '',
      additionalNotes: ''
    });
    setErrors({});
    setFieldErrors({});
    setShowAdvanced(false);
    setImpactPreview(null);
    setIsValidating(false);
    onClose();
  };

  const updateFormData = (updates: Partial<ClosureFormData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Real-time validation for changed fields
    Object.keys(updates).forEach(key => {
      const fieldName = key as keyof CreateEnhancedClosureData;
      if (fieldName in updates) {
        // Clear previous error for this field
        setErrors(prev => ({ ...prev, [fieldName]: undefined }));
        
        // Validate specific field scenarios
        if (fieldName === 'endDate' && newData.startDate && updates.endDate) {
          const dateError = validateDateRange(newData.startDate, updates.endDate);
          if (dateError) {
            setErrors(prev => ({ ...prev, endDate: dateError }));
          }
        }
        
        if (fieldName === 'notificationMessage' || fieldName === 'notificationChannels') {
          const notificationError = validateNotificationSettings(
            newData.notifyCustomers,
            newData.notificationChannels,
            newData.notificationMessage
          );
          if (notificationError) {
            const errorField = fieldName === 'notificationChannels' ? 'general' : 'notificationMessage';
            setErrors(prev => ({ ...prev, [errorField]: notificationError }));
          }
        }
      }
    });
  };

  const toggleNotificationChannel = (channel: NotificationChannel) => {
    const channels = formData.notificationChannels.includes(channel)
      ? formData.notificationChannels.filter(c => c !== channel)
      : [...formData.notificationChannels, channel];
    updateFormData({ notificationChannels: channels });
  };

  const toggleService = (serviceId: string) => {
    const services = formData.affectedServices.includes(serviceId)
      ? formData.affectedServices.filter(s => s !== serviceId)
      : [...formData.affectedServices, serviceId];
    updateFormData({ affectedServices: services });
  };

  const formatTimeSlots = () => {
    if (selectedTimeSlots.length === 0) return '';
    if (selectedTimeSlots.length === 1) return selectedTimeSlots[0];
    
    const sorted = [...selectedTimeSlots].sort();
    return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
  };

  // Helper functions to extract date and time from datetime string
  const getDateFromDateTime = (datetime: string) => {
    return datetime.split('T')[0];
  };

  const getTimeFromDateTime = (datetime: string) => {
    return datetime.split('T')[1]?.split(':').slice(0, 2).join(':') || '09:00';
  };

  // Helper function to format datetime for display
  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get current datetime in correct format
  const getCurrentDateTime = () => {
    const now = new Date();
    // Round up to next 15-minute interval
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundedMinutes, 0, 0);
    return now.toISOString().slice(0, 16);
  };

  // Helper function to validate if datetime is in the future
  const isDateTimeInFuture = (dateTime: string) => {
    const selected = new Date(dateTime);
    const now = new Date();
    return selected > now;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-[var(--theme-card)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--theme-border)] transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--theme-foreground)]">
              İş Yeri Kapatma
            </h2>
            <button
              onClick={handleClose}
              className="text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-foreground)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="text-sm text-[var(--theme-foregroundSecondary)] space-y-1">
              <div>Kapatma Süresi: <span className="font-medium text-[var(--theme-foreground)]">{formatDateTime(formData.startDate)}</span>
                {formData.startDate !== formData.endDate && (
                  <span> - <span className="font-medium text-[var(--theme-foreground)]">{formatDateTime(formData.endDate)}</span></span>
                )}
              </div>
              {selectedTimeSlots.length > 0 && (
                <div className="text-xs text-[var(--theme-foregroundMuted)]">Seçilen Zaman Aralığı: {formatTimeSlots()}</div>
              )}
              {impactPreview !== null && (
                <div className={`mt-2 p-3 rounded-md border transition-colors duration-300 ${
                  impactPreview.affectedAppointmentsCount === 0 && impactPreview.affectedCustomersCount === 0
                    ? 'bg-[var(--theme-success)]/10 border-[var(--theme-success)]/20'
                    : 'bg-[var(--theme-warning)]/10 border-[var(--theme-warning)]/20'
                }`}>
                  <div className={`text-sm ${
                    impactPreview.affectedAppointmentsCount === 0 && impactPreview.affectedCustomersCount === 0
                      ? 'text-[var(--theme-success)]'
                      : 'text-[var(--theme-warning)]'
                  }`}>
                    <div className="font-medium">Etki Önizlemesi:</div>
                    <div>• {impactPreview.affectedAppointmentsCount} randevu etkilenecek</div>
                    <div>• {impactPreview.affectedCustomersCount} müşteri bilgilendirilecek</div>
                    {impactPreview.affectedAppointmentsCount === 0 && impactPreview.affectedCustomersCount === 0 && (
                      <div className="text-xs mt-1 opacity-80">✓ Bu tarihte herhangi bir randevu bulunmuyor</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-3">
                Kapatma Türü
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CLOSURE_TYPES.map((closureType) => (
                  <button
                    key={closureType.value}
                    type="button"
                    onClick={() => updateFormData({ type: closureType.value })}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.type === closureType.value
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]'
                        : 'border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50 text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)]'
                    }`}
                  >
                    <div className="text-lg mb-1">{closureType.icon}</div>
                    <div>{closureType.label}</div>
                  </button>
                ))}
              </div>
              {errors.general && (
                <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.general}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDateTime" className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                  Başlangıç Tarihi ve Saati
                </label>
                <input
                  type="datetime-local"
                  id="startDateTime"
                  value={formData.startDate.slice(0, 16)} // Remove seconds for datetime-local
                  onChange={(e) => {
                    const newDateTime = `${e.target.value}:00`;
                    if (isDateTimeInFuture(newDateTime) || e.target.value === '') {
                      updateFormData({ startDate: newDateTime });
                    } else {
                      // Show error for past datetime
                      setErrors(prev => ({ 
                        ...prev, 
                        startDate: 'Başlangıç tarihi ve saati geçmişte olamaz' 
                      }));
                    }
                  }}
                  min={getCurrentDateTime()} // Prevent selecting past dates/times
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200 ${
                    errors.startDate ? 'border-[var(--theme-error)]' : 'border-[var(--theme-border)]'
                  }`}
                  onBlur={() => {
                    validateField('startDate', formData.startDate);
                    if (!isDateTimeInFuture(formData.startDate)) {
                      setErrors(prev => ({ 
                        ...prev, 
                        startDate: 'Başlangıç tarihi ve saati geçmişte olamaz' 
                      }));
                    }
                  }}
                  required
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="endDateTime" className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                  Bitiş Tarihi ve Saati
                </label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  value={formData.endDate.slice(0, 16)} // Remove seconds for datetime-local
                  onChange={(e) => {
                    const newDateTime = `${e.target.value}:00`;
                    const currentDateTime = getCurrentDateTime();
                    const startDateTime = formData.startDate;
                    
                    // Find the minimum required datetime (later of current time or start time)
                    const minRequiredDateTime = currentDateTime > startDateTime ? currentDateTime : startDateTime;
                    
                    if (new Date(newDateTime).getTime() >= new Date(minRequiredDateTime).getTime() || e.target.value === '') {
                      updateFormData({ endDate: newDateTime });
                    } else {
                      setErrors(prev => ({ 
                        ...prev, 
                        endDate: 'Bitiş tarihi başlangıç tarihinden sonra ve gelecekte olmalıdır' 
                      }));
                    }
                  }}
                  min={(() => {
                    const currentDateTime = getCurrentDateTime();
                    const startDateTime = formData.startDate.slice(0, 16);
                    // Compare datetime strings and return the later one
                    return currentDateTime > startDateTime ? currentDateTime : startDateTime;
                  })()}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200 ${
                    errors.endDate ? 'border-[var(--theme-error)]' : 'border-[var(--theme-border)]'
                  }`}
                  onBlur={() => {
                    validateField('endDate', formData.endDate);
                    if (formData.startDate) {
                      const dateError = validateDateRange(formData.startDate, formData.endDate);
                      if (dateError) {
                        setErrors(prev => ({ ...prev, endDate: dateError }));
                      }
                    }
                  }}
                  required
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* No separate reason field - using the details section for OTHER type */}

            {/* Additional fields for "Other" closure type */}
            {formData.type === ClosureType.OTHER && (
              <div className="space-y-4 border border-[var(--theme-warning)]/30 bg-[var(--theme-warning)]/10 rounded-lg p-4">
                <h4 className="text-sm font-medium text-[var(--theme-warning)] flex items-center">
                  <span className="text-lg mr-2">📝</span>
                  Özel Kapatma Detayları
                </h4>
                
                <div>
                  <label htmlFor="customClosureType" className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                    Kapatma Türü Adı
                  </label>
                  <input
                    type="text"
                    id="customClosureType"
                    value={formData.customClosureType || ''}
                    onChange={(e) => updateFormData({ customClosureType: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
                    placeholder="Örn: Özel Etkinlik, Eğitim, Renovasyon..."
                    maxLength={50}
                  />
                  <p className="mt-1 text-xs text-[var(--theme-foregroundMuted)">
                    Bu kapatmanın özel türünü belirtin (opsiyonel)
                  </p>
                </div>

                <div>
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                    Sebep
                  </label>
                  <textarea
                    id="additionalNotes"
                    value={formData.additionalNotes || ''}
                    onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
                    placeholder="Özel kapatma sebebini açıklayın..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-[var(--theme-foregroundMuted)">
                    Bu açıklama kapatma sebebi olarak kaydedilecektir
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[var(--theme-foreground)]">
                  Müşteri Bildirimleri
                </label>
                <button
                  type="button"
                  onClick={() => updateFormData({ notifyCustomers: !formData.notifyCustomers })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 ${
                    formData.notifyCustomers ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--theme-card)] shadow ring-0 transition duration-200 ease-in-out ${
                      formData.notifyCustomers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              {formData.notifyCustomers && (
                <div className="space-y-4 border border-[var(--theme-border)] rounded-lg p-4 bg-[var(--theme-backgroundSecondary)]">
                  <div>
                    <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
                      Bildirim Kanalları
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {NOTIFICATION_CHANNELS.map((channel) => (
                        <button
                          key={channel.value}
                          type="button"
                          onClick={() => toggleNotificationChannel(channel.value)}
                          className={`p-2 border-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                            formData.notificationChannels.includes(channel.value)
                              ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]'
                              : 'border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50 text-[var(--theme-foreground)] hover:bg-[var(--theme-card)]'
                          }`}
                        >
                          <div className="text-sm mb-1">{channel.icon}</div>
                          <div>{channel.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="notificationMessage" className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                      Bildirim Mesajı
                    </label>
                    <textarea
                      id="notificationMessage"
                      value={formData.notificationMessage}
                      onChange={(e) => updateFormData({ notificationMessage: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200 ${
                        errors.notificationMessage ? 'border-[var(--theme-error)]' : 'border-[var(--theme-border)]'
                      }`}
                      placeholder="Müşterilere gönderilecek mesajı yazın..."
                      onBlur={() => {
                        const notificationError = validateNotificationSettings(
                          formData.notifyCustomers,
                          formData.notificationChannels,
                          formData.notificationMessage
                        );
                        if (notificationError) {
                          setErrors(prev => ({ ...prev, notificationMessage: notificationError }));
                        }
                      }}
                    />
                    {errors.notificationMessage && (
                      <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.notificationMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primaryHover)] font-medium transition-colors duration-200"
              >
                <svg
                  className={`w-4 h-4 mr-1 transform transition-transform duration-200 ${
                    showAdvanced ? 'rotate-90' : 'rotate-0'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Gelişmiş Seçenekler
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4 border border-[var(--theme-border)] rounded-lg p-4 bg-[var(--theme-backgroundSecondary)]">
                  {availableServices.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-2">
                        Etkilenecek Hizmetler (Boş bırakırsanız tüm hizmetler etkilenir)
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableServices.map((service) => (
                          <label key={service.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.affectedServices.includes(service.id)}
                              onChange={() => toggleService(service.id)}
                              className="h-4 w-4 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] border-[var(--theme-border)] rounded bg-[var(--theme-card)]"
                            />
                            <span className="ml-2 text-sm text-[var(--theme-foreground)]">{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-[var(--theme-foreground)]">
                        Tekrarlanan Kapatma
                      </label>
                      <button
                        type="button"
                        onClick={() => updateFormData({ isRecurring: !formData.isRecurring })}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 ${
                          formData.isRecurring ? 'bg-[var(--theme-primary)]' : 'bg-[var(--theme-border)]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--theme-card)] shadow ring-0 transition duration-200 ease-in-out ${
                            formData.isRecurring ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {formData.isRecurring && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                              Sıklık
                            </label>
                            <select
                              value={formData.recurringPattern?.frequency || 'WEEKLY'}
                              onChange={(e) => updateFormData({
                                recurringPattern: {
                                  ...formData.recurringPattern,
                                  frequency: e.target.value as any,
                                  interval: formData.recurringPattern?.interval || 1
                                }
                              })}
                              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
                            >
                              {RECURRING_FREQUENCIES.map((freq) => (
                                <option key={freq.value} value={freq.value}>
                                  {freq.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                              Aralık
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="12"
                              value={formData.recurringPattern?.interval || 1}
                              onChange={(e) => updateFormData({
                                recurringPattern: {
                                  ...formData.recurringPattern,
                                  frequency: formData.recurringPattern?.frequency || 'WEEKLY',
                                  interval: parseInt(e.target.value)
                                }
                              })}
                              className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[var(--theme-foreground)] mb-1">
                            Tekrar Bitiş Tarihi (Opsiyonel)
                          </label>
                          <input
                            type="date"
                            value={formData.recurringPattern?.endDate || ''}
                            onChange={(e) => updateFormData({
                              recurringPattern: {
                                ...formData.recurringPattern,
                                frequency: formData.recurringPattern?.frequency || 'WEEKLY',
                                interval: formData.recurringPattern?.interval || 1,
                                endDate: e.target.value
                              }
                            })}
                            min={getDateFromDateTime(formData.endDate)}
                            className="w-full px-3 py-2 border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-[var(--theme-primary)] bg-[var(--theme-card)] text-[var(--theme-foreground)] transition-colors duration-200"
                          />
                        </div>
                        
                        {errors.recurringPattern && (
                          <p className="text-sm text-[var(--theme-error)]">{errors.recurringPattern}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-[var(--theme-border)]">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-[var(--theme-foreground)] bg-[var(--theme-backgroundSecondary)] hover:bg-[var(--theme-backgroundTertiary)] rounded-md transition-colors duration-200"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[var(--theme-error)] hover:bg-[var(--theme-error)]/90 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || isValidating}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Kapatılıyor...
                  </span>
                ) : (
                  `${formData.notifyCustomers ? 'Kapat ve Bildir' : 'Kapat'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}