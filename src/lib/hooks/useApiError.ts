'use client';

import { useCallback } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useErrorTranslations, translateApiError } from '../utils/translations';

export interface ApiErrorResponse {
  success: boolean;
  error?: {
    message: string;
    code?: string;
    details?: any;
    requestId?: string;
  };
  // Legacy format support
  message?: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export function useApiError() {
  const errorTranslations = useErrorTranslations();

  const handleError = useCallback(
    (error: AxiosError<ApiErrorResponse>, showToast: boolean = true): string => {
      let errorMessage: string;

      // Prioritize frontend translations over backend messages
      if (error.response?.data?.error?.code) {
        // Handle nested error structure: { error: { code: "...", details: { field: "..." } } }
        const errorData = error.response.data.error;
        if (errorData.code === 'VALIDATION_ERROR' && errorData.details?.field) {
          const field = errorData.details.field;
          try {
            errorMessage = errorTranslations(`validation.${field}`);
          } catch {
            // Fallback to general validation error
            errorMessage = errorTranslations('validation.general');
          }
        } else if (errorData.code) {
          // Translate error code using our translation system
          errorMessage = translateApiError(errorData.code, errorTranslations);
        } else {
          errorMessage = errorTranslations('system.internalError');
        }
      } else if (error.response?.data?.code) {
        // Handle legacy flat error structure
        if (error.response.data.code === 'VALIDATION_ERROR' && error.response.data.details?.field) {
          const field = error.response.data.details.field;
          try {
            errorMessage = errorTranslations(`validation.${field}`);
          } catch {
            // Fallback to general validation error
            errorMessage = errorTranslations('validation.general');
          }
        } else {
          // Translate error code using our translation system
          errorMessage = translateApiError(error.response.data.code, errorTranslations);
        }
      } else if (error.response?.data?.error?.message) {
        // Use nested backend message as fallback
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        // Use backend message as fallback if no code is provided
        errorMessage = error.response.data.message;
      } else {
        // Handle HTTP status codes with translations
        switch (error.response?.status) {
          case 401:
            errorMessage = errorTranslations('auth.unauthorized');
            break;
          case 403:
            errorMessage = errorTranslations('auth.accessDenied');
            break;
          case 404:
            errorMessage = errorTranslations('system.internalError'); // Generic fallback
            break;
          case 429:
            errorMessage = errorTranslations('system.rateLimitExceeded');
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = errorTranslations('system.internalError');
            break;
          default:
            if (error.code === 'NETWORK_ERROR') {
              errorMessage = errorTranslations('system.serviceUnavailable');
            } else if (error.code === 'ECONNABORTED') {
              errorMessage = errorTranslations('system.serviceUnavailable');
            } else {
              errorMessage = errorTranslations('system.internalError');
            }
        }
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      return errorMessage;
    },
    [errorTranslations]
  );

  const handleSuccess = useCallback((message: string, showToast: boolean = true) => {
    if (showToast) {
      toast.success(message);
    }
  }, []);

  return {
    handleError,
    handleSuccess,
  };
}