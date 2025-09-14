import { useTranslations } from 'next-intl';

// Type definitions for translation keys based on our message structure
export type ErrorTranslationKey =
  | `errors.auth.${string}`
  | `errors.business.${string}`
  | `errors.appointment.${string}`
  | `errors.service.${string}`
  | `errors.customer.${string}`
  | `errors.staff.${string}`
  | `errors.role.${string}`
  | `errors.permission.${string}`
  | `errors.validation.${string}`
  | `errors.system.${string}`
  | `errors.subscription.${string}`
  | `errors.notification.${string}`;

export type CommonTranslationKey = `common.${string}`;

// Hook for error translations
export function useErrorTranslations() {
  return useTranslations('errors');
}

// Hook for common translations
export function useCommonTranslations() {
  return useTranslations('common');
}

// Utility function to get nested translation key
export function getNestedTranslationKey(
  category: string,
  key: string
): ErrorTranslationKey {
  return `errors.${category}.${key}` as ErrorTranslationKey;
}

// Utility function to translate API error codes to user-friendly messages
export function translateApiError(
  errorCode: string,
  errorTranslations: ReturnType<typeof useErrorTranslations>,
  fallbackMessage?: string
): string {
  // Handle specific error codes
  switch (errorCode) {
    case 'VALIDATION_ERROR':
      return errorTranslations('validation.general');
    case 'UNAUTHORIZED':
      return errorTranslations('auth.unauthorized');
    case 'ACCESS_DENIED':
      return errorTranslations('auth.accessDenied');
    default:
      // Split error code by dots to get category and specific error
      const parts = errorCode.split('.');

      if (parts.length >= 2) {
        const category = parts[0];
        const specificError = parts[1];

        try {
          // Try to get the specific translation
          return errorTranslations(`${category}.${specificError}`);
        } catch {
          // If specific translation not found, try category-level fallback
          try {
            return errorTranslations(`${category}.general`);
          } catch {
            // If category fallback not found, use system fallback
            return errorTranslations('system.internalError');
          }
        }
      }

      // If error code doesn't follow expected format, use fallback
      return fallbackMessage || errorTranslations('system.internalError');
  }
}

// Utility to translate validation errors with field name interpolation
export function translateValidationError(
  fieldName: string,
  errorTranslations: ReturnType<typeof useErrorTranslations>
): string {
  return errorTranslations('validation.requiredField', { fieldName });
}

// Type guard for error translation keys
export function isErrorTranslationKey(key: string): key is ErrorTranslationKey {
  return key.startsWith('errors.');
}

// Common error codes that your backend might return
export const API_ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: 'auth.unauthorized',
  INVALID_TOKEN: 'auth.invalidToken',
  TOKEN_EXPIRED: 'auth.tokenExpired',
  ACCESS_DENIED: 'auth.accessDenied',
  INVALID_CREDENTIALS: 'auth.invalidCredentials',

  // Business errors
  BUSINESS_NOT_FOUND: 'business.notFound',
  BUSINESS_ACCESS_DENIED: 'business.accessDenied',
  SUBSCRIPTION_REQUIRED: 'business.subscriptionRequired',

  // Appointment errors
  APPOINTMENT_NOT_FOUND: 'appointment.notFound',
  TIME_CONFLICT: 'appointment.timeConflict',
  OUTSIDE_HOURS: 'appointment.outsideHours',

  // System errors
  INTERNAL_ERROR: 'system.internalError',
  RATE_LIMIT_EXCEEDED: 'system.rateLimitExceeded',
  SERVICE_UNAVAILABLE: 'system.serviceUnavailable',
} as const;