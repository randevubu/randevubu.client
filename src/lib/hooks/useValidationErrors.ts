import { useMemo } from 'react';

// Translation mapping for common validation error messages
const errorTranslations: Record<string, string> = {
  // Required fields
  'Required': 'Bu alan gereklidir',
  'String must contain at least 1 character(s)': 'Bu alan gereklidir',
  'Expected string, received undefined': 'Bu alan gereklidir',
  'Expected string, received null': 'Bu alan gereklidir',
  'Expected number, received undefined': 'Bu alan gereklidir',
  'Expected number, received null': 'Bu alan gereklidir',
  
  // String validations
  'String must contain at least 2 character(s)': 'En az 2 karakter olmalıdır',
  'String must contain at least 5 character(s)': 'En az 5 karakter olmalıdır',
  'String must contain at most 50 character(s)': 'En fazla 50 karakter olmalıdır',
  'String must contain at most 100 character(s)': 'En fazla 100 karakter olmalıdır',
  'String must contain at most 200 character(s)': 'En fazla 200 karakter olmalıdır',
  'String must contain at most 500 character(s)': 'En fazla 500 karakter olmalıdır',
  'String must contain at most 1000 character(s)': 'En fazla 1000 karakter olmalıdır',
  
  // Number validations
  'Number must be greater than or equal to 0': 'Sıfır veya pozitif sayı olmalıdır',
  'Number must be greater than or equal to 1': 'En az 1 olmalıdır',
  'Number must be greater than or equal to 15': 'En az 15 olmalıdır',
  'Number must be less than or equal to 10000': 'En fazla 10.000 olabilir',
  'Number must be less than or equal to 480': 'En fazla 480 olabilir',
  'Number must be less than or equal to 365': 'En fazla 365 olabilir',
  'Number must be an integer': 'Tam sayı olmalıdır',
  
  // Email validation
  'Invalid email': 'Geçersiz e-posta adresi',
  'Invalid email format': 'Geçersiz e-posta formatı',
  
  // URL validation
  'Invalid url': 'Geçersiz URL',
  'Invalid URL': 'Geçersiz URL',
  
  // Date/Time validations
  'Invalid date': 'Geçersiz tarih',
  'Start date must be a valid date': 'Başlangıç tarihi geçerli bir tarih olmalıdır',
  'End date must be a valid date': 'Bitiş tarihi geçerli bir tarih olmalıdır',
  'End date must be on or after start date': 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
  'Start date and time cannot be in the past': 'Başlangıç tarihi ve saati geçmişte olamaz',
  'Date must be in YYYY-MM-DD format': 'Tarih YYYY-MM-DD formatında olmalıdır',
  'Start time must be in HH:MM format': 'Başlangıç saati HH:MM formatında olmalıdır',
  'Invalid time format': 'Geçersiz saat formatı',
  
  // Phone validation
  'Invalid phone number format': 'Geçersiz telefon numarası formatı',
  
  // Business specific
  'Business name must be at least 2 characters': 'İşletme adı en az 2 karakter olmalıdır',
  'Business name must be less than 100 characters': 'İşletme adı 100 karakterden az olmalıdır',
  'Business type is required': 'İşletme türü gereklidir',
  'Primary color must be a valid hex color': 'Ana renk geçerli hex renk kodu olmalıdır',
  'Maximum 10 tags allowed': 'Maksimum 10 etiket izin verilir',
  
  // Service specific
  'Service name must be at least 2 characters': 'Hizmet adı en az 2 karakter olmalıdır',
  'Service name must be less than 100 characters': 'Hizmet adı 100 karakterden az olmalıdır',
  'Duration must be an integer': 'Süre tam sayı olmalıdır',
  'Duration must be at least 15 minutes': 'Süre en az 15 dakika olmalıdır',
  'Duration must be less than 8 hours': 'Süre 8 saatten az olmalıdır',
  'Price must be non-negative': 'Fiyat negatif olamaz',
  'Price must be less than 10,000': 'Fiyat 10.000\'den az olmalıdır',
  'Currency must be 3 characters': 'Para birimi 3 karakter olmalıdır',
  'Buffer time must be an integer': 'Tampon süre tam sayı olmalıdır',
  'Buffer time must be non-negative': 'Tampon süre negatif olamaz',
  'Buffer time must be less than 2 hours': 'Tampon süre 2 saatten az olmalıdır',
  
  // Appointment specific
  'Business ID is required': 'İşletme ID gereklidir',
  'Service ID is required': 'Hizmet ID gereklidir',
  'Staff ID is required': 'Personel ID gereklidir',
  'Customer notes must be less than 500 characters': 'Müşteri notları 500 karakterden az olmalıdır',
  'Internal notes must be less than 500 characters': 'İç notlar 500 karakterden az olmalıdır',
  'Cancel reason must be less than 200 characters': 'İptal nedeni 200 karakterden az olmalıdır',
  
  // Closure specific
  'Reason must be at least 5 characters': 'Sebep en az 5 karakter olmalıdır',
  'Reason must be less than 200 characters': 'Sebep 200 karakterden az olmalıdır',
  'Please select a valid closure type': 'Lütfen geçerli bir kapatma türü seçin',
  'Notification message is required when notifying customers': 'Müşterilere bildirim gönderilirken bildirim mesajı gereklidir',
  'Notification message must be less than 500 characters': 'Bildirim mesajı 500 karakterden az olmalıdır',
  'At least one notification channel must be selected': 'En az bir bildirim kanalı seçilmelidir',
  'Invalid notification channel': 'Geçersiz bildirim kanalı',
  'Recurring pattern details are required for recurring closures': 'Tekrarlayan kapatmalar için tekrarlama deseni detayları gereklidir',
  'Recurring end date must be after closure end date': 'Tekrarlama bitiş tarihi kapatma bitiş tarihinden sonra olmalıdır',
  'Interval must be a whole number': 'Aralık tam sayı olmalıdır',
  'Interval must be at least 1': 'Aralık en az 1 olmalıdır',
  'Interval cannot exceed 12': 'Aralık 12\'yi geçemez'
};

