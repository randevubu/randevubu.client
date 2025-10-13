/**
 * Reservation Rules Types
 * 
 * Type definitions for business reservation rules settings API.
 * Follows the API documentation structure with proper validation.
 */

export interface ReservationSettings {
  businessId: string;
  maxAdvanceBookingDays: number;
  minNotificationHours: number;
  maxDailyAppointments: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReservationSettingsRequest {
  maxAdvanceBookingDays?: number;
  minNotificationHours?: number;
  maxDailyAppointments?: number;
}

export interface ReservationSettingsResponse {
  success: boolean;
  data: ReservationSettings;
  message: string;
}

export interface ReservationSettingsError {
  success: false;
  error: string;
}

// Validation constants matching API documentation
export const RESERVATION_RULES_LIMITS = {
  MAX_ADVANCE_BOOKING_DAYS: {
    MIN: 1,
    MAX: 365,
    DEFAULT: 30
  },
  MIN_NOTIFICATION_HOURS: {
    MIN: 1,
    MAX: 168, // 1 week
    DEFAULT: 2
  },
  MAX_DAILY_APPOINTMENTS: {
    MIN: 1,
    MAX: 1000,
    DEFAULT: 50
  }
} as const;

// Predefined options for UI dropdowns
export const ADVANCE_BOOKING_OPTIONS = [
  { value: 1, label: '1 gün' },
  { value: 3, label: '3 gün' },
  { value: 7, label: '1 hafta' },
  { value: 14, label: '2 hafta' },
  { value: 30, label: '1 ay' },
  { value: 60, label: '2 ay' },
  { value: 90, label: '3 ay' },
  { value: 180, label: '6 ay' },
  { value: 365, label: '1 yıl' }
] as const;

export const NOTIFICATION_HOURS_OPTIONS = [
  { value: 1, label: '1 saat önce' },
  { value: 2, label: '2 saat önce' },
  { value: 4, label: '4 saat önce' },
  { value: 8, label: '8 saat önce' },
  { value: 12, label: '12 saat önce' },
  { value: 24, label: '1 gün önce' },
  { value: 48, label: '2 gün önce' },
  { value: 72, label: '3 gün önce' },
  { value: 168, label: '1 hafta önce' }
] as const;

export const DAILY_APPOINTMENTS_OPTIONS = [
  { value: 1, label: '1 randevu' },
  { value: 2, label: '2 randevu' },
  { value: 3, label: '3 randevu' },
  { value: 4, label: '4 randevu' },
  { value: 5, label: '5 randevu' },
  { value: 10, label: '10 randevu' },
  { value: 15, label: '15 randevu' },
  { value: 20, label: '20 randevu' },
  { value: 25, label: '25 randevu' },
  { value: 30, label: '30 randevu' },
  { value: 40, label: '40 randevu' },
  { value: 50, label: '50 randevu' },
  { value: 75, label: '75 randevu' },
  { value: 100, label: '100 randevu' },
  { value: 150, label: '150 randevu' },
  { value: 200, label: '200 randevu' },
  { value: 300, label: '300 randevu' },
  { value: 500, label: '500 randevu' },
  { value: 750, label: '750 randevu' },
  { value: 1000, label: '1000 randevu' }
] as const;

// Validation helper functions
export const validateReservationSettings = (settings: UpdateReservationSettingsRequest): string[] => {
  const errors: string[] = [];

  if (settings.maxAdvanceBookingDays !== undefined) {
    if (!Number.isInteger(settings.maxAdvanceBookingDays)) {
      errors.push('Max advance booking days must be an integer');
    } else if (settings.maxAdvanceBookingDays < RESERVATION_RULES_LIMITS.MAX_ADVANCE_BOOKING_DAYS.MIN) {
      errors.push(`Max advance booking days must be at least ${RESERVATION_RULES_LIMITS.MAX_ADVANCE_BOOKING_DAYS.MIN}`);
    } else if (settings.maxAdvanceBookingDays > RESERVATION_RULES_LIMITS.MAX_ADVANCE_BOOKING_DAYS.MAX) {
      errors.push(`Max advance booking days cannot exceed ${RESERVATION_RULES_LIMITS.MAX_ADVANCE_BOOKING_DAYS.MAX}`);
    }
  }

  if (settings.minNotificationHours !== undefined) {
    if (!Number.isInteger(settings.minNotificationHours)) {
      errors.push('Min notification hours must be an integer');
    } else if (settings.minNotificationHours < RESERVATION_RULES_LIMITS.MIN_NOTIFICATION_HOURS.MIN) {
      errors.push(`Min notification hours must be at least ${RESERVATION_RULES_LIMITS.MIN_NOTIFICATION_HOURS.MIN}`);
    } else if (settings.minNotificationHours > RESERVATION_RULES_LIMITS.MIN_NOTIFICATION_HOURS.MAX) {
      errors.push(`Min notification hours cannot exceed ${RESERVATION_RULES_LIMITS.MIN_NOTIFICATION_HOURS.MAX}`);
    }
  }

  if (settings.maxDailyAppointments !== undefined) {
    if (!Number.isInteger(settings.maxDailyAppointments)) {
      errors.push('Max daily appointments must be an integer');
    } else if (settings.maxDailyAppointments < RESERVATION_RULES_LIMITS.MAX_DAILY_APPOINTMENTS.MIN) {
      errors.push(`Max daily appointments must be at least ${RESERVATION_RULES_LIMITS.MAX_DAILY_APPOINTMENTS.MIN}`);
    } else if (settings.maxDailyAppointments > RESERVATION_RULES_LIMITS.MAX_DAILY_APPOINTMENTS.MAX) {
      errors.push(`Max daily appointments cannot exceed ${RESERVATION_RULES_LIMITS.MAX_DAILY_APPOINTMENTS.MAX}`);
    }
  }

  return errors;
};

// Helper functions for display values
export const getAdvanceBookingDisplayValue = (days: number): string => {
  if (days === 1) return '1 gün';
  if (days === 3) return '3 gün';
  if (days === 7) return '1 hafta';
  if (days === 14) return '2 hafta';
  if (days === 30) return '1 ay';
  if (days === 60) return '2 ay';
  if (days === 90) return '3 ay';
  if (days === 180) return '6 ay';
  if (days === 365) return '1 yıl';
  return `${days} gün`;
};

export const getNotificationHoursDisplayValue = (hours: number): string => {
  if (hours === 1) return '1 saat önce';
  if (hours === 2) return '2 saat önce';
  if (hours === 4) return '4 saat önce';
  if (hours === 8) return '8 saat önce';
  if (hours === 12) return '12 saat önce';
  if (hours === 24) return '1 gün önce';
  if (hours === 48) return '2 gün önce';
  if (hours === 72) return '3 gün önce';
  if (hours === 168) return '1 hafta önce';
  return `${hours} saat önce`;
};

export const getDailyAppointmentsDisplayValue = (count: number): string => {
  if (count === 1) return '1 randevu';
  return `${count} randevu`;
};
