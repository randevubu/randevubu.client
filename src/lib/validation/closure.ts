import { z } from 'zod';
import { ClosureType } from '../../types/enums';

// Basic closure validation schema - matches server exactly
export const createClosureSchema = z.object({
  startDate: z.string()
    .refine((val) => {
      // Accept both date (YYYY-MM-DD) and datetime (ISO) formats
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return dateRegex.test(val) || datetimeRegex.test(val) || !isNaN(Date.parse(val));
    }, 'Start date must be a valid date')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      return date >= now;
    }, 'Start date and time cannot be in the past'),
  
  endDate: z.string()
    .refine((val) => {
      // Accept both date (YYYY-MM-DD) and datetime (ISO) formats  
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return dateRegex.test(val) || datetimeRegex.test(val) || !isNaN(Date.parse(val));
    }, 'End date must be a valid date')
    .optional(),
  
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason must be less than 200 characters')
    .trim(),
  
  type: z.nativeEnum(ClosureType, {
    errorMap: () => ({ message: 'Please select a valid closure type' })
  })
}).refine((data) => {
  if (data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

// Base schema for field validation
const enhancedClosureBaseSchema = z.object({
  startDate: z.string()
    .refine((val) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return dateRegex.test(val) || datetimeRegex.test(val) || !isNaN(Date.parse(val));
    }, 'Start date must be a valid date')
    .refine((val) => {
      const date = new Date(val);
      const now = new Date();
      return date >= now;
    }, 'Start date and time cannot be in the past'),
  
  endDate: z.string()
    .refine((val) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return dateRegex.test(val) || datetimeRegex.test(val) || !isNaN(Date.parse(val));
    }, 'End date must be a valid date'),
  
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason must be less than 200 characters')
    .trim(),
  
  type: z.nativeEnum(ClosureType),
  
  notifyCustomers: z.boolean(),
  
  notificationMessage: z.string()
    .max(500, 'Notification message must be less than 500 characters')
    .trim()
    .optional(),
  
  notificationChannels: z.array(
    z.enum(['EMAIL', 'SMS', 'PUSH'], {
      errorMap: () => ({ message: 'Invalid notification channel' })
    })
  ).min(0).max(3),
  
  affectedServices: z.array(z.string().min(1)).optional(),
  
  isRecurring: z.boolean(),
  
  recurringPattern: z.object({
    frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
    interval: z.number()
      .int('Interval must be a whole number')
      .min(1, 'Interval must be at least 1')
      .max(12, 'Interval cannot exceed 12'),
    endDate: z.string()
      .refine((val) => !val || !isNaN(Date.parse(val)), 'End date must be a valid date')
      .optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional()
  }).optional()
});

// Enhanced closure validation schema with notification features
export const createEnhancedClosureSchema = enhancedClosureBaseSchema.refine((data) => {
  // End date validation
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate']
}).refine((data) => {
  // Notification message required when notifying customers
  if (data.notifyCustomers && data.notificationChannels.length > 0) {
    return data.notificationMessage && data.notificationMessage.trim().length > 0;
  }
  return true;
}, {
  message: 'Notification message is required when notifying customers',
  path: ['notificationMessage']
}).refine((data) => {
  // At least one notification channel required when notifying customers
  if (data.notifyCustomers) {
    return data.notificationChannels.length > 0;
  }
  return true;
}, {
  message: 'At least one notification channel must be selected',
  path: ['notificationChannels']
}).refine((data) => {
  // Recurring pattern validation
  if (data.isRecurring) {
    return data.recurringPattern && 
           data.recurringPattern.frequency && 
           data.recurringPattern.interval && 
           data.recurringPattern.interval > 0;
  }
  return true;
}, {
  message: 'Recurring pattern details are required for recurring closures',
  path: ['recurringPattern']
}).refine((data) => {
  // Recurring end date validation
  if (data.isRecurring && data.recurringPattern?.endDate) {
    const closureEnd = new Date(data.endDate);
    const recurringEnd = new Date(data.recurringPattern.endDate);
    return recurringEnd > closureEnd;
  }
  return true;
}, {
  message: 'Recurring end date must be after closure end date',
  path: ['recurringPattern', 'endDate']
});

// Update closure validation schema
export const updateClosureSchema = z.object({
  startDate: z.string()
    .refine((val) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return dateRegex.test(val) || datetimeRegex.test(val) || !isNaN(Date.parse(val));
    }, 'Start date must be a valid date')
    .optional(),
  
  endDate: z.string()
    .refine((val) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      return dateRegex.test(val) || datetimeRegex.test(val) || !isNaN(Date.parse(val));
    }, 'End date must be a valid date')
    .optional(),
  
  reason: z.string()
    .min(5, 'Reason must be at least 5 characters')
    .max(200, 'Reason must be less than 200 characters')
    .trim()
    .optional(),
  
  type: z.nativeEnum(ClosureType).optional(),
  
  isActive: z.boolean().optional()
});

export type CreateClosureData = z.infer<typeof createClosureSchema>;
export type CreateEnhancedClosureData = z.infer<typeof createEnhancedClosureSchema>;
export type UpdateClosureData = z.infer<typeof updateClosureSchema>;

// Field validation helper
export const validateClosureField = <T extends keyof CreateEnhancedClosureData>(
  field: T, 
  value: CreateEnhancedClosureData[T],
  formData?: Partial<CreateEnhancedClosureData>
): string | null => {
  try {
    // For complex validations that depend on other fields, validate the entire form
    if (field === 'endDate' || field === 'notificationMessage' || field === 'notificationChannels') {
      const testData = { ...formData, [field]: value };
      createEnhancedClosureSchema.parse(testData);
      return null;
    }
    
    // For simple field validation, use the base schema
    const fieldSchema = enhancedClosureBaseSchema.shape[field];
    if (fieldSchema) {
      fieldSchema.parse(value);
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => 
        err.path.length === 0 || err.path[0] === field
      );
      return fieldError?.message || 'Invalid value';
    }
    return 'Invalid value';
  }
};

// Validate entire closure form
export const validateClosureForm = (
  data: Partial<CreateEnhancedClosureData>,
  useEnhanced = true
): { 
  isValid: boolean; 
  errors: Partial<Record<keyof CreateEnhancedClosureData, string>>;
  fieldErrors?: Record<string, string>;
} => {
  try {
    const schema = useEnhanced ? createEnhancedClosureSchema : createClosureSchema;
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof CreateEnhancedClosureData, string>> = {};
      const fieldErrors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        const firstPath = err.path[0] as keyof CreateEnhancedClosureData;
        
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

// Real-time validation for specific scenarios
export const validateDateRange = (startDate: string, endDate: string): string | null => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) return 'Invalid start date';
    if (isNaN(end.getTime())) return 'Invalid end date';
    if (end < start) return 'End date must be on or after start date';
    
    return null;
  } catch {
    return 'Invalid date range';
  }
};

export const validateNotificationSettings = (
  notifyCustomers: boolean,
  channels: string[],
  message: string
): string | null => {
  if (!notifyCustomers) return null;
  
  if (channels.length === 0) {
    return 'At least one notification channel must be selected';
  }
  
  if (!message.trim()) {
    return 'Notification message is required when notifying customers';
  }
  
  if (message.length > 500) {
    return 'Notification message must be less than 500 characters';
  }
  
  return null;
};

// Debounced validation for performance
export const createDebouncedValidator = (
  validator: (data: any) => { isValid: boolean; errors: any },
  delay = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (data: any, callback: (result: { isValid: boolean; errors: any }) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(validator(data));
    }, delay);
  };
};