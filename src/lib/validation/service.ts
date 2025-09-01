import { z } from 'zod';

// Service validation schemas
export const createServiceSchema = z.object({
  name: z.string()
    .min(2, 'Hizmet adı en az 2 karakter olmalıdır')
    .max(100, 'Hizmet adı 100 karakterden az olmalıdır')
    .trim(),
  
  description: z.string()
    .max(500, 'Açıklama 500 karakterden az olmalıdır')
    .optional(),
  
  duration: z.number()
    .int('Süre tam sayı olmalıdır')
    .min(15, 'Süre en az 15 dakika olmalıdır')
    .max(480, 'Süre 8 saatten az olmalıdır'),
  
  price: z.number()
    .min(0, 'Fiyat negatif olamaz')
    .max(10000, 'Fiyat 10.000\'den az olmalıdır'),
  
  currency: z.string()
    .length(3, 'Para birimi 3 karakter olmalıdır')
    .optional(),
  
  bufferTime: z.number()
    .int('Tampon süre tam sayı olmalıdır')
    .min(0, 'Tampon süre negatif olamaz')
    .max(120, 'Tampon süre 2 saatten az olmalıdır')
    .optional(),
  
  maxAdvanceBooking: z.number()
    .int('Maksimum önceden rezervasyon tam sayı olmalıdır')
    .min(1, 'Maksimum önceden rezervasyon en az 1 gün olmalıdır')
    .max(365, 'Maksimum önceden rezervasyon 1 yıldan az olmalıdır')
    .optional(),
  
  minAdvanceBooking: z.number()
    .int('Minimum önceden rezervasyon tam sayı olmalıdır')
    .min(0, 'Minimum önceden rezervasyon negatif olamaz')
    .max(72, 'Minimum önceden rezervasyon 3 günden az olmalıdır')
    .optional()
});

export const updateServiceSchema = z.object({
  name: z.string()
    .min(2, 'Hizmet adı en az 2 karakter olmalıdır')
    .max(100, 'Hizmet adı 100 karakterden az olmalıdır')
    .trim()
    .optional(),
  
  description: z.string()
    .max(500, 'Açıklama 500 karakterden az olmalıdır')
    .optional(),
  
  duration: z.number()
    .int('Süre tam sayı olmalıdır')
    .min(15, 'Süre en az 15 dakika olmalıdır')
    .max(480, 'Süre 8 saatten az olmalıdır')
    .optional(),
  
  price: z.number()
    .min(0, 'Fiyat negatif olamaz')
    .max(10000, 'Fiyat 10.000\'den az olmalıdır')
    .optional(),
  
  currency: z.string()
    .length(3, 'Para birimi 3 karakter olmalıdır')
    .optional(),
  
  isActive: z.boolean().optional(),
  
  sortOrder: z.number()
    .int('Sıralama tam sayı olmalıdır')
    .min(0, 'Sıralama negatif olamaz')
    .optional(),
  
  bufferTime: z.number()
    .int('Tampon süre tam sayı olmalıdır')
    .min(0, 'Tampon süre negatif olamaz')
    .max(120, 'Tampon süre 2 saatten az olmalıdır')
    .optional(),
  
  maxAdvanceBooking: z.number()
    .int('Maksimum önceden rezervasyon tam sayı olmalıdır')
    .min(1, 'Maksimum önceden rezervasyon en az 1 gün olmalıdır')
    .max(365, 'Maksimum önceden rezervasyon 1 yıldan az olmalıdır')
    .optional(),
  
  minAdvanceBooking: z.number()
    .int('Minimum önceden rezervasyon tam sayı olmalıdır')
    .min(0, 'Minimum önceden rezervasyon negatif olamaz')
    .max(72, 'Minimum önceden rezervasyon 3 günden az olmalıdır')
    .optional()
});

// Utility validation functions
export const validateServiceDuration = (duration: number): boolean => {
  return Number.isInteger(duration) && duration >= 15 && duration <= 480;
};

export const validateServicePrice = (price: number): boolean => {
  return price >= 0 && price <= 10000;
};

export const validateCurrency = (currency: string): boolean => {
  const validCurrencies = ['TRY', 'USD', 'EUR', 'GBP'];
  return validCurrencies.includes(currency.toUpperCase());
};

// Field validation helper for real-time validation
export const validateServiceField = <T extends keyof CreateServiceSchema>(
  field: T, 
  value: CreateServiceSchema[T],
  formData?: Partial<CreateServiceSchema>
): string | null => {
  try {
    // For simple field validation
    const fieldSchema = createServiceSchema.shape[field];
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => 
        err.path.length === 0 || err.path[0] === field
      );
      return fieldError?.message || 'Geçersiz değer';
    }
    return 'Geçersiz değer';
  }
};

// Validate entire service form
export const validateServiceForm = (
  data: Partial<CreateServiceSchema>,
  isUpdate = false
): { 
  isValid: boolean; 
  errors: Partial<Record<keyof CreateServiceSchema, string>>;
  fieldErrors?: Record<string, string>;
} => {
  try {
    const schema = isUpdate ? updateServiceSchema : createServiceSchema;
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof CreateServiceSchema, string>> = {};
      const fieldErrors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        const firstPath = err.path[0] as keyof CreateServiceSchema;
        
        if (firstPath) {
          errors[firstPath] = err.message;
        }
        fieldErrors[path] = err.message;
      });
      
      return { isValid: false, errors, fieldErrors };
    }
    return { isValid: false, errors: {} };
  }
};

// Export schema types for TypeScript
export type CreateServiceSchema = z.infer<typeof createServiceSchema>;
export type UpdateServiceSchema = z.infer<typeof updateServiceSchema>;