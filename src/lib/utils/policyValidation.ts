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
  } catch (error: any) {
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
  } catch (error) {
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
  } catch (error) {
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
export const getPolicyErrorMessage = (error: any): string => {
  let errorMessage = typeof error === 'string' ? error : error?.message || '';

  // Strip English prefixes from API errors
  const prefixesToRemove = [
    'Cannot book appointment: ',
    'Cannot cancel appointment: ',
    'Cannot update appointment: ',
    'Cannot delete appointment: '
  ];

  for (const prefix of prefixesToRemove) {
    if (errorMessage.startsWith(prefix)) {
      errorMessage = errorMessage.substring(prefix.length);
      break;
    }
  }

  // If the message is already in Turkish and from the API, return it
  if (errorMessage && errorMessage.trim() && !errorMessage.includes('Error') && !errorMessage.includes('error')) {
    return errorMessage;
  }

  // Fallback error map for older messages or specific cases
  const errorMap: Record<string, string> = {
    'Aylık maksimum iptal sayısına ulaştınız':
      'İşletmenin belirlediği aylık iptal limitine ulaştınız. Yeni randevu alamazsınız',
    'Aylık maksimum gelmeme sayısına ulaştınız':
      'İşletmenin belirlediği aylık gelmeme limitine ulaştınız. Yeni randevu alamazsınız',
    'Customer is banned':
      'İşletme tarafından engellendiniz. Randevu alamazsınız',
    'Randevu iptali için en az':
      'İşletmenin iptal politikası gereği randevu iptali için yeterli süre kalmamış',
    'Customer ID is required': 'Müşteri kimliği gereklidir',
    'Access denied': 'Bu işlem için yetkiniz bulunmuyor'
  };

  for (const [key, message] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }

  return errorMessage || 'Bir hata oluştu';
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
