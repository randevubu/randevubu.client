/**
 * Error Handling Utilities
 * 
 * Provides standardized error handling for API responses following
 * the frontend integration guide best practices.
 */

export interface ApiError extends Error {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isAuthError?: boolean;
  isPermissionError?: boolean;
}

/**
 * Creates a standardized error object from various error sources
 */
export function createApiError(error: unknown): ApiError {
  // Network errors (fetch failures, CORS, etc.)
  if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      name: 'NetworkError',
      message: 'You appear to be offline. Please check your connection.',
      isNetworkError: true,
    } as ApiError;
  }

  // HTTP status errors
  if (error && typeof error === 'object' && 'status' in error) {
    const errorObj = error as { status: number; message?: string; code?: string };
    const apiError: ApiError = {
      name: 'ApiError',
      message: errorObj.message || 'An error occurred',
      status: errorObj.status,
      code: errorObj.code,
    };
    
    switch (errorObj.status) {
      case 401:
        apiError.message = 'Authentication required. Please log in again.';
        apiError.code = 'UNAUTHORIZED';
        apiError.isAuthError = true;
        break;
      case 403:
        apiError.message = 'Access denied. Business role required.';
        apiError.code = 'BUSINESS_ACCESS_DENIED';
        apiError.isPermissionError = true;
        break;
      case 404:
        apiError.message = 'Resource not found.';
        apiError.code = 'NOT_FOUND';
        break;
      case 422:
        apiError.message = 'Invalid request data.';
        apiError.code = 'VALIDATION_ERROR';
        break;
      case 429:
        apiError.message = 'Too many requests. Please try again later.';
        apiError.code = 'RATE_LIMITED';
        break;
      case 500:
        apiError.message = 'Internal server error. Please try again later.';
        apiError.code = 'INTERNAL_SERVER_ERROR';
        break;
      default:
        apiError.message = errorObj.message || `HTTP ${errorObj.status}: Unknown error`;
    }
    
    return apiError;
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      name: 'ApiError',
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    } as ApiError;
  }

  return {
    name: 'ApiError',
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  } as ApiError;
}

/**
 * Determines if an error should trigger a retry
 */
export function shouldRetryError(error: ApiError, attemptCount: number): boolean {
  // Don't retry auth or permission errors
  if (error.isAuthError || error.isPermissionError) {
    return false;
  }

  // Don't retry validation errors
  if (error.code === 'VALIDATION_ERROR') {
    return false;
  }

  // Retry network errors and server errors up to 3 times
  if (error.isNetworkError || error.status >= 500) {
    return attemptCount < 3;
  }

  // Retry rate limit errors with longer delay
  if (error.code === 'RATE_LIMITED') {
    return attemptCount < 2;
  }

  return false;
}

/**
 * Gets the appropriate retry delay based on error type and attempt count
 */
export function getRetryDelay(error: ApiError, attemptCount: number): number {
  // Rate limit errors should wait longer
  if (error.code === 'RATE_LIMITED') {
    return Math.min(5000 * (attemptCount + 1), 30000); // 5s, 10s, max 30s
  }

  // Network errors use exponential backoff
  if (error.isNetworkError) {
    return Math.min(1000 * Math.pow(2, attemptCount), 30000); // 1s, 2s, 4s, 8s, max 30s
  }

  // Server errors use moderate backoff
  if (error.status >= 500) {
    return Math.min(2000 * (attemptCount + 1), 15000); // 2s, 4s, 6s, max 15s
  }

  // Default exponential backoff
  return Math.min(1000 * Math.pow(2, attemptCount), 30000);
}
