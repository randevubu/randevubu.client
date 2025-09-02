import { z } from 'zod';

// User profile validation schema - matches backend exactly
export const userProfileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Ad alanı boş bırakılamaz')
    .max(50, 'Ad 50 karakterden uzun olamaz')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s\-']+$/, 'Ad sadece harf, boşluk, tire ve apostrof içerebilir')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Soyad alanı boş bırakılamaz')
    .max(50, 'Soyad 50 karakterden uzun olamaz')
    .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s\-']+$/, 'Soyad sadece harf, boşluk, tire ve apostrof içerebilir')
    .optional(),
  avatar: z
    .string()
    .url('Avatar geçerli bir URL olmalıdır')
    .max(500, 'Avatar URL\'i 500 karakterden uzun olamaz')
    .optional(),
  timezone: z
    .string()
    .min(1, 'Zaman dilimi boş bırakılamaz')
    .max(50, 'Zaman dilimi 50 karakterden uzun olamaz')
    .regex(/^[A-Za-z_\/]+$/, 'Geçersiz zaman dilimi formatı')
    .optional(),
  language: z
    .string()
    .length(2, 'Dil kodu tam olarak 2 karakter olmalıdır')
    .regex(/^[a-z]{2}$/, 'Dil geçerli 2 harfli ISO kodu olmalıdır')
    .optional(),
}).strict();

export type UserProfileUpdateData = z.infer<typeof userProfileUpdateSchema>;

// Validation helper function
export const validateField = (field: keyof UserProfileUpdateData, value: string): string | null => {
  try {
    const schema = userProfileUpdateSchema.shape[field];
    if (schema) {
      schema.parse(value || undefined);
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Geçersiz değer';
    }
    return 'Geçersiz değer';
  }
};

// Validate entire form
export const validateProfileForm = (data: Partial<UserProfileUpdateData>): { 
  isValid: boolean; 
  errors: Partial<Record<keyof UserProfileUpdateData, string>> 
} => {
  try {
    userProfileUpdateSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof UserProfileUpdateData, string>> = {};
      error.errors.forEach((err) => {
        const path = err.path[0] as keyof UserProfileUpdateData;
        if (path) {
          errors[path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
};