// Hook for translating validation errors
export const useValidationErrors = () => {
  const translateError = useMemo(() => {
    return (error: string): string => {
      // Direct translation if available
      if (errorTranslations[error]) {
        return errorTranslations[error];
      }
      
      // Pattern matching for dynamic messages
      const patterns = [
        {
          pattern: /String must contain at least (\d+) character\(s\)/,
          template: (match: RegExpMatchArray) => `En az ${match[1]} karakter olmalıdır`
        },
        {
          pattern: /String must contain at most (\d+) character\(s\)/,
          template: (match: RegExpMatchArray) => `En fazla ${match[1]} karakter olmalıdır`
        },
        {
          pattern: /Number must be greater than or equal to (\d+)/,
          template: (match: RegExpMatchArray) => `En az ${match[1]} olmalıdır`
        },
        {
          pattern: /Number must be less than or equal to (\d+)/,
          template: (match: RegExpMatchArray) => `En fazla ${match[1]} olabilir`
        },
        {
          pattern: /Expected (.+), received (.+)/,
          template: (match: RegExpMatchArray) => `${getFieldTypeTranslation(match[1])} bekleniyor, ${getFieldTypeTranslation(match[2])} alındı`
        }
      ];
      
      for (const { pattern, template } of patterns) {
        const match = error.match(pattern);
        if (match) {
          return template(match);
        }
      }
      
      // If no translation found, return original error
      // In development, you might want to log untranslated errors
      if (process.env.NODE_ENV === 'development') {
      }
      
      return error;
    };
  }, []);
  
  const translateErrors = useMemo(() => {
    return (errors: Record<string, string>): Record<string, string> => {
      const translatedErrors: Record<string, string> = {};
      
      for (const [field, error] of Object.entries(errors)) {
        translatedErrors[field] = translateError(error);
      }
      
      return translatedErrors;
    };
  }, [translateError]);
  
  const translateValidationResult = useMemo(() => {
    return <T extends Record<string, string>>(result: {
      isValid: boolean;
      errors: T;
      fieldErrors?: Record<string, string>;
    }) => ({
      ...result,
      errors: translateErrors(result.errors) as T,
      fieldErrors: result.fieldErrors ? translateErrors(result.fieldErrors) : undefined
    });
  }, [translateErrors]);
  
  return {
    translateError,
    translateErrors,
    translateValidationResult
  };
};

// Helper function for field type translations
const getFieldTypeTranslation = (type: string): string => {
  const typeTranslations: Record<string, string> = {
    'string': 'metin',
    'number': 'sayı',
    'boolean': 'doğru/yanlış',
    'undefined': 'tanımsız',
    'null': 'boş',
    'object': 'nesne',
    'array': 'dizi'
  };
  
  return typeTranslations[type] || type;
};

// Utility function to get user-friendly field names in Turkish
export const getFieldDisplayName = (fieldName: string): string => {
  const fieldNames: Record<string, string> = {
    'name': 'Ad',
    'description': 'Açıklama',
    'duration': 'Süre',
    'price': 'Fiyat',
    'currency': 'Para Birimi',
    'email': 'E-posta',
    'phone': 'Telefon',
    'website': 'Website',
    'address': 'Adres',
    'city': 'Şehir',
    'state': 'İl',
    'country': 'Ülke',
    'postalCode': 'Posta Kodu',
    'startDate': 'Başlangıç Tarihi',
    'endDate': 'Bitiş Tarihi',
    'startTime': 'Başlangıç Saati',
    'reason': 'Sebep',
    'type': 'Tür',
    'notificationMessage': 'Bildirim Mesajı',
    'notificationChannels': 'Bildirim Kanalları',
    'businessId': 'İşletme',
    'serviceId': 'Hizmet',
    'staffId': 'Personel',
    'customerNotes': 'Müşteri Notları',
    'internalNotes': 'İç Notlar',
    'cancelReason': 'İptal Nedeni'
  };
  
  return fieldNames[fieldName] || fieldName;
};