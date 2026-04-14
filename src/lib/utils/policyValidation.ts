/**
 * Policy Validation Utilities
 *
 * Helper functions for validating customer eligibility for booking
 * and cancellation actions based on cancellation policies.
 */

import { cancellationPoliciesService } from '../services/cancellationPolicies';
import { CustomerPolicyStatus } from '../../types/cancellationPolicies';

export interface BookingEligibilityResult {
  eligible: boolean;
  reason?: string;
  status?: CustomerPolicyStatus;
}

export interface CancellationEligibilityResult {
  eligible: boolean;
  reason?: string;
  hoursUntilAppointment?: number;
  minHoursRequired?: number;
}

/**
 * Check if a customer is eligible to book an appointment
 *
 * @param customerId - Customer ID to check
 * @returns Promise<BookingEligibilityResult>
 */
export const checkBookingEligibility = async (
  customerId: string
): Promise<BookingEligibilityResult> => {
  try {
    const response = await cancellationPoliciesService.getCustomerPolicyStatus(customerId);
    const status = response.data;

    // Check if customer is banned
    if (status.isBanned) {
      let reason = 'Bu müşteri sistemden engellenmiştir';
      if (status.bannedUntil) {
        const banEndDate = new Date(status.bannedUntil).toLocaleDateString('tr-TR');
        reason += ` (${banEndDate} tarihine kadar)`;
      }
      return {
        eligible: false,
        reason,
        status
      };
    }

    // Check if policy enforcement is disabled
    if (!status.policySettings.enablePolicyEnforcement) {
      return {
        eligible: true,
        status
      };
    }

    // Check cancellation limit
    if (status.currentCancellations >= status.policySettings.maxMonthlyCancellations) {
      return {
        eligible: false,
        reason: `Müşteri aylık maksimum iptal sayısına ulaştı (${status.policySettings.maxMonthlyCancellations})`,
        status
      };
    }

    // Check no-show limit
    if (status.currentNoShows >= status.policySettings.maxMonthlyNoShows) {
      return {
        eligible: false,
        reason: `Müşteri aylık maksimum gelmeme sayısına ulaştı (${status.policySettings.maxMonthlyNoShows})`,
        status
      };
    }

    // Customer is eligible
    return {
      eligible: true,
      status
    };
  } catch (error: unknown) {
    // If we can't check status, allow booking but log the error
    console.error('Failed to check booking eligibility:', error);
    return {
      eligible: true,
      reason: undefined,
      status: undefined
    };
  }
};

/**
 * Check if an appointment can be cancelled based on time restrictions
 *
 * @param appointmentStartTime - Appointment start time (ISO string or Date)
 * @param minCancellationHours - Minimum hours before appointment for cancellation
 * @returns CancellationEligibilityResult
 */
export const checkCancellationEligibility = (
  appointmentStartTime: string | Date,
  minCancellationHours: number
): CancellationEligibilityResult => {
  try {
    const startTime =
      typeof appointmentStartTime === 'string'
        ? new Date(appointmentStartTime)
        : appointmentStartTime;

    const now = new Date();
    const hoursUntilAppointment = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < minCancellationHours) {
      return {
        eligible: false,
        reason: `Randevu iptali için en az ${minCancellationHours} saat önceden iptal etmeniz gerekmektedir`,
        hoursUntilAppointment: Math.floor(hoursUntilAppointment),
        minHoursRequired: minCancellationHours
      };
    }

    return {
      eligible: true,
      hoursUntilAppointment: Math.floor(hoursUntilAppointment),
      minHoursRequired: minCancellationHours
    };
  } catch (error: unknown) {
    console.error('Failed to check cancellation eligibility:', error);
    // If we can't parse the date, don't allow cancellation
    return {
      eligible: false,
      reason: 'Randevu tarihi geçersiz'
    };
  }
};

/**
 * Calculate hours until an appointment
 *
 * @param appointmentStartTime - Appointment start time (ISO string or Date)
 * @returns Number of hours until appointment (can be negative if past)
 */
export const calculateHoursUntil = (appointmentStartTime: string | Date): number => {
  try {
    const startTime =
      typeof appointmentStartTime === 'string'
        ? new Date(appointmentStartTime)
        : appointmentStartTime;

    const now = new Date();
    const hoursUntil = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntil;
  } catch (error: unknown) {
    console.error('Failed to calculate hours until appointment:', error);
    return 0;
  }
};

/**
 * Get user-friendly error message for policy violations
 *
 * @param error - Error message or object
 * @returns User-friendly error message
 */
/**
 * Interpolate {param} placeholders in a message template.
 */
const interpolateErrorParams = (template: string, params: Record<string, unknown>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
};

/**
 * Static Turkish translation map for customer-facing error messages.
 * Keyed by the server's error.key (e.g. "errors.appointment.insufficientAdvance").
 * Supports {param} interpolation.
 */
const CUSTOMER_ERROR_TRANSLATIONS: Record<string, string> = {
  'errors.appointment.notFound': 'Randevu bulunamadı.',
  'errors.appointment.accessDenied': 'Bu randevuya erişim yetkiniz bulunmuyor.',
  'errors.appointment.timeConflict': 'Bu saatte zaten bir randevunuz var. Lütfen başka bir saat seçin.',
  'errors.appointment.pastDate': 'Geçmiş bir tarih ve saat için randevu oluşturulamaz. Lütfen ileri bir saat seçin.',
  'errors.appointment.tooFarFuture': 'Bu işletme için en fazla {maxDays} gün sonrasına kadar randevu alınabilir.',
  'errors.appointment.outsideHours': 'Seçtiğiniz saat işletmenin çalışma saatleri dışında.',
  'errors.appointment.staffNotAvailable': 'Seçilen saatte personelin başka bir randevusu var. Lütfen uygun başka bir saat seçin.',
  'errors.appointment.serviceUnavailable': 'Seçilen hizmet bulunamadı veya şu an aktif değil.',
  'errors.appointment.insufficientAdvance': 'Randevuyu en az {minHours} saat önceden almanız gerekmektedir.',
  'errors.appointment.dailyLimitReached': 'Bu tarih için günlük randevu kotası ({maxDaily}) dolmuştur. Lütfen başka bir gün seçin.',
  'errors.appointment.bookingPolicyViolation': 'İşletme kuralları gereği şu an yeni randevu alınamıyor.',
  'errors.appointment.alreadyConfirmed': 'Bu randevu zaten onaylanmış.',
  'errors.appointment.alreadyCompleted': 'Bu randevu zaten tamamlanmış.',
  'errors.appointment.alreadyCancelled': 'Bu randevu zaten iptal edilmiş.',
  'errors.appointment.cannotCancel': 'Bu randevu iptal edilemez.',
  'errors.appointment.noShowNotAllowed': 'İşletme kuralları gereği gelmedi olarak işaretlenemez.',
  'errors.business.notFound': 'İşletme bulunamadı.',
  'errors.business.closed': 'İşletme bu tarihte kapalı. Lütfen başka bir gün seçin.',
  'errors.business.accessDenied': 'Bu işletmeye erişim yetkiniz bulunmuyor.',
  'errors.customer.notFound': 'Müşteri bulunamadı.',
  'errors.staff.notFound': 'Seçilen personel bulunamadı.',
  'errors.staff.notAvailable': 'Seçilen personel şu an aktif değil.',
  'errors.auth.accessDenied': 'Bu işlem için yetkiniz bulunmuyor.',
  'errors.auth.accountDisabled': 'Hesabınız pasif durumda.',
  'errors.validation.general': 'Girdiğiniz bilgilerde hata var. Lütfen kontrol edin.',
  'errors.system.internalError': 'Bir hata oluştu. Lütfen tekrar deneyin.',
};

export const getPolicyErrorMessage = (error: unknown): string => {
  // 1. If we received the structured error object (from extractApiError), use its key + params
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;

    // Translation key path
    if (typeof errObj.key === 'string' && errObj.key) {
      const template = CUSTOMER_ERROR_TRANSLATIONS[errObj.key];
      if (template) {
        const params = (errObj.params && typeof errObj.params === 'object')
          ? errObj.params as Record<string, unknown>
          : {};
        return interpolateErrorParams(template, params);
      }
    }

    // Fall back to the message property
    if (typeof errObj.message === 'string' && errObj.message) {
      return errObj.message;
    }
  }

  // 2. String error
  if (typeof error === 'string' && error.trim()) {
    // Strip Axios "Request failed with status code XXX"
    if (error.startsWith('Request failed')) {
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
    return error;
  }

  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

/**
 * Check if customer is at risk of being banned
 *
 * @param status - Customer policy status
 * @returns True if customer is at risk (>= 80% of limits)
 */
export const isCustomerAtRisk = (status: CustomerPolicyStatus): boolean => {
  if (status.isBanned || status.gracePeriodActive) {
    return false;
  }

  const cancellationThreshold = status.policySettings.maxMonthlyCancellations * 0.8;
  const noShowThreshold = status.policySettings.maxMonthlyNoShows * 0.8;

  return (
    status.currentCancellations >= cancellationThreshold ||
    status.currentNoShows >= noShowThreshold
  );
};

/**
 * Get status color based on policy violations
 *
 * @param status - Customer policy status
 * @returns Color string for UI (red, yellow, green, blue)
 */
export const getStatusColor = (
  status: CustomerPolicyStatus
): 'red' | 'yellow' | 'green' | 'blue' => {
  if (status.isBanned) {
    return 'red';
  }

  if (status.gracePeriodActive) {
    return 'blue';
  }

  // Check if at or exceeded limits
  if (
    status.currentCancellations >= status.policySettings.maxMonthlyCancellations ||
    status.currentNoShows >= status.policySettings.maxMonthlyNoShows
  ) {
    return 'red';
  }

  // Check if approaching limits (80% or more)
  if (isCustomerAtRisk(status)) {
    return 'yellow';
  }

  return 'green';
};
