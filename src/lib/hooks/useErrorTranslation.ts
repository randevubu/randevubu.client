import { useCallback } from 'react';

interface ValidationError {
  message: string;
  code: string;
  details?: {
    field: string;
    suggestions?: string[];
  };
}

interface TranslatedError {
  field: string;
  message: string;
}

export const useErrorTranslation = () => {
  const translateValidationError = useCallback((error: ValidationError): TranslatedError | null => {
    if (error.code !== 'VALIDATION_ERROR' || !error.details?.field) {
      return null;
    }

    const field = error.details.field;
    const originalMessage = error.message;

    // Field-specific Turkish translations
    const fieldTranslations: Record<string, string> = {
      firstName: 'Ad',
      lastName: 'Soyad',
      phoneNumber: 'Telefon Numarası',
      email: 'E-posta',
      timezone: 'Zaman Dilimi',
      language: 'Dil',
      password: 'Şifre',
      confirmPassword: 'Şifre Tekrarı',
      businessName: 'İşletme Adı',
      description: 'Açıklama',
      address: 'Adres',
      category: 'Kategori',
      workingHours: 'Çalışma Saatleri'
    };

    // Common validation error patterns and their Turkish translations
    const errorPatterns: Array<{ pattern: RegExp; translation: string }> = [
      // Empty field errors
      { 
        pattern: /Last name cannot be empty/, 
        translation: 'Soyad alanı boş bırakılamaz'
      },
      { 
        pattern: /First name cannot be empty/, 
        translation: 'Ad alanı boş bırakılamaz'
      },
      { 
        pattern: /(.+) cannot be empty/, 
        translation: `${fieldTranslations[field] || field} alanı boş bırakılamaz` 
      },
      { 
        pattern: /(.+) is required/, 
        translation: `${fieldTranslations[field] || field} alanı zorunludur` 
      },
      
      // Format errors - specific patterns first
      { 
        pattern: /Last name can only contain letters, spaces, hyphens, and apostrophes/, 
        translation: 'Soyad sadece harf, boşluk, tire ve apostrof içerebilir'
      },
      { 
        pattern: /First name can only contain letters, spaces, hyphens, and apostrophes/, 
        translation: 'Ad sadece harf, boşluk, tire ve apostrof içerebilir'
      },
      { 
        pattern: /(.+) can only contain letters, spaces, hyphens, and apostrophes/, 
        translation: `${fieldTranslations[field] || field} sadece harf, boşluk, tire ve apostrof içerebilir` 
      },
      { 
        pattern: /(.+) must be a valid email address/, 
        translation: `Geçerli bir e-posta adresi giriniz` 
      },
      { 
        pattern: /(.+) must be a valid phone number/, 
        translation: `Geçerli bir telefon numarası giriniz` 
      },
      
      // Length errors - specific patterns first
      { 
        pattern: /Last name must not exceed (\d+) characters/, 
        translation: `Soyad $1 karakterden uzun olamaz` 
      },
      { 
        pattern: /First name must not exceed (\d+) characters/, 
        translation: `Ad $1 karakterden uzun olamaz` 
      },
      { 
        pattern: /Last name must be at least (\d+) characters/, 
        translation: `Soyad en az $1 karakter olmalıdır` 
      },
      { 
        pattern: /First name must be at least (\d+) characters/, 
        translation: `Ad en az $1 karakter olmalıdır` 
      },
      { 
        pattern: /(.+) must not exceed (\d+) characters/, 
        translation: `${fieldTranslations[field] || field} $2 karakterden uzun olamaz` 
      },
      { 
        pattern: /(.+) must be at least (\d+) characters/, 
        translation: `${fieldTranslations[field] || field} en az $2 karakter olmalıdır` 
      },
      
      // Specific validation errors
      { 
        pattern: /Invalid timezone format/, 
        translation: 'Geçersiz zaman dilimi formatı' 
      },
      { 
        pattern: /Language must be a valid 2-letter ISO code/, 
        translation: 'Dil geçerli 2 harfli ISO kodu olmalıdır' 
      },
      { 
        pattern: /Password must contain at least one uppercase letter/, 
        translation: 'Şifre en az bir büyük harf içermelidir' 
      },
      { 
        pattern: /Password must contain at least one lowercase letter/, 
        translation: 'Şifre en az bir küçük harf içermelidir' 
      },
      { 
        pattern: /Password must contain at least one number/, 
        translation: 'Şifre en az bir rakam içermelidir' 
      },
      { 
        pattern: /Passwords do not match/, 
        translation: 'Şifreler eşleşmiyor' 
      }
    ];

    // Clean up the message by removing common prefixes
    let cleanMessage = originalMessage
      .replace(/^Body validation failed:\s*/, '')
      .replace(/^Validation failed:\s*/, '')
      .trim();

    // Try to match error patterns
    for (const { pattern, translation } of errorPatterns) {
      const match = cleanMessage.match(pattern);
      if (match) {
        // Replace placeholders like $1 with matched groups
        let translatedMessage = translation;
        if (match.length > 1) {
          for (let i = 1; i < match.length; i++) {
            translatedMessage = translatedMessage.replace(`$${i}`, match[i]);
          }
        }
        return { field, message: translatedMessage };
      }
    }

    // Fallback to generic field-based translation
    const genericFieldErrors: Record<string, string> = {
      firstName: 'Ad alanında bir hata var',
      lastName: 'Soyad alanında bir hata var',
      phoneNumber: 'Telefon numarası geçersiz',
      email: 'E-posta adresi geçersiz',
      timezone: 'Zaman dilimi seçilmelidir',
      language: 'Dil seçilmelidir',
      password: 'Şifre geçersiz',
      confirmPassword: 'Şifre tekrarı geçersiz'
    };

    return {
      field,
      message: genericFieldErrors[field] || cleanMessage || 'Bu alanda bir hata var'
    };
  }, []);

  const getFieldTranslation = useCallback((field: string): string => {
    const fieldTranslations: Record<string, string> = {
      firstName: 'Ad',
      lastName: 'Soyad',
      phoneNumber: 'Telefon Numarası',
      email: 'E-posta',
      timezone: 'Zaman Dilimi',
      language: 'Dil',
      password: 'Şifre',
      confirmPassword: 'Şifre Tekrarı',
      businessName: 'İşletme Adı',
      description: 'Açıklama',
      address: 'Adres',
      category: 'Kategori',
      workingHours: 'Çalışma Saatleri'
    };
    
    return fieldTranslations[field] || field;
  }, []);

  return {
    translateValidationError,
    getFieldTranslation
  };
};