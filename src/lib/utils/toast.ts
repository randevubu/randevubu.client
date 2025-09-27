import toast from 'react-hot-toast';
import { useErrorTranslations } from './translations';

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

export const showPlanChangeSuccessToast = (responseData: any, message: string) => {
  const metadata = responseData.metadata;
  const changeType = metadata?.changeType || 'change';
  const effectiveDate = metadata?.effectiveDate;
  const prorationAmount = metadata?.prorationAmount;
  const previousPlanId = metadata?.previousPlanId;
  const currentPlanId = responseData.planId;

  const planNames = {
    'plan_starter_monthly': 'Başlangıç (Aylık)',
    'plan_professional_monthly': 'Profesyonel (Aylık)',
    'plan_premium_monthly': 'Premium (Aylık)',
    'plan_starter_yearly': 'Başlangıç (Yıllık)',
    'plan_professional_yearly': 'Profesyonel (Yıllık)',
    'plan_premium_yearly': 'Premium (Yıllık)'
  };

  // 1. Main success message
  if (changeType === 'upgrade') {
    toast.success('🎉 Plan yükseltme başarılı!', { duration: 4000 });
  } else if (changeType === 'downgrade') {
    toast.success('⬇️ Plan düşürme başarılı!', { duration: 4000 });
  } else {
    toast.success('✅ Plan değişikliği tamamlandı!', { duration: 4000 });
  }

  // 2. Plan transition (after a small delay)
  if (previousPlanId && currentPlanId && previousPlanId !== currentPlanId) {
    const oldPlanName = planNames[previousPlanId as keyof typeof planNames] || previousPlanId;
    const newPlanName = planNames[currentPlanId as keyof typeof planNames] || currentPlanId;

    setTimeout(() => {
      toast(`${oldPlanName} → ${newPlanName}`, {
        duration: 4000,
        icon: '🔄',
        style: {
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          color: '#0c4a6e'
        }
      });
    }, 500);
  }

  // 3. Effective date information (after another delay)
  setTimeout(() => {
    if (effectiveDate === 'immediate') {
      toast('Değişiklik hemen aktif oldu', {
        duration: 4000,
        icon: '⚡',
        style: {
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          color: '#166534'
        }
      });
    } else if (effectiveDate === 'next_billing_cycle') {
      const nextBillingDate = new Date(responseData.nextBillingDate).toLocaleDateString('tr-TR');
      toast(`${nextBillingDate} tarihinde aktif olacak`, {
        duration: 4000,
        icon: '📅',
        style: {
          background: '#fefce8',
          border: '1px solid #eab308',
          color: '#a16207'
        }
      });
    }
  }, 1000);

  // 4. Payment information for upgrades (if available, after another delay)
  if (responseData.paymentInfo) {
    setTimeout(() => {
      const paymentInfo = responseData.paymentInfo;
      const formattedAmount = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: paymentInfo.currency?.toUpperCase() || 'TRY'
      }).format(paymentInfo.amount);

      toast.success(`💳 Ödeme başarılı: ${formattedAmount}`, {
        duration: 5000,
        icon: '💳'
      });
    }, 1500);
  } else if (prorationAmount && prorationAmount > 0) {
    // 4. Proration information (if available, after another delay)
    setTimeout(() => {
      const formattedAmount = new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(prorationAmount);
      toast.success(`💰 Prorasyon tutarı: ${formattedAmount}`, {
        duration: 5000,
        icon: '💰'
      });
    }, 1500);
  }
};

const truncateMessage = (message: string, maxLength: number = 80): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

const getShortErrorMessage = (fullMessage: string): string => {
  // Common patterns to make messages more user-friendly
  const patterns = [
    // Payment and subscription errors
    {
      pattern: /Payment method required/i,
      replacement: 'Plan yükseltme için ödeme yöntemi gerekli'
    },
    {
      pattern: /Payment failed/i,
      replacement: 'Ödeme işlemi başarısız oldu'
    },
    {
      pattern: /Payment.*declined/i,
      replacement: 'Ödeme reddedildi'
    },
    {
      pattern: /Payment.*error/i,
      replacement: 'Ödeme işlemi sırasında hata oluştu'
    },
    {
      pattern: /Cannot downgrade.*usage/i,
      replacement: 'Mevcut kullanımınız nedeniyle plan düşürülemez'
    },
    {
      pattern: /Cannot change to the same plan/i,
      replacement: 'Zaten bu plandasınız'
    },
    {
      pattern: /Invalid or inactive plan/i,
      replacement: 'Seçilen plan artık mevcut değil'
    },
    {
      pattern: /Plan not found/i,
      replacement: 'Plan bulunamadı'
    },
    {
      pattern: /Subscription not found/i,
      replacement: 'Abonelik bulunamadı'
    },
    {
      pattern: /Insufficient funds/i,
      replacement: 'Yetersiz bakiye'
    },
    {
      pattern: /Card declined/i,
      replacement: 'Kart reddedildi'
    },
    {
      pattern: /Card.*expired/i,
      replacement: 'Kartın süresi dolmuş'
    },
    {
      pattern: /Invalid.*card/i,
      replacement: 'Geçersiz kart bilgileri'
    },
    {
      pattern: /Invalid payment method/i,
      replacement: 'Geçersiz ödeme yöntemi'
    },
    {
      pattern: /Payment method.*not found/i,
      replacement: 'Ödeme yöntemi bulunamadı'
    },
    {
      pattern: /Iyzico.*error/i,
      replacement: 'Ödeme servisi hatası'
    },
    {
      pattern: /3D.*secure.*failed/i,
      replacement: '3D güvenlik doğrulaması başarısız'
    },
    {
      pattern: /Transaction.*failed/i,
      replacement: 'İşlem başarısız oldu'
    },
    {
      pattern: /Fraud.*detected/i,
      replacement: 'Güvenlik nedeniyle işlem engellendi'
    },
    {
      pattern: /Invalid.*amount/i,
      replacement: 'Geçersiz tutar'
    },
    // Existing patterns
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
      pattern: /Maximum 5 reminder times allowed/,
      replacement: 'Maksimum 5 hatırlatma zamanı seçilebilir'
    },
    {
      pattern: /Body validation failed: Maximum 5 reminder times allowed/,
      replacement: 'Maksimum 5 hatırlatma zamanı seçilebilir'
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

export const handleApiError = (error: ApiErrorResponse | any, errorTranslations?: ReturnType<typeof useErrorTranslations>) => {
  // Handle Axios error responses first (most common case)
  if (error?.response?.data?.error) {
    const apiError = error.response.data;
    const errorData = apiError.error;
    
    // Handle structured error responses with translation keys
    if (errorData.key && errorTranslations) {
      const errorKey = errorData.key;
      const errorParams = errorData.params || {};
      
      // Handle specific error types with their parameters
      if (errorKey === 'errors.business.staffLimitExceeded') {
        // Use translation for the base message and append the reason
        const baseMessage = errorTranslations('business.staffLimitExceeded');
        const reason = errorParams.reason || '';
        // Extract the current count from the reason if available
        const countMatch = reason.match(/Current: (\d+\/\d+)/);
        const countText = countMatch ? ` (Mevcut: ${countMatch[1]})` : '';
        showErrorToast(baseMessage + countText);
      } else if (errorKey === 'errors.business.smsQuotaExceeded') {
        const baseMessage = errorTranslations('business.smsQuotaExceeded');
        const reason = errorParams.reason || '';
        const countMatch = reason.match(/Current: (\d+\/\d+)/);
        const countText = countMatch ? ` (Mevcut: ${countMatch[1]})` : '';
        showErrorToast(baseMessage + countText);
      } else if (errorKey === 'errors.business.serviceLimitExceeded') {
        const baseMessage = errorTranslations('business.serviceLimitExceeded');
        const reason = errorParams.reason || '';
        const countMatch = reason.match(/Current: (\d+\/\d+)/);
        const countText = countMatch ? ` (Mevcut: ${countMatch[1]})` : '';
        showErrorToast(baseMessage + countText);
      } else if (errorKey === 'errors.business.customerLimitExceeded') {
        const baseMessage = errorTranslations('business.customerLimitExceeded');
        const reason = errorParams.reason || '';
        const countMatch = reason.match(/Current: (\d+\/\d+)/);
        const countText = countMatch ? ` (Mevcut: ${countMatch[1]})` : '';
        showErrorToast(baseMessage + countText);
      } else {
        // Fallback to generic error message
        const reason = errorParams.reason || errorData.message || 'Bir hata oluştu';
        showErrorToast(reason);
      }
    } else if (errorData.message) {
      // Handle direct error messages
      const fullMessage = errorData.message;
      const suggestions = errorData.details?.suggestions;

      // Use short message for toast, but keep full context available
      let toastMessage = getShortErrorMessage(fullMessage);

      // Don't add suggestions for specific error types that already have good messages
      const shouldSkipSuggestion = fullMessage.includes('Maximum 5 reminder times allowed') || 
                                   fullMessage.includes('At least one reminder time must be selected');

      // Add suggestion if available and short, but not for specific error types
      if (suggestions && suggestions.length > 0 && !shouldSkipSuggestion) {
        const suggestion = suggestions[0];
        if (suggestion.length <= 40) {
          toastMessage += `\n${suggestion}`;
        }
      }

      showErrorToast(toastMessage);
    } else {
      // Fallback for other error structures
      showErrorToast('Bir hata oluştu');
    }
  } else if (error?.error?.message) {
    // Handle direct API error responses (non-Axios)
    const fullMessage = error.error.message;
    const suggestions = error.error.details?.suggestions;

    // Use short message for toast, but keep full context available
    let toastMessage = getShortErrorMessage(fullMessage);

    // Don't add suggestions for specific error types that already have good messages
    const shouldSkipSuggestion = fullMessage.includes('Maximum 5 reminder times allowed') || 
                                 fullMessage.includes('At least one reminder time must be selected');

    // Add suggestion if available and short, but not for specific error types
    if (suggestions && suggestions.length > 0 && !shouldSkipSuggestion) {
      const suggestion = suggestions[0];
      if (suggestion.length <= 40) {
        toastMessage += `\n${suggestion}`;
      }
    }

    showErrorToast(toastMessage);
  } else if (error?.response?.data?.message) {
    // Handle legacy error format
    showErrorToast(getShortErrorMessage(error.response.data.message));
  } else if (error?.message) {
    showErrorToast(getShortErrorMessage(error.message));
  } else {
    showErrorToast('Beklenmeyen bir hata oluştu');
  }
};
