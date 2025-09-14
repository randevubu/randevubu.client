import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Error response structure from your backend
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
  statusCode: number;
}

// Handle API errors and show appropriate toast messages
export function handleApiError(
  error: AxiosError<ApiErrorResponse>,
  translateError?: (errorCode: string) => string,
  showToast: boolean = true
): string {
  let errorMessage: string;

  if (error.response?.data?.message) {
    // Use the message from the backend (already translated based on Accept-Language)
    errorMessage = error.response.data.message;
  } else if (error.response?.data?.code && translateError) {
    // If we have an error code and translation function, use it
    errorMessage = translateError(error.response.data.code);
  } else if (error.response?.status) {
    // Handle HTTP status codes
    switch (error.response.status) {
      case 401:
        errorMessage = 'Unauthorized access';
        break;
      case 403:
        errorMessage = 'Access forbidden';
        break;
      case 404:
        errorMessage = 'Resource not found';
        break;
      case 429:
        errorMessage = 'Too many requests. Please wait.';
        break;
      case 500:
        errorMessage = 'Internal server error';
        break;
      case 503:
        errorMessage = 'Service unavailable';
        break;
      default:
        errorMessage = `Request failed with status ${error.response.status}`;
    }
  } else if (error.code === 'NETWORK_ERROR') {
    errorMessage = 'Network error. Please check your connection.';
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timeout. Please try again.';
  } else {
    errorMessage = 'An unexpected error occurred';
  }

  if (showToast) {
    toast.error(errorMessage);
  }

  return errorMessage;
}

// Handle success responses
export function handleApiSuccess(message: string, showToast: boolean = true): void {
  if (showToast) {
    toast.success(message);
  }
}

// Check if error is an API error
export function isApiError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return error instanceof AxiosError;
}

// Extract error message from any error type
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

// Common error codes that might be returned by your backend
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Authorization
  ACCESS_DENIED: 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Business Logic
  BUSINESS_NOT_FOUND: 'BUSINESS_NOT_FOUND',
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];