/**
 * Secure Notifications API Types
 *
 * TypeScript types for the secure notification endpoints following
 * industry best practices and API contract standards.
 */

// ============================================
// ENUMS
// ============================================

export type NotificationType =
  | 'CLOSURE'
  | 'HOLIDAY'
  | 'PROMOTION'
  | 'REMINDER'
  | 'BROADCAST';

export type NotificationChannel = 'PUSH' | 'SMS' | 'EMAIL';

export type RateLimitStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'BLOCKED';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertType =
  | 'RATE_LIMIT_ABUSE'
  | 'PERMISSION_VIOLATION'
  | 'SUSPICIOUS_ACTIVITY';

export type RelationshipType = 'ACTIVE_CUSTOMER' | 'PAST_CUSTOMER' | 'ALL';

// ============================================
// REQUEST TYPES
// ============================================

export interface SecureNotificationRequest {
  businessId: string;
  recipientIds: string[];
  title: string;
  body: string;
  notificationType: NotificationType;
  channels: NotificationChannel[];
  data?: Record<string, any>;
}

export interface BroadcastNotificationRequest {
  businessId: string;
  title: string;
  body: string;
  notificationType: Extract<NotificationType, 'HOLIDAY' | 'PROMOTION' | 'BROADCAST'>;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  filters?: {
    relationshipType?: RelationshipType;
    minAppointments?: number;
    lastAppointmentAfter?: string;
  };
}

export interface ClosureNotificationRequest {
  message: string;
  channels: NotificationChannel[];
}

export interface TestNotificationRequest {
  businessId: string;
  title: string;
  body: string;
  channels?: NotificationChannel[];
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface NotificationError {
  recipientId: string;
  error: string;
  errorCode: string;
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: string;
}

export interface SecureNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    validRecipients: number;
    invalidRecipients: number;
    rateLimitInfo?: RateLimitInfo;
    errors: NotificationError[];
  };
  message: string;
}

export interface BroadcastNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    validRecipients: number;
    invalidRecipients: number;
    errors: NotificationError[];
  };
  message: string;
}

export interface ClosureNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    validRecipients: number;
    invalidRecipients: number;
    errors: NotificationError[];
  };
  message: string;
}

export interface TestNotificationResponse {
  success: boolean;
  data: {
    sentCount: number;
    failedCount: number;
    errors: NotificationError[];
  };
  message: string;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface NotificationStats {
  totalSent: number;
  successRate: number;
  failureRate: number;
  rateLimitStatus: {
    current: {
      hourly: number;
      daily: number;
      weekly: number;
      lastNotification?: string;
    };
    limits: {
      maxNotificationsPerHour: number;
      maxNotificationsPerDay: number;
      maxNotificationsPerWeek: number;
    };
    status: RateLimitStatus;
    recommendations: string[];
  };
  customerStats: {
    totalCustomers: number;
    activeCustomers: number;
    optedOutCustomers: number;
    blockedCustomers: number;
    last30DaysCustomers: number;
  };
  recentActivity: Array<{
    id: string;
    eventType: string;
    action: string;
    success: boolean;
    createdAt: string;
  }>;
}

export interface NotificationStatsResponse {
  success: boolean;
  data: NotificationStats;
}

// ============================================
// SECURITY ALERTS TYPES
// ============================================

export interface SecurityAlert {
  type: AlertType;
  severity: AlertSeverity;
  count: number;
  description: string;
  firstOccurrence: string;
  lastOccurrence: string;
}

export interface SecurityAlertsResponse {
  success: boolean;
  data: {
    alerts: SecurityAlert[];
    period: string;
    totalAlerts: number;
  };
}

// ============================================
// ERROR RESPONSE TYPE
// ============================================

export interface NotificationErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: Record<string, any>;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface NotificationValidationErrors {
  title?: string[];
  body?: string[];
  channels?: string[];
  recipientIds?: string[];
  businessId?: string[];
}
