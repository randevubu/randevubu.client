import { BusinessStaffRole, ClosureType } from './enums';

export interface BusinessType {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  ownerId: string;
  businessTypeId: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  businessHours?: Record<string, any>;
  timezone: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  isActive: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  isClosed: boolean;
  closedUntil?: Date;
  closureReason?: string;
  tags: string[];
  rating?: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  subscription?: {
    id: string;
    status: string;
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  };
}

export interface BusinessStaff {
  id: string;
  businessId: string;
  userId: string;
  role: BusinessStaffRole;
  permissions?: Record<string, any>;
  isActive: boolean;
  joinedAt: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessImage {
  id: string;
  businessId: string;
  url: string;
  alt?: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateBusinessData {
  businessTypeId: string;
  name: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
  primaryColor?: string;
  tags?: string[];
}

export interface UpdateBusinessData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  businessHours?: Record<string, any>;
  timezone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  tags?: string[];
}

export interface AddStaffData {
  userId: string;
  role: BusinessStaffRole;
  permissions?: Record<string, any>;
}

export interface UpdateStaffData {
  role?: BusinessStaffRole;
  permissions?: Record<string, any>;
  isActive?: boolean;
}

// Enhanced Closure System Types
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';
export type RecurringFrequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringPattern {
  frequency: RecurringFrequency;
  interval: number;
  endDate?: string;
  daysOfWeek?: number[]; // For weekly patterns
  dayOfMonth?: number; // For monthly patterns
}

export interface EnhancedClosureData {
  startDate: string;
  endDate: string;
  reason: string;
  type: ClosureType;
  notifyCustomers: boolean;
  notificationMessage?: string;
  notificationChannels: NotificationChannel[];
  affectedServices?: string[]; // Service IDs
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  estimatedAffectedAppointments?: number;
}

export interface ClosureImpactPreview {
  affectedAppointmentsCount: number;
  affectedCustomersCount: number;
  estimatedRevenueLoss: number;
  suggestedRescheduleSlots: TimeSlot[];
}

// Backend response structure
export interface ClosureImpactResponse {
  impactSummary: {
    affectedAppointments: number;
    uniqueCustomers: number;
    estimatedRevenueLoss: number;
    period: {
      startDate: string;
      endDate: string;
    };
  };
  affectedAppointments: any[];
  analytics: {
    totalClosures: number;
    closuresByType: Record<string, number>;
    averageClosureDuration: number;
    totalClosureHours: number;
    affectedAppointments: number;
    estimatedRevenueLoss: number;
    customerImpact: {
      totalAffectedCustomers: number;
      notificationsSent: number;
      rescheduledAppointments: number;
      canceledAppointments: number;
    };
    monthlyTrend: any[];
    recurringPatterns: any[];
  };
  recommendations: {
    suggestNotifyCustomers: boolean;
    suggestReschedule: boolean;
    highImpact: boolean;
  };
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  recipientCount: number;
  failedCount?: number;
  errors?: string[];
}

export interface ClosureAnalytics {
  totalClosures: number;
  closuresByType: Record<ClosureType, number>;
  averageClosureDuration: number;
  customerImpactScore: number;
  revenueImpact: number;
  reschedulingSuccessRate: number;
}

export interface CustomerImpactReport {
  totalAffectedCustomers: number;
  notificationsSent: number;
  rescheduleAcceptanceRate: number;
  customerSatisfactionScore?: number;
}

export interface RescheduleSuggestion {
  originalAppointmentId: string;
  suggestedSlots: TimeSlot[];
  customerPreferences?: any;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BusinessSearchFilters {
  businessTypeId?: string;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  rating?: number;
}

// Closure Management Types
export interface ClosureFormData {
  type: ClosureType;
  reason: string;
  startDate: string;
  endDate: string;
  notifyCustomers: boolean;
  notificationMessage: string;
  notificationChannels: NotificationChannel[];
  affectedServices: string[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  customClosureType?: string; // For "Other" type
  additionalNotes?: string; // For "Other" type
}

export interface ClosureValidationErrors {
  startDate?: string;
  endDate?: string;
  reason?: string;
  notificationMessage?: string;
  recurringPattern?: string;
  general?: string;
}