'use client';

import { useState, useEffect } from 'react';
import { businessService } from '../../lib/services/business';
import { handleApiError, showSuccessToast } from '../../lib/utils/toast';

interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breaks?: Array<{
      startTime: string;
      endTime: string;
      description: string;
    }>;
  };
}


const DAYS = [
  { key: 'monday', label: 'Pazartesi' },
  { key: 'tuesday', label: 'Salı' },
  { key: 'wednesday', label: 'Çarşamba' },
  { key: 'thursday', label: 'Perşembe' },
  { key: 'friday', label: 'Cuma' },
  { key: 'saturday', label: 'Cumartesi' },
  { key: 'sunday', label: 'Pazar' }
];

interface BusinessHoursSettingsProps {
  businessId: string;
  onHoursUpdated?: () => void;
}

interface ValidationErrors {
  [key: string]: string;
}

// Helper function to create default hours
const createDefaultHours = (): BusinessHours => {
  const defaultHours: BusinessHours = {};
  DAYS.forEach(day => {
    defaultHours[day.key] = {
      isOpen: day.key !== 'sunday',
      openTime: '09:00',
      closeTime: '18:00',
      breaks: []
    };
  });
  return defaultHours;
};

export default function BusinessHoursSettings({ businessId, onHoursUpdated }: BusinessHoursSettingsProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(createDefaultHours());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (businessId) {
      loadBusinessHours();
    } else {
      setIsLoading(false);
    }
  }, [businessId]);

  const validateBusinessHours = (hours: BusinessHours): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Don't validate if hours object is empty or not properly initialized
    if (!hours || Object.keys(hours).length === 0) {
      return errors;
    }
    
    Object.entries(hours).forEach(([dayKey, dayHours]) => {
      if (dayHours?.isOpen) {
        if (!dayHours.openTime || !dayHours.closeTime || dayHours.openTime.trim() === '' || dayHours.closeTime.trim() === '') {
          errors[`${dayKey}_times`] = 'Açılış ve kapanış saatleri gereklidir';
        } else if (dayHours.openTime >= dayHours.closeTime) {
          errors[`${dayKey}_times`] = 'Açılış saati kapanış saatinden önce olmalıdır';
        }
      }
    });
    
    return errors;
  };


  const loadBusinessHours = async () => {
    try {
      setIsLoading(true);
      const response = await businessService.getBusinessHours(businessId);
      
      if (response.success && response.data?.businessHours) {
        const mappedHours: BusinessHours = {};
        Object.entries(response.data.businessHours).forEach(([dayKey, dayData]: [string, any]) => {
          mappedHours[dayKey] = {
            isOpen: dayData.isOpen,
            openTime: dayData.open || dayData.openTime,
            closeTime: dayData.close || dayData.closeTime,
            breaks: dayData.breaks || []
          };
        });
        setBusinessHours(mappedHours);
        setValidationErrors({});
      } else {
        const defaultHours = createDefaultHours();
        setBusinessHours(defaultHours);
        setValidationErrors({});
      }
    } catch (error) {
      try {
        const response = await businessService.getBusinessById(businessId);
        
        if (response.success && response.data?.businessHours) {
          const mappedHours: BusinessHours = {};
          Object.entries(response.data.businessHours).forEach(([dayKey, dayData]: [string, any]) => {
            mappedHours[dayKey] = {
              isOpen: dayData.isOpen,
              openTime: dayData.open || dayData.openTime,
              closeTime: dayData.close || dayData.closeTime,
              breaks: dayData.breaks || []
            };
          });
          setBusinessHours(mappedHours);
          setValidationErrors({});
        } else {
          const defaultHours = createDefaultHours();
          setBusinessHours(defaultHours);
          setValidationErrors({});
        }
      } catch (fallbackError) {
        handleApiError(fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const autoSave = async (hours: BusinessHours) => {
    const errors = validateBusinessHours(hours);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    const mapToApiFormat = (hoursData: BusinessHours) => {
      const apiFormat: Record<string, any> = {};
      Object.entries(hoursData).forEach(([dayKey, dayData]) => {
        apiFormat[dayKey] = {
          isOpen: dayData.isOpen,
          open: dayData.openTime,
          close: dayData.closeTime,
          breaks: dayData.breaks || []
        };
      });
      return apiFormat;
    };

    try {
      setIsSaving(true);
      const apiFormat = mapToApiFormat(hours);
      const response = await businessService.updateBusinessHours(businessId, apiFormat);

      if (response.success) {
        showSuccessToast('Çalışma saatleri güncellendi');
        onHoursUpdated?.();
      } else {
        handleApiError(response);
      }
    } catch (error) {
      try {
        const apiFormat = mapToApiFormat(hours);
        const fallbackResponse = await businessService.updateBusiness(businessId, {
          businessHours: apiFormat
        });

        if (fallbackResponse.success) {
          showSuccessToast('Çalışma saatleri güncellendi');
          onHoursUpdated?.();
        } else {
          handleApiError(fallbackResponse);
        }
      } catch (fallbackError) {
        handleApiError(fallbackError);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveBusinessHours = async () => {
    await autoSave(businessHours);
  };

  const handleDayToggle = async (dayKey: string) => {
    const newHours = {
      ...businessHours,
      [dayKey]: {
        ...businessHours[dayKey],
        isOpen: !businessHours[dayKey]?.isOpen,
        openTime: businessHours[dayKey]?.openTime || '09:00',
        closeTime: businessHours[dayKey]?.closeTime || '18:00',
        breaks: businessHours[dayKey]?.breaks || []
      }
    };

    setBusinessHours(newHours);

    // Auto-save after updating state
    setTimeout(() => {
      autoSave(newHours);
    }, 100);
  };

  const handleTimeChange = async (dayKey: string, field: 'openTime' | 'closeTime', value: string) => {
    const newHours = {
      ...businessHours,
      [dayKey]: {
        ...businessHours[dayKey],
        [field]: value
      }
    };

    setBusinessHours(newHours);

    // Auto-save after updating state
    setTimeout(() => {
      autoSave(newHours);
    }, 500); // Slightly longer delay for time inputs
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Çalışma saatleri yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Auto-saving indicator */}
      {isSaving && (
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center space-x-2 text-sm text-[var(--theme-foregroundSecondary)]">
            <div className="w-4 h-4 border-2 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span>Kaydediliyor...</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayHours = businessHours[day.key];
          const isOpen = dayHours?.isOpen || false;

          return (
            <div key={day.key} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">{day.label}</span>
                <button
                  onClick={() => handleDayToggle(day.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    isOpen ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isOpen ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isOpen && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Açılış Saati
                      </label>
                      <input
                        type="time"
                        value={dayHours?.openTime || '09:00'}
                        onChange={(e) => handleTimeChange(day.key, 'openTime', e.target.value)}
                        className={`w-full text-sm border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          validationErrors[`${day.key}_times`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Kapanış Saati
                      </label>
                      <input
                        type="time"
                        value={dayHours?.closeTime || '18:00'}
                        onChange={(e) => handleTimeChange(day.key, 'closeTime', e.target.value)}
                        className={`w-full text-sm border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          validationErrors[`${day.key}_times`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                  {validationErrors[`${day.key}_times`] && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors[`${day.key}_times`]}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
