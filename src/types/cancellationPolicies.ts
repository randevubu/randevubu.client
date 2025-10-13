/**
 * Cancellation Policies Types
 *
 * Type definitions for business cancellation and no-show policies API.
 * Follows the API documentation structure with proper validation.
 */

export interface CancellationPolicySettings {
  businessId: string;
  minCancellationHours: number;
  maxMonthlyCancellations: number;
  maxMonthlyNoShows: number;
  enablePolicyEnforcement: boolean;
  policyWarningMessage: string;
  gracePeriodDays: number;
  autoBanEnabled: boolean;
  banDurationDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCancellationPolicyRequest {
  minCancellationHours?: number;
  maxMonthlyCancellations?: number;
  maxMonthlyNoShows?: number;
  enablePolicyEnforcement?: boolean;
  policyWarningMessage?: string;
  gracePeriodDays?: number;
  autoBanEnabled?: boolean;
  banDurationDays?: number;
}

export interface CancellationPolicyResponse {
  success: boolean;
  data: CancellationPolicySettings;
  message: string;
}

export interface CancellationPolicyError {
  success: false;
  error: string;
}

export interface CustomerPolicyStatus {
  customerId: string;
  businessId: string;
  currentCancellations: number;
  currentNoShows: number;
  isBanned: boolean;
  bannedUntil: string | null;
  banReason: string | null;
  gracePeriodActive: boolean;
  gracePeriodEndsAt: string | null;
  policySettings: CancellationPolicySettings;
  violations: PolicyViolation[];
}

export interface PolicyViolation {
  id: string;
  type: 'cancellation' | 'no-show';
  occurredAt: string;
  description: string;
}

export interface CustomerPolicyStatusResponse {
  success: boolean;
  data: CustomerPolicyStatus;
  message: string;
}

// Validation constants matching API documentation
export const CANCELLATION_POLICY_LIMITS = {
  MIN_CANCELLATION_HOURS: {
    MIN: 1,
    MAX: 168, // 1 week
    DEFAULT: 4
  },
  MAX_MONTHLY_CANCELLATIONS: {
    MIN: 0,
    MAX: 50,
    DEFAULT: 3
  },
  MAX_MONTHLY_NO_SHOWS: {
    MIN: 0,
    MAX: 20,
    DEFAULT: 2
  },
  GRACE_PERIOD_DAYS: {
    MIN: 0,
    MAX: 30,
    DEFAULT: 0
  },
  BAN_DURATION_DAYS: {
    MIN: 1,
    MAX: 365,
    DEFAULT: 30
  },
  POLICY_WARNING_MESSAGE: {
    MAX_LENGTH: 500
  }
} as const;

// Default policy warning message
export const DEFAULT_POLICY_WARNING_MESSAGE =
  'Bu kuralları aşan müşteriler sistemden otomatik olarak engellenecek ve bir daha işletmenizden randevu alamayacaktır. Bu politikalar müşteri deneyimini korumak ve adil bir rezervasyon sistemi sağlamak için uygulanır.';

// Predefined options for UI dropdowns
export const MIN_CANCELLATION_HOURS_OPTIONS = [
  { value: 1, label: '1 saat önce' },
  { value: 2, label: '2 saat önce' },
  { value: 4, label: '4 saat önce' },
  { value: 6, label: '6 saat önce' },
  { value: 12, label: '12 saat önce' },
  { value: 24, label: '1 gün önce' },
  { value: 48, label: '2 gün önce' },
  { value: 72, label: '3 gün önce' },
  { value: 168, label: '1 hafta önce' }
] as const;

export const MAX_MONTHLY_CANCELLATIONS_OPTIONS = [
  { value: 0, label: 'İptal edilemez' },
  { value: 1, label: '1 iptal' },
  { value: 2, label: '2 iptal' },
  { value: 3, label: '3 iptal' },
  { value: 5, label: '5 iptal' },
  { value: 10, label: '10 iptal' },
  { value: 15, label: '15 iptal' },
  { value: 20, label: '20 iptal' },
  { value: 30, label: '30 iptal' },
  { value: 50, label: '50 iptal' }
] as const;

export const MAX_MONTHLY_NO_SHOWS_OPTIONS = [
  { value: 0, label: 'Gelmeme kabul edilmez' },
  { value: 1, label: '1 gelmeme' },
  { value: 2, label: '2 gelmeme' },
  { value: 3, label: '3 gelmeme' },
  { value: 5, label: '5 gelmeme' },
  { value: 10, label: '10 gelmeme' },
  { value: 15, label: '15 gelmeme' },
  { value: 20, label: '20 gelmeme' }
] as const;

export const GRACE_PERIOD_DAYS_OPTIONS = [
  { value: 0, label: 'Yok' },
  { value: 7, label: '7 gün' },
  { value: 14, label: '14 gün' },
  { value: 30, label: '30 gün' }
] as const;

export const BAN_DURATION_DAYS_OPTIONS = [
  { value: 7, label: '7 gün' },
  { value: 14, label: '14 gün' },
  { value: 30, label: '30 gün' },
  { value: 60, label: '60 gün' },
  { value: 90, label: '90 gün' },
  { value: 180, label: '180 gün' },
  { value: 365, label: '1 yıl' }
] as const;

// Validation helper functions
export const validateCancellationPolicy = (policy: UpdateCancellationPolicyRequest): string[] => {
  const errors: string[] = [];

  if (policy.minCancellationHours !== undefined) {
    if (!Number.isInteger(policy.minCancellationHours)) {
      errors.push('Minimum iptal süresi tam sayı olmalıdır');
    } else if (policy.minCancellationHours < CANCELLATION_POLICY_LIMITS.MIN_CANCELLATION_HOURS.MIN) {
      errors.push(`Minimum iptal süresi en az ${CANCELLATION_POLICY_LIMITS.MIN_CANCELLATION_HOURS.MIN} saat olmalıdır`);
    } else if (policy.minCancellationHours > CANCELLATION_POLICY_LIMITS.MIN_CANCELLATION_HOURS.MAX) {
      errors.push(`Minimum iptal süresi en fazla ${CANCELLATION_POLICY_LIMITS.MIN_CANCELLATION_HOURS.MAX} saat olabilir`);
    }
  }

  if (policy.maxMonthlyCancellations !== undefined) {
    if (!Number.isInteger(policy.maxMonthlyCancellations)) {
      errors.push('Maksimum aylık iptal sayısı tam sayı olmalıdır');
    } else if (policy.maxMonthlyCancellations < CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_CANCELLATIONS.MIN) {
      errors.push(`Maksimum aylık iptal sayısı en az ${CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_CANCELLATIONS.MIN} olmalıdır`);
    } else if (policy.maxMonthlyCancellations > CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_CANCELLATIONS.MAX) {
      errors.push(`Maksimum aylık iptal sayısı en fazla ${CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_CANCELLATIONS.MAX} olabilir`);
    }
  }

  if (policy.maxMonthlyNoShows !== undefined) {
    if (!Number.isInteger(policy.maxMonthlyNoShows)) {
      errors.push('Maksimum aylık gelmeme sayısı tam sayı olmalıdır');
    } else if (policy.maxMonthlyNoShows < CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_NO_SHOWS.MIN) {
      errors.push(`Maksimum aylık gelmeme sayısı en az ${CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_NO_SHOWS.MIN} olmalıdır`);
    } else if (policy.maxMonthlyNoShows > CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_NO_SHOWS.MAX) {
      errors.push(`Maksimum aylık gelmeme sayısı en fazla ${CANCELLATION_POLICY_LIMITS.MAX_MONTHLY_NO_SHOWS.MAX} olabilir`);
    }
  }

  if (policy.gracePeriodDays !== undefined) {
    if (!Number.isInteger(policy.gracePeriodDays)) {
      errors.push('Deneme süresi gün sayısı tam sayı olmalıdır');
    } else if (policy.gracePeriodDays < CANCELLATION_POLICY_LIMITS.GRACE_PERIOD_DAYS.MIN) {
      errors.push(`Deneme süresi en az ${CANCELLATION_POLICY_LIMITS.GRACE_PERIOD_DAYS.MIN} gün olmalıdır`);
    } else if (policy.gracePeriodDays > CANCELLATION_POLICY_LIMITS.GRACE_PERIOD_DAYS.MAX) {
      errors.push(`Deneme süresi en fazla ${CANCELLATION_POLICY_LIMITS.GRACE_PERIOD_DAYS.MAX} gün olabilir`);
    }
  }

  if (policy.banDurationDays !== undefined) {
    if (!Number.isInteger(policy.banDurationDays)) {
      errors.push('Engelleme süresi tam sayı olmalıdır');
    } else if (policy.banDurationDays < CANCELLATION_POLICY_LIMITS.BAN_DURATION_DAYS.MIN) {
      errors.push(`Engelleme süresi en az ${CANCELLATION_POLICY_LIMITS.BAN_DURATION_DAYS.MIN} gün olmalıdır`);
    } else if (policy.banDurationDays > CANCELLATION_POLICY_LIMITS.BAN_DURATION_DAYS.MAX) {
      errors.push(`Engelleme süresi en fazla ${CANCELLATION_POLICY_LIMITS.BAN_DURATION_DAYS.MAX} gün olabilir`);
    }
  }

  if (policy.policyWarningMessage !== undefined) {
    if (typeof policy.policyWarningMessage !== 'string') {
      errors.push('Uyarı mesajı metin olmalıdır');
    } else if (policy.policyWarningMessage.length > CANCELLATION_POLICY_LIMITS.POLICY_WARNING_MESSAGE.MAX_LENGTH) {
      errors.push(`Uyarı mesajı en fazla ${CANCELLATION_POLICY_LIMITS.POLICY_WARNING_MESSAGE.MAX_LENGTH} karakter olabilir`);
    }
  }

  if (policy.autoBanEnabled && !policy.banDurationDays) {
    errors.push('Otomatik engelleme aktifken engelleme süresi belirtilmelidir');
  }

  return errors;
};

// Helper functions for display values
export const getMinCancellationHoursDisplayValue = (hours: number): string => {
  if (hours === 1) return '1 saat önce';
  if (hours === 2) return '2 saat önce';
  if (hours === 4) return '4 saat önce';
  if (hours === 6) return '6 saat önce';
  if (hours === 12) return '12 saat önce';
  if (hours === 24) return '1 gün önce';
  if (hours === 48) return '2 gün önce';
  if (hours === 72) return '3 gün önce';
  if (hours === 168) return '1 hafta önce';
  return `${hours} saat önce`;
};

export const getMaxMonthlyCancellationsDisplayValue = (count: number): string => {
  if (count === 0) return 'İptal edilemez';
  if (count === 1) return '1 iptal';
  return `${count} iptal`;
};

export const getMaxMonthlyNoShowsDisplayValue = (count: number): string => {
  if (count === 0) return 'Gelmeme kabul edilmez';
  if (count === 1) return '1 gelmeme';
  return `${count} gelmeme`;
};

export const getGracePeriodDaysDisplayValue = (days: number): string => {
  if (days === 0) return 'Yok';
  if (days === 1) return '1 gün';
  return `${days} gün`;
};

export const getBanDurationDaysDisplayValue = (days: number): string => {
  if (days === 7) return '7 gün';
  if (days === 14) return '14 gün';
  if (days === 30) return '30 gün';
  if (days === 60) return '60 gün';
  if (days === 90) return '90 gün';
  if (days === 180) return '180 gün';
  if (days === 365) return '1 yıl';
  return `${days} gün`;
};
