import { AxiosError } from 'axios';
import { ApiResponse } from '@/src/types/api';

/**
 * Type-safe error extractor utility
 * Extracts error messages from various error types while maintaining type safety
 */

/**
 * Check if error is an Axios error with API response
 */
export function isAxiosError<T = ApiResponse>(error: unknown): error is AxiosError<T> {
  return (error as AxiosError<T>).isAxiosError === true;
}

/**
 * Extract error message from API error response
 * Prioritizes backend's translated messages
 * 
 * @param error - Unknown error (could be AxiosError, Error, or anything)
 * @param fallback - Fallback message if no error message found
 * @returns Extracted error message or fallback
 */
export function extractErrorMessage(
  error: unknown,
  fallback: string = 'An error occurred'
): string {
  // Handle Axios errors with API response
  if (isAxiosError<ApiResponse>(error)) {
    // Priority 1: Backend's translated error message (new structure)
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    
    // Priority 2: Backend message (legacy format)
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Priority 3: Error object itself (if string)
    if (error.response?.data?.error && typeof error.response.data.error === 'string') {
      return error.response.data.error;
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback
  return fallback;
}

/**
 * Extract error from API response with full type safety
 * Returns the error object if it exists in the response
 */
export function extractApiError(error: unknown): ApiResponse['error'] | null {
  if (isAxiosError<ApiResponse>(error)) {
    return error.response?.data?.error || null;
  }
  return null;
}

/**
 * Check if error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !error.response && (error.request !== undefined || error.code === 'NETWORK_ERROR');
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
  }
  return false;
}
