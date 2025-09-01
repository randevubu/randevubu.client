import { z } from 'zod';
import { AppointmentStatus } from '../../types/enums';

// Appointment validation schemas
export const createAppointmentSchema = z.object({
  businessId: z.string()
    .min(1, 'İşletme ID gereklidir'),
  
  serviceId: z.string()
    .min(1, 'Hizmet ID gereklidir'),
  
  staffId: z.string()
    .min(1, 'Personel ID gereklidir')
    .optional(),
  
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalıdır'),
  
  startTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Başlangıç saati HH:MM formatında olmalıdır'),
  
  customerNotes: z.string()
    .max(500, 'Müşteri notları 500 karakterden az olmalıdır')
    .optional()
});

export const updateAppointmentSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalıdır')
    .optional(),
  
  startTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Başlangıç saati HH:MM formatında olmalıdır')
    .optional(),
  
  status: z.nativeEnum(AppointmentStatus).optional(),
  
  customerNotes: z.string()
    .max(500, 'Müşteri notları 500 karakterden az olmalıdır')
    .optional(),
  
  internalNotes: z.string()
    .max(500, 'İç notlar 500 karakterden az olmalıdır')
    .optional(),
  
  cancelReason: z.string()
    .max(200, 'İptal nedeni 200 karakterden az olmalıdır')
    .optional()
});

// Search and filter schemas
export const appointmentSearchSchema = z.object({
  businessId: z.string().optional(),
  serviceId: z.string().optional(),
  staffId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Başlangıç tarihi YYYY-MM-DD formatında olmalıdır')
    .optional(),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Bitiş tarihi YYYY-MM-DD formatında olmalıdır')
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

// Utility validation functions
export const validateAppointmentTime = (date: string, startTime: string): boolean => {
  try {
    const appointmentDateTime = new Date(`${date}T${startTime}:00`);
    const now = new Date();
    
    // Appointment cannot be in the past
    return appointmentDateTime > now;
  } catch {
    return false;
  }
};

export const validateDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateAppointmentDuration = (startTime: string, duration: number): boolean => {
  try {
    const [hour, minute] = startTime.split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    const endMinutes = startMinutes + duration;
    
    // Check if appointment ends before midnight
    return endMinutes <= 24 * 60;
  } catch {
    return false;
  }
};

// Check if appointment time conflicts with business hours
export const validateBusinessHours = (
  startTime: string, 
  duration: number, 
  businessHours?: Record<string, any>,
  dayOfWeek?: number
): boolean => {
  if (!businessHours || dayOfWeek === undefined) return true;
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  const dayHours = businessHours[dayName];
  
  if (!dayHours || dayHours.closed) return false;
  
  try {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const appointmentStart = startHour * 60 + startMinute;
    const appointmentEnd = appointmentStart + duration;
    
    const [openHour, openMinute] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.close.split(':').map(Number);
    const businessOpen = openHour * 60 + openMinute;
    const businessClose = closeHour * 60 + closeMinute;
    
    return appointmentStart >= businessOpen && appointmentEnd <= businessClose;
  } catch {
    return false;
  }
};

// Field validation helper for real-time validation
export const validateAppointmentField = <T extends keyof CreateAppointmentSchema>(
  field: T, 
  value: CreateAppointmentSchema[T],
  formData?: Partial<CreateAppointmentSchema>
): string | null => {
  try {
    // For complex validations that depend on other fields
    if (field === 'startTime' && formData?.date) {
      const testData = { ...formData, [field]: value };
      if (!validateAppointmentTime(testData.date!, testData.startTime!)) {
        return 'Randevu saati geçmişte olamaz';
      }
    }
    
    // For simple field validation
    const fieldSchema = createAppointmentSchema.shape[field];
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

// Validate entire appointment form
export const validateAppointmentForm = (
  data: Partial<CreateAppointmentSchema>,
  isUpdate = false
): { 
  isValid: boolean; 
  errors: Partial<Record<keyof CreateAppointmentSchema, string>>;
  fieldErrors?: Record<string, string>;
} => {
  try {
    const schema = isUpdate ? updateAppointmentSchema : createAppointmentSchema;
    schema.parse(data);
    
    // Additional validation for appointment time
    if (data.date && data.startTime && !validateAppointmentTime(data.date, data.startTime)) {
      return {
        isValid: false,
        errors: { startTime: 'Randevu saati geçmişte olamaz' },
        fieldErrors: { startTime: 'Randevu saati geçmişte olamaz' }
      };
    }
    
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof CreateAppointmentSchema, string>> = {};
      const fieldErrors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        const firstPath = err.path[0] as keyof CreateAppointmentSchema;
        
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

// Real-time validation for date range
export const validateDateRange = (startDate: string, endDate: string): string | null => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) return 'Geçersiz başlangıç tarihi';
    if (isNaN(end.getTime())) return 'Geçersiz bitiş tarihi';
    if (end < start) return 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır';
    
    return null;
  } catch {
    return 'Geçersiz tarih aralığı';
  }
};

// Export schema types for TypeScript
export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;
export type AppointmentSearchSchema = z.infer<typeof appointmentSearchSchema>;