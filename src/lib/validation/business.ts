import { z } from 'zod';
import { BusinessStaffRole } from '../../types/enums';

// Business validation schemas
export const createBusinessSchema = z.object({
  name: z.string()
    .min(2, 'İşletme adı en az 2 karakter olmalıdır')
    .max(100, 'İşletme adı 100 karakterden az olmalıdır')
    .trim(),
  
  businessTypeId: z.string()
    .min(1, 'İşletme türü gereklidir'),
  
  description: z.string()
    .max(1000, 'Açıklama 1000 karakterden az olmalıdır')
    .optional(),
  
  email: z.string()
    .email('Geçersiz email formatı')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Geçersiz telefon numarası formatı')
    .optional(),
  
  website: z.string()
    .url('Geçersiz website URL\'si')
    .optional(),
  
  address: z.string()
    .max(200, 'Adres 200 karakterden az olmalıdır')
    .optional(),
  
  city: z.string()
    .max(50, 'Şehir 50 karakterden az olmalıdır')
    .optional(),
  
  state: z.string()
    .max(50, 'İl 50 karakterden az olmalıdır')
    .optional(),
  
  country: z.string()
    .max(50, 'Ülke 50 karakterden az olmalıdır')
    .optional(),
  
  postalCode: z.string()
    .max(20, 'Posta kodu 20 karakterden az olmalıdır')
    .optional(),
  
  timezone: z.string()
    .max(50, 'Zaman dilimi 50 karakterden az olmalıdır')
    .optional(),
  
  primaryColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Ana renk geçerli hex renk kodu olmalıdır')
    .optional(),
  
  tags: z.array(z.string())
    .max(10, 'Maksimum 10 etiket izin verilir')
    .optional()
});

export const updateBusinessSchema = z.object({
  name: z.string()
    .min(2, 'İşletme adı en az 2 karakter olmalıdır')
    .max(100, 'İşletme adı 100 karakterden az olmalıdır')
    .optional(),
  
  description: z.string()
    .max(1000, 'Açıklama 1000 karakterden az olmalıdır')
    .optional(),
  
  email: z.string()
    .email('Geçersiz email formatı')
    .optional(),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Geçersiz telefon numarası formatı')
    .optional(),
  
  website: z.string()
    .url('Geçersiz website URL\'si')
    .optional(),
  
  address: z.string()
    .max(200, 'Adres 200 karakterden az olmalıdır')
    .optional(),
  
  city: z.string()
    .max(50, 'Şehir 50 karakterden az olmalıdır')
    .optional(),
  
  state: z.string()
    .max(50, 'İl 50 karakterden az olmalıdır')
    .optional(),
  
  country: z.string()
    .max(50, 'Ülke 50 karakterden az olmalıdır')
    .optional(),
  
  postalCode: z.string()
    .max(20, 'Posta kodu 20 karakterden az olmalıdır')
    .optional(),
  
  businessHours: z.record(z.object({
    open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçersiz saat formatı'),
    close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçersiz saat formatı'),
    closed: z.boolean()
  })).optional(),
  
  timezone: z.string()
    .max(50, 'Zaman dilimi 50 karakterden az olmalıdır')
    .optional(),
  
  logoUrl: z.string()
    .url('Geçersiz logo URL\'si')
    .optional(),
  
  coverImageUrl: z.string()
    .url('Geçersiz kapak resmi URL\'si')
    .optional(),
  
  primaryColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Ana renk geçerli hex renk kodu olmalıdır')
    .optional(),
  
  theme: z.record(z.any()).optional(),
  
  settings: z.record(z.any()).optional(),
  
  tags: z.array(z.string())
    .max(10, 'Maksimum 10 etiket izin verilir')
    .optional()
});

// Staff management schemas
export const addStaffSchema = z.object({
  userId: z.string()
    .min(1, 'Kullanıcı ID gereklidir'),
  
  role: z.nativeEnum(BusinessStaffRole),
  
  permissions: z.record(z.any()).optional()
});

export const updateStaffSchema = z.object({
  role: z.nativeEnum(BusinessStaffRole).optional(),
  
  permissions: z.record(z.any()).optional(),
  
  isActive: z.boolean().optional()
});

// Search and filter schemas
export const businessSearchSchema = z.object({
  businessTypeId: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isVerified: z.string()
    .transform(val => val === 'true')
    .optional(),
  latitude: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val >= -90 && val <= 90, 'Geçersiz enlem')
    .optional(),
  longitude: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val >= -180 && val <= 180, 'Geçersiz boylam')
    .optional(),
  radius: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 100, 'Yarıçap 0 ile 100 km arasında olmalıdır')
    .optional(),
  page: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val >= 1, 'Sayfa pozitif sayı olmalıdır')
    .optional(),
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val >= 1 && val <= 100, 'Limit 1 ile 100 arasında olmalıdır')
    .optional()
});

// Subscription schemas
export const subscribeBusinessSchema = z.object({
  planId: z.string()
    .min(1, 'Plan ID gereklidir'),
  
  paymentMethodId: z.string()
    .min(1, 'Ödeme yöntemi ID gereklidir')
    .optional()
});

// Utility validation functions
export const validateBusinessHours = (businessHours: any): boolean => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  if (!businessHours || typeof businessHours !== 'object') {
    return false;
  }
  
  for (const day of days) {
    if (businessHours[day]) {
      const { open, close, closed } = businessHours[day];
      
      if (typeof closed !== 'boolean') {
        return false;
      }
      
      if (!closed) {
        if (!open || !close) {
          return false;
        }
        
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(open) || !timeRegex.test(close)) {
          return false;
        }
        
        // Validate that open time is before close time
        const [openHour, openMin] = open.split(':').map(Number);
        const [closeHour, closeMin] = close.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        
        if (openMinutes >= closeMinutes) {
          return false;
        }
      }
    }
  }
  
  return true;
};

// Export schema types for TypeScript
export type CreateBusinessSchema = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessSchema = z.infer<typeof updateBusinessSchema>;
export type AddStaffSchema = z.infer<typeof addStaffSchema>;
export type UpdateStaffSchema = z.infer<typeof updateStaffSchema>;
export type SubscribeBusinessSchema = z.infer<typeof subscribeBusinessSchema>;
export type BusinessSearchSchema = z.infer<typeof businessSearchSchema>;