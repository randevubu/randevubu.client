'use client';

/**
 * Secure Notification Sender Component
 *
 * Professional UI component for sending secure notifications to customers.
 * Follows industry best practices for form validation, user feedback,
 * and error handling.
 *
 * Features:
 * - Multiple notification types support
 * - Channel selection
 * - Real-time validation
 * - Rate limit awareness
 * - Recipient filtering
 * - Character count display
 * - Loading states
 * - Error handling
 */

import React, { useState, useMemo } from 'react';
import { useSecureNotifications } from '@/src/lib/hooks/useSecureNotifications';
import { useNotificationStats } from '@/src/lib/hooks/useNotificationStats';
import type {
  NotificationType,
  NotificationChannel,
  BroadcastNotificationRequest,
  RelationshipType,
} from '@/src/types/notification';

// ============================================
// CONSTANTS
// ============================================

const MAX_TITLE_LENGTH = 100;
const MAX_BODY_LENGTH = 500;

const NOTIFICATION_TYPES: { value: NotificationType; label: string; description: string }[] = [
  {
    value: 'HOLIDAY',
    label: 'Holiday Message',
    description: 'Send holiday greetings or closure notices',
  },
  {
    value: 'PROMOTION',
    label: 'Promotion',
    description: 'Advertise special offers and discounts',
  },
  {
    value: 'BROADCAST',
    label: 'General Broadcast',
    description: 'Send general announcements',
  },
];

const CHANNELS: { value: NotificationChannel; label: string; icon: string }[] = [
  { value: 'PUSH', label: 'Push Notifications', icon: '🔔' },
  { value: 'SMS', label: 'SMS', icon: '💬' },
  { value: 'EMAIL', label: 'Email', icon: '✉️' },
];

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'ALL', label: 'All Customers' },
  { value: 'ACTIVE_CUSTOMER', label: 'Active Customers Only' },
  { value: 'PAST_CUSTOMER', label: 'Past Customers' },
];

// ============================================
// COMPONENT PROPS
// ============================================

interface SecureNotificationSenderProps {
  businessId: string;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function SecureNotificationSender({
  businessId,
  className = '',
}: SecureNotificationSenderProps) {
  // ============================================
  // STATE
  // ============================================

  const [formData, setFormData] = useState<BroadcastNotificationRequest>({
    businessId,
    title: '',
    body: '',
    notificationType: 'BROADCAST',
    channels: ['PUSH'],
    filters: {
      relationshipType: 'ACTIVE_CUSTOMER',
      minAppointments: 1,
    },
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ============================================
  // HOOKS
  // ============================================

  const { sendBroadcast, isLoading } = useSecureNotifications();
  const { stats, isRateLimitWarning, isRateLimitCritical, isRateLimitBlocked } =
    useNotificationStats({
      businessId,
    });

  // ============================================
  // VALIDATION
  // ============================================

  const validation = useMemo(() => {
    const errors: string[] = [];

    if (!formData.title) {
      errors.push('Title is required');
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
    }

    if (!formData.body) {
      errors.push('Message is required');
    } else if (formData.body.length > MAX_BODY_LENGTH) {
      errors.push(`Message must be ${MAX_BODY_LENGTH} characters or less`);
    }

    if (formData.channels.length === 0) {
      errors.push('At least one channel must be selected');
    }

    const isValid = errors.length === 0;

    return { isValid, errors };
  }, [formData]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid) {
      return;
    }

    if (isRateLimitBlocked) {
      alert('Rate limit exceeded. Please try again later.');
      return;
    }

    try {
      await sendBroadcast.mutateAsync(formData);

      // Reset form on success
      setFormData({
        businessId,
        title: '',
        body: '',
        notificationType: 'BROADCAST',
        channels: ['PUSH'],
        filters: {
          relationshipType: 'ACTIVE_CUSTOMER',
          minAppointments: 1,
        },
      });
    } catch (error) {
      // Error already handled by hook
      console.error('Failed to send notification:', error);
    }
  };

  const handleChannelToggle = (channel: NotificationChannel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rate Limit Warning */}
      {(isRateLimitWarning || isRateLimitCritical || isRateLimitBlocked) && (
        <div
          className={`rounded-xl p-4 border ${
            isRateLimitBlocked
              ? 'bg-red-50 border-red-200'
              : isRateLimitCritical
              ? 'bg-orange-50 border-orange-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-2xl">
              {isRateLimitBlocked ? '🚫' : isRateLimitCritical ? '⚠️' : '⚡'}
            </span>
            <div className="flex-1">
              <h4
                className={`font-semibold ${
                  isRateLimitBlocked
                    ? 'text-red-900'
                    : isRateLimitCritical
                    ? 'text-orange-900'
                    : 'text-yellow-900'
                }`}
              >
                {isRateLimitBlocked
                  ? 'Rate Limit Exceeded'
                  : isRateLimitCritical
                  ? 'Critical Rate Limit'
                  : 'Approaching Rate Limit'}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  isRateLimitBlocked
                    ? 'text-red-700'
                    : isRateLimitCritical
                    ? 'text-orange-700'
                    : 'text-yellow-700'
                }`}
              >
                {isRateLimitBlocked
                  ? 'You have exceeded your notification quota. Please try again later.'
                  : 'You are approaching your notification quota. Consider reducing frequency.'}
              </p>
              {stats?.rateLimitStatus?.recommendations &&
                stats.rateLimitStatus.recommendations.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {stats.rateLimitStatus.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
            <p className="text-sm text-gray-600 mt-1">
              Send notifications to your customers via multiple channels
            </p>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notification Type
            </label>
            <select
              value={formData.notificationType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  notificationType: e.target.value as NotificationType,
                }))
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Title <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  formData.title.length > MAX_TITLE_LENGTH ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {formData.title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              maxLength={MAX_TITLE_LENGTH}
              placeholder="Enter notification title..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Message <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  formData.body.length > MAX_BODY_LENGTH ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {formData.body.length}/{MAX_BODY_LENGTH}
              </span>
            </div>
            <textarea
              value={formData.body}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, body: e.target.value }))
              }
              maxLength={MAX_BODY_LENGTH}
              rows={4}
              placeholder="Enter your message..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Notification Channels <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHANNELS.map((channel) => (
                <label
                  key={channel.value}
                  className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.channels.includes(channel.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.channels.includes(channel.value)}
                    onChange={() => handleChannelToggle(channel.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xl">{channel.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{channel.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Recipient Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Recipient Filters
              </label>
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
            </div>

            <div className="space-y-3">
              {/* Relationship Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Customer Type
                </label>
                <select
                  value={formData.filters?.relationshipType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        relationshipType: e.target.value as RelationshipType,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {RELATIONSHIP_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Minimum Appointments
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.filters?.minAppointments ?? 0}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          filters: {
                            ...prev.filters,
                            minAppointments: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last Appointment After
                    </label>
                    <input
                      type="date"
                      value={formData.filters?.lastAppointmentAfter ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          filters: {
                            ...prev.filters,
                            lastAppointmentAfter: e.target.value || undefined,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {!validation.isValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                Please fix the following errors:
              </h4>
              <ul className="space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  businessId,
                  title: '',
                  body: '',
                  notificationType: 'BROADCAST',
                  channels: ['PUSH'],
                  filters: {
                    relationshipType: 'ACTIVE_CUSTOMER',
                    minAppointments: 1,
                  },
                })
              }
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!validation.isValid || isLoading || isRateLimitBlocked}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Statistics Card */}
      {stats && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Notification Statistics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.customerStats.totalCustomers}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.customerStats.activeCustomers}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
