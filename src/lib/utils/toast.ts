import toast from 'react-hot-toast';

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    requestId?: string;
    details?: {
      field?: string;
      value?: string;
      suggestions?: string[];
    };
    stack?: string;
    context?: {
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
      timestamp?: string;
      endpoint?: string;
      method?: string;
    };
  };
}

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (message: string) => {
  toast.error(message);
};

export const showInfoToast = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    duration: Infinity, // Keep the toast until manually dismissed
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

const truncateMessage = (message: string, maxLength: number = 80): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

const getShortErrorMessage = (fullMessage: string): string => {
  // Common patterns to make messages more user-friendly
  const patterns = [
    {
      pattern: /Notification settings validation failed/,
      replacement: 'En az bir bildirim kanalı aktif olmalıdır'
    },
    {
      pattern: /At least one reminder channel must be selected/,
      replacement: 'En az bir bildirim kanalı seçilmelidir'
    },
    {
      pattern: /All selected reminder channels must be enabled/,
      replacement: 'Seçilen tüm bildirim kanalları etkinleştirilmelidir'
    },
    {
      pattern: /Body validation failed: (.+)/,
      replacement: 'Doğrulama hatası'
    },
    {
      pattern: /(.+) can only contain (.+)/,
      replacement: 'Geçersiz format'
    },
    {
      pattern: /Field (.+) is required/,
      replacement: 'Zorunlu alan eksik'
    },
    {
      pattern: /File size too large/,
      replacement: 'Dosya boyutu çok büyük'
    },
    {
      pattern: /Invalid file type/,
      replacement: 'Geçersiz dosya türü'
    }
  ];

  for (const { pattern, replacement } of patterns) {
    if (pattern.test(fullMessage)) {
      return replacement;
    }
  }

  // Fallback: truncate long messages
  return truncateMessage(fullMessage, 60);
};

export const handleApiError = (error: ApiErrorResponse | any) => {
  if (error?.error?.message) {
    const fullMessage = error.error.message;
    const suggestions = error.error.details?.suggestions;

    // Use short message for toast, but keep full context available
    let toastMessage = getShortErrorMessage(fullMessage);

    // Add suggestion if available and short
    if (suggestions && suggestions.length > 0) {
      const suggestion = suggestions[0];
      if (suggestion.length <= 40) {
        toastMessage += `\n${suggestion}`;
      }
    }

    showErrorToast(toastMessage);
  } else if (error?.response?.data?.error?.message) {
    // Handle Axios error responses
    const apiError = error.response.data;
    handleApiError(apiError);
  } else if (error?.response?.data?.message) {
    // Handle legacy error format
    showErrorToast(getShortErrorMessage(error.response.data.message));
  } else if (error?.message) {
    showErrorToast(getShortErrorMessage(error.message));
  } else {
    showErrorToast('Beklenmeyen bir hata oluştu');
  }
};