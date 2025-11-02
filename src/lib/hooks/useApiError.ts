'use client';

import { useCallback } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useErrorTranslations, translateApiError } from '../utils/translations';

export interface ApiErrorResponse {
  success: boolean;
  statusCode?: number;
  error?: {
    code: string;
    key: string; // Translation key (e.g., "errors.auth.unauthorized")
    message: string; // Translated message from backend (already in detected language)
    requestId?: string;
    details?: any;
  };
  // Legacy format support
  message?: string;
  code?: string;
  details?: any;
}

export function useApiError() {
  const errorTranslations = useErrorTranslations();

  const handleError = useCallback(
    (error: AxiosError<ApiErrorResponse>, showToast: boolean = true): string => {
      let errorMessage: string;

      // Priority 1: Use backend's translated message (recommended approach)
      // Backend already translated the message based on detected language
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } 
      // Priority 2: Use backend message (legacy format or direct message)
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Priority 3: Try frontend translation using backend's translation key
      else if (error.response?.data?.error?.key) {
        try {
          // Remove 'errors.' prefix if present and try frontend translation
          const key = error.response.data.error.key.replace(/^errors\./, '');
          // Try to translate using frontend i18n
          const translated = errorTranslations(key);
          if (translated && translated !== key) {
            errorMessage = translated;
          } else {
            // Fallback to backend's translated message if frontend doesn't have translation
            errorMessage = error.response.data.error.message || translateApiError(error.response.data.error.code, errorTranslations);
          }
        } catch {
          // If translation fails, use backend message or fallback
          errorMessage = error.response.data.error.message || translateApiError(error.response.data.error.code, errorTranslations);
        }
      }
      // Priority 4: Translate error code (legacy support)
      else if (error.response?.data?.error?.code) {
        const errorData = error.response.data.error;
        if (errorData.code === 'VALIDATION_ERROR' && errorData.details?.field) {
          const field = errorData.details.field;
          try {
            errorMessage = errorTranslations(`validation.${field}`);
          } catch {
            errorMessage = errorTranslations('validation.general');
          }
        } else {
          errorMessage = translateApiError(errorData.code, errorTranslations);
        }
      }
      // Priority 5: Handle legacy flat error structure
      else if (error.response?.data?.code) {
        if (error.response.data.code === 'VALIDATION_ERROR' && error.response.data.details?.field) {
          const field = error.response.data.details.field;
          try {
            errorMessage = errorTranslations(`validation.${field}`);
          } catch {
            errorMessage = errorTranslations('validation.general');
          }
        } else {
          errorMessage = translateApiError(error.response.data.code, errorTranslations);
        }
      }
      // Priority 6: Handle HTTP status codes with translations
      else {
        switch (error.response?.status) {
          case 401:
            errorMessage = errorTranslations('auth.unauthorized');
            break;
          case 403:
            errorMessage = errorTranslations('auth.accessDenied');
            break;
          case 404:
            errorMessage = errorTranslations('system.internalError');
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