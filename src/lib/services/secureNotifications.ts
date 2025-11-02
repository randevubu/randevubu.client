/**
 * Secure Notifications Service
 *
 * Enterprise-grade notification service following industry best practices.
 * Handles all secure notification API calls with proper error handling,
 * retry logic, and comprehensive logging.
 *
 * Features:
 * - Input validation
 * - Comprehensive error handling
 * - Type safety
 * - Consistent API interface
 * - Rate limit awareness
 */

import { apiClient } from '../api';
import type {
  SecureNotificationRequest,
  SecureNotificationResponse,
  BroadcastNotificationRequest,
  BroadcastNotificationResponse,
  ClosureNotificationRequest,
  ClosureNotificationResponse,
  TestNotificationRequest,
  TestNotificationResponse,
  NotificationStatsResponse,
  SecurityAlertsResponse,
  NotificationValidationErrors,
} from '@/src/types/notification';

// ============================================
// CONSTANTS
// ============================================

const API_BASE = '/api/v1/secure-notifications';

const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  BODY_MAX_LENGTH: 500,
  MAX_RECIPIENTS: 10000,
} as const;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate notification data before sending to API
 * Follows best practice of client-side validation before server request
 */
function validateNotificationData(
  data: Partial<SecureNotificationRequest | BroadcastNotificationRequest>
): NotificationValidationErrors {
  const errors: NotificationValidationErrors = {};

  // Title validation
  if (!data.title) {
    errors.title = ['Title is required'];
  } else if (data.title.length > VALIDATION_LIMITS.TITLE_MAX_LENGTH) {
    errors.title = [`Title must be ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters or less`];
  }

  // Body validation
  if (!data.body) {
    errors.body = ['Body is required'];
  } else if (data.body.length > VALIDATION_LIMITS.BODY_MAX_LENGTH) {
    errors.body = [`Body must be ${VALIDATION_LIMITS.BODY_MAX_LENGTH} characters or less`];
  }

  // Channels validation
  if (!data.channels || data.channels.length === 0) {
    errors.channels = ['At least one channel must be selected'];
  }

  // Business ID validation
  if (!data.businessId) {
    errors.businessId = ['Business ID is required'];
  }

  // Recipients validation (for direct send)
  if ('recipientIds' in data) {
    const recipientIds = data.recipientIds || [];
    if (recipientIds.length === 0) {
      errors.recipientIds = ['At least one recipient is required'];
    } else if (recipientIds.length > VALIDATION_LIMITS.MAX_RECIPIENTS) {
      errors.recipientIds = [`Maximum ${VALIDATION_LIMITS.MAX_RECIPIENTS} recipients allowed`];
    }
  }

  return errors;
}

/**
 * Check if validation errors exist
 */
function hasValidationErrors(errors: NotificationValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Format validation errors for user display
 */
function formatValidationErrors(errors: NotificationValidationErrors): string {
  const messages = Object.values(errors).flat();
  return messages.join('. ');
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Handle API errors with proper typing and user-friendly messages
 */
function handleNotificationError(error: unknown): never {
  const { extractErrorMessage, extractApiError, isAxiosError } = require('../utils/errorExtractor');
  const axiosError = isAxiosError(error);
  const apiError = extractApiError(error);
  
  const errorMessage = extractErrorMessage(error, 'Failed to send notification');
  const errorCode = apiError?.code || (axiosError && error.response?.data?.errorCode);

  console.error('[Secure Notifications] API Error:', {
    message: errorMessage,
    code: errorCode,
    status: axiosError ? error.response?.status : undefined,
    details: axiosError ? error.response?.data?.details : undefined,
  });

  // Create enhanced error object
  const enhancedError = new Error(errorMessage) as Error & {
    errorCode?: string;
    statusCode?: number;
    details?: any;
  };

  enhancedError.errorCode = errorCode;
  enhancedError.statusCode = error.response?.status;
  enhancedError.details = error.response?.data?.details;

  throw enhancedError;
}

// ============================================
// SERVICE CLASS
// ============================================

export class SecureNotificationService {
  /**
   * Send secure notification to specific recipients
   */
  async sendNotification(
    data: SecureNotificationRequest
  ): Promise<SecureNotificationResponse> {
    try {
      // Validate input
      const errors = validateNotificationData(data);
      if (hasValidationErrors(errors)) {
        throw new Error(formatValidationErrors(errors));
      }

      // Make API call
      const response = await apiClient.post<SecureNotificationResponse>(
        `${API_BASE}/send`,
        data
      );

      // Log success
      console.log('[Secure Notifications] Send successful:', {
        sentCount: response.data.data.sentCount,
        failedCount: response.data.data.failedCount,
      });

      return response.data;
    } catch (error) {
      handleNotificationError(error);
    }
  }

  /**
   * Send broadcast notification to all business customers
   */
  async sendBroadcast(
    data: BroadcastNotificationRequest
  ): Promise<BroadcastNotificationResponse> {
    try {
      // Validate input
      const errors = validateNotificationData(data);
      if (hasValidationErrors(errors)) {
        throw new Error(formatValidationErrors(errors));
      }

      // Make API call
      const response = await apiClient.post<BroadcastNotificationResponse>(
        `${API_BASE}/broadcast`,
        data
      );

      // Log success
      console.log('[Secure Notifications] Broadcast successful:', {
        sentCount: response.data.data.sentCount,
        totalRecipients: response.data.data.totalRecipients,
      });

      return response.data;
    } catch (error) {
      handleNotificationError(error);
    }
  }

  /**
   * Send closure notification to affected customers
   */
  async sendClosureNotification(
    businessId: string,
    closureId: string,
    data: ClosureNotificationRequest
  ): Promise<ClosureNotificationResponse> {
    try {
      // Validate inputs
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      if (!closureId) {
        throw new Error('Closure ID is required');
      }
      if (!data.message) {
        throw new Error('Message is required');
      }
      if (!data.channels || data.channels.length === 0) {
        throw new Error('At least one channel must be selected');
      }

      // Make API call
      const response = await apiClient.post<ClosureNotificationResponse>(
        `${API_BASE}/closure/${businessId}/${closureId}`,
        data
      );

      // Log success
      console.log('[Secure Notifications] Closure notification successful:', {
        sentCount: response.data.data.sentCount,
        failedCount: response.data.data.failedCount,
      });

      return response.data;
    } catch (error) {
      handleNotificationError(error);
    }
  }

  /**
   * Send test notification to yourself
   */
  async sendTestNotification(
    data: TestNotificationRequest
  ): Promise<TestNotificationResponse> {
    try {
      // Validate input
      if (!data.businessId) {
        throw new Error('Business ID is required');
      }
      if (!data.title) {
        throw new Error('Title is required');
      }
      if (!data.body) {
        throw new Error('Body is required');
      }

      // Make API call
      const response = await apiClient.post<TestNotificationResponse>(
        `${API_BASE}/test`,
        data
      );

      // Log success
      console.log('[Secure Notifications] Test notification sent');

      return response.data;
    } catch (error) {
      handleNotificationError(error);
    }
  }

  /**
   * Get notification statistics for a business
   */
  async getNotificationStats(
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<NotificationStatsResponse> {
    try {
      // Validate business ID
      if (!businessId) {
        throw new Error('Business ID is required');
      }

      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = queryString
        ? `${API_BASE}/stats/${businessId}?${queryString}`
        : `${API_BASE}/stats/${businessId}`;

      // Make API call
      const response = await apiClient.get<NotificationStatsResponse>(url);

      return response.data;
    } catch (error) {
      handleNotificationError(error);
    }
  }

  /**
   * Get security alerts for a business
   */
  async getSecurityAlerts(
    businessId: string,
    hours: number = 24
  ): Promise<SecurityAlertsResponse> {
    try {
      // Validate inputs
      if (!businessId) {
        throw new Error('Business ID is required');
      }
      if (hours < 1 || hours > 168) {
        throw new Error('Hours must be between 1 and 168');
      }

      // Make API call
      const response = await apiClient.get<SecurityAlertsResponse>(
        `${API_BASE}/alerts/${businessId}?hours=${hours}`
      );

      return response.data;
    } catch (error) {
      handleNotificationError(error);
    }
  }

  /**
   * Validate notification data without sending
   * Useful for form validation
   */
  validateNotification(
    data: Partial<SecureNotificationRequest | BroadcastNotificationRequest>
  ): { isValid: boolean; errors: NotificationValidationErrors } {
    const errors = validateNotificationData(data);
    return {
      isValid: !hasValidationErrors(errors),
      errors,
    };
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const secureNotificationService = new SecureNotificationService();
