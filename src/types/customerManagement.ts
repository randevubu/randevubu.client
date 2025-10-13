/**
 * Customer Management Types
 *
 * Type definitions for customer management settings including
 * active customer definition, loyalty programs, customer notes,
 * appointment history, birthday reminders, and customer evaluations.
 */

// ============================================
// Customer Management Settings
// ============================================

export interface ActiveCustomerDefinition {
  monthsThreshold: number;
  enabled: boolean;
}

export interface LoyaltyProgram {
  appointmentThreshold: number;
  enabled: boolean;
}

export interface CustomerNotesSettings {
  allowStaffNotes: boolean;
  allowInternalNotes: boolean;
  maxNoteLength: number;
}

export interface AppointmentHistorySettings {
  allowCustomerView: boolean;
  showCancelledAppointments: boolean;
  showNoShowAppointments: boolean;
}

export interface BirthdayRemindersSettings {
  enabled: boolean;
  reminderDays: number[];
  messageTemplate: string;
}

export interface EvaluationQuestion {
  id: string;
  question: string;
  type: 'RATING' | 'TEXT' | 'MULTIPLE_CHOICE';
  required: boolean;
  minRating?: number;
  maxRating?: number;
  options?: string[];
}

export interface CustomerEvaluationsSettings {
  enabled: boolean;
  requiredForCompletion: boolean;
  allowAnonymous: boolean;
  questions: EvaluationQuestion[];
}

export interface CustomerManagementSettings {
  activeCustomerDefinition: ActiveCustomerDefinition;
  loyaltyProgram: LoyaltyProgram;
  customerNotes: CustomerNotesSettings;
  appointmentHistory: AppointmentHistorySettings;
  birthdayReminders: BirthdayRemindersSettings;
  customerEvaluations: CustomerEvaluationsSettings;
}

// ============================================
// API Request/Response Types
// ============================================

export interface UpdateCustomerManagementSettingsRequest {
  activeCustomerDefinition?: Partial<ActiveCustomerDefinition>;
  loyaltyProgram?: Partial<LoyaltyProgram>;
  customerNotes?: Partial<CustomerNotesSettings>;
  appointmentHistory?: Partial<AppointmentHistorySettings>;
  birthdayReminders?: Partial<BirthdayRemindersSettings>;
  customerEvaluations?: Partial<CustomerEvaluationsSettings>;
}

export interface CustomerManagementSettingsResponse {
  success: boolean;
  data: CustomerManagementSettings;
  message?: string;
}

// ============================================
// Validation Constants
// ============================================

export const CUSTOMER_MANAGEMENT_VALIDATION = {
  ACTIVE_CUSTOMER_MONTHS: {
    MIN: 1,
    MAX: 24,
    OPTIONS: [1, 3, 6, 12, 24]
  },
  LOYALTY_APPOINTMENTS: {
    MIN: 3,
    MAX: 50,
    OPTIONS: [3, 5, 10, 20, 50]
  },
  NOTE_LENGTH: {
    MIN: 100,
    MAX: 2000,
    DEFAULT: 1000
  },
  BIRTHDAY_REMINDER_DAYS: {
    OPTIONS: [1, 3, 7, 14, 30]
  },
  MESSAGE_TEMPLATE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500
  }
} as const;

// ============================================
// Dropdown Options
// ============================================

export const ACTIVE_CUSTOMER_MONTHS_OPTIONS = [
  { value: 1, label: '1 ay' },
  { value: 3, label: '3 ay' },
  { value: 6, label: '6 ay' },
  { value: 12, label: '12 ay' },
  { value: 24, label: '24 ay' }
];

export const LOYALTY_APPOINTMENTS_OPTIONS = [
  { value: 3, label: '3 randevu' },
  { value: 5, label: '5 randevu' },
  { value: 10, label: '10 randevu' },
  { value: 20, label: '20 randevu' },
  { value: 50, label: '50 randevu' }
];

export const NOTE_LENGTH_OPTIONS = [
  { value: 500, label: '500 karakter' },
  { value: 1000, label: '1000 karakter' },
  { value: 1500, label: '1500 karakter' },
  { value: 2000, label: '2000 karakter' }
];

export const BIRTHDAY_REMINDER_DAYS_OPTIONS = [
  { value: 1, label: '1 gün önce' },
  { value: 3, label: '3 gün önce' },
  { value: 7, label: '7 gün önce' },
  { value: 14, label: '14 gün önce' },
  { value: 30, label: '30 gün önce' }
];

// ============================================
// Default Values
// ============================================

export const DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS: CustomerManagementSettings = {
  activeCustomerDefinition: {
    monthsThreshold: 3,
    enabled: true
  },
  loyaltyProgram: {
    appointmentThreshold: 5,
    enabled: true
  },
  customerNotes: {
    allowStaffNotes: true,
    allowInternalNotes: true,
    maxNoteLength: 1000
  },
  appointmentHistory: {
    allowCustomerView: true,
    showCancelledAppointments: true,
    showNoShowAppointments: false
  },
  birthdayReminders: {
    enabled: false,
    reminderDays: [1, 3, 7],
    messageTemplate: 'Doğum gününüz kutlu olsun! Size özel indirimli randevu fırsatı için bizimle iletişime geçin.'
  },
  customerEvaluations: {
    enabled: false,
    requiredForCompletion: false,
    allowAnonymous: true,
    questions: [
      {
        id: 'overall_rating',
        question: 'Genel memnuniyetinizi değerlendirin',
        type: 'RATING',
        required: true,
        minRating: 1,
        maxRating: 5
      }
    ]
  }
};

// ============================================
// Helper Functions
// ============================================

export const validateCustomerManagementSettings = (
  settings: Partial<CustomerManagementSettings>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate active customer months threshold
  if (settings.activeCustomerDefinition?.monthsThreshold) {
    const months = settings.activeCustomerDefinition.monthsThreshold;
    if (months < CUSTOMER_MANAGEMENT_VALIDATION.ACTIVE_CUSTOMER_MONTHS.MIN ||
        months > CUSTOMER_MANAGEMENT_VALIDATION.ACTIVE_CUSTOMER_MONTHS.MAX) {
      errors.push(`Aktif müşteri ay eşiği ${CUSTOMER_MANAGEMENT_VALIDATION.ACTIVE_CUSTOMER_MONTHS.MIN}-${CUSTOMER_MANAGEMENT_VALIDATION.ACTIVE_CUSTOMER_MONTHS.MAX} arasında olmalıdır`);
    }
  }

  // Validate loyalty appointment threshold
  if (settings.loyaltyProgram?.appointmentThreshold) {
    const appointments = settings.loyaltyProgram.appointmentThreshold;
    if (appointments < CUSTOMER_MANAGEMENT_VALIDATION.LOYALTY_APPOINTMENTS.MIN ||
        appointments > CUSTOMER_MANAGEMENT_VALIDATION.LOYALTY_APPOINTMENTS.MAX) {
      errors.push(`Sadakat randevu eşiği ${CUSTOMER_MANAGEMENT_VALIDATION.LOYALTY_APPOINTMENTS.MIN}-${CUSTOMER_MANAGEMENT_VALIDATION.LOYALTY_APPOINTMENTS.MAX} arasında olmalıdır`);
    }
  }

  // Validate note length
  if (settings.customerNotes?.maxNoteLength) {
    const length = settings.customerNotes.maxNoteLength;
    if (length < CUSTOMER_MANAGEMENT_VALIDATION.NOTE_LENGTH.MIN ||
        length > CUSTOMER_MANAGEMENT_VALIDATION.NOTE_LENGTH.MAX) {
      errors.push(`Not uzunluğu ${CUSTOMER_MANAGEMENT_VALIDATION.NOTE_LENGTH.MIN}-${CUSTOMER_MANAGEMENT_VALIDATION.NOTE_LENGTH.MAX} arasında olmalıdır`);
    }
  }

  // Validate birthday message template
  if (settings.birthdayReminders?.messageTemplate) {
    const template = settings.birthdayReminders.messageTemplate;
    if (template.length < CUSTOMER_MANAGEMENT_VALIDATION.MESSAGE_TEMPLATE.MIN_LENGTH ||
        template.length > CUSTOMER_MANAGEMENT_VALIDATION.MESSAGE_TEMPLATE.MAX_LENGTH) {
      errors.push(`Doğum günü mesajı ${CUSTOMER_MANAGEMENT_VALIDATION.MESSAGE_TEMPLATE.MIN_LENGTH}-${CUSTOMER_MANAGEMENT_VALIDATION.MESSAGE_TEMPLATE.MAX_LENGTH} karakter arasında olmalıdır`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const getActiveCustomerMonthsDisplay = (months: number): string => {
  const option = ACTIVE_CUSTOMER_MONTHS_OPTIONS.find(opt => opt.value === months);
  return option ? option.label : `${months} ay`;
};

export const getLoyaltyAppointmentsDisplay = (appointments: number): string => {
  const option = LOYALTY_APPOINTMENTS_OPTIONS.find(opt => opt.value === appointments);
  return option ? option.label : `${appointments} randevu`;
};

export const getBirthdayReminderDaysDisplay = (days: number[]): string => {
  return days
    .sort((a, b) => a - b)
    .map(day => {
      const option = BIRTHDAY_REMINDER_DAYS_OPTIONS.find(opt => opt.value === day);
      return option ? option.label : `${day} gün önce`;
    })
    .join(', ');
};
