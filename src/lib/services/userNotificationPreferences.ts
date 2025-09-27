import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';

export interface UserNotificationPreferences {
  id?: string;
  userId?: string;
  enableAppointmentReminders: boolean;
  enableBusinessNotifications: boolean;
  enablePromotionalMessages: boolean;
  reminderTiming: {
    hours: number[];
  };
  preferredChannels: {
    channels: ('PUSH' | 'SMS' | 'EMAIL')[];
  };
  quietHours?: {
    start: string;
    end: string;
    timezone: string;
  } | null;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userNotificationPreferencesService = {
  /**
   * Get user notification preferences
   */
  getPreferences: async (): Promise<ApiResponse<UserNotificationPreferences>> => {
    const response = await apiClient.get<ApiResponse<UserNotificationPreferences>>(
      '/api/v1/users/notification-preferences'
    );
    return response.data;
  },

  /**
   * Update user notification preferences
   */
  updatePreferences: async (
    preferences: Partial<UserNotificationPreferences>
  ): Promise<ApiResponse<UserNotificationPreferences>> => {
    const response = await apiClient.put<ApiResponse<UserNotificationPreferences>>(
      '/api/v1/users/notification-preferences',
      preferences
    );
    return response.data;
  },

  /**
   * Reset preferences to default
   */
  resetToDefaults: async (): Promise<ApiResponse<UserNotificationPreferences>> => {
    const defaultPreferences: Partial<UserNotificationPreferences> = {
      enableAppointmentReminders: true,
      enableBusinessNotifications: true,
      enablePromotionalMessages: false,
      reminderTiming: {
        hours: [1, 24],
      },
      preferredChannels: {
        channels: ['PUSH'],
      },
      quietHours: null,
      timezone: 'Europe/Istanbul',
    };

    return await userNotificationPreferencesService.updatePreferences(defaultPreferences);
  },

  /**
   * Enable/disable appointment reminders
   */
  toggleAppointmentReminders: async (enabled: boolean): Promise<ApiResponse<UserNotificationPreferences>> => {
    return await userNotificationPreferencesService.updatePreferences({
      enableAppointmentReminders: enabled,
    });
  },

  /**
   * Enable/disable business notifications
   */
  toggleBusinessNotifications: async (enabled: boolean): Promise<ApiResponse<UserNotificationPreferences>> => {
    return await userNotificationPreferencesService.updatePreferences({
      enableBusinessNotifications: enabled,
    });
  },

  /**
   * Enable/disable promotional messages
   */
  togglePromotionalMessages: async (enabled: boolean): Promise<ApiResponse<UserNotificationPreferences>> => {
    return await userNotificationPreferencesService.updatePreferences({
      enablePromotionalMessages: enabled,
    });
  },

  /**
   * Update reminder timing
   */
  updateReminderTiming: async (hours: number[]): Promise<ApiResponse<UserNotificationPreferences>> => {
    return await userNotificationPreferencesService.updatePreferences({
      reminderTiming: { hours },
    });
  },

  /**
   * Update preferred channels
   */
  updatePreferredChannels: async (
    channels: ('PUSH' | 'SMS' | 'EMAIL')[]
  ): Promise<ApiResponse<UserNotificationPreferences>> => {
    return await userNotificationPreferencesService.updatePreferences({
      preferredChannels: { channels },
    });
  },

  /**
   * Update quiet hours
   */
  updateQuietHours: async (quietHours: {
    start: string;
    end: string;
    timezone: string;
  } | null): Promise<ApiResponse<UserNotificationPreferences>> => {
    return await userNotificationPreferencesService.updatePreferences({
      quietHours,
    });
  },

  /**
   * Update timezone
   */
  updateTimezone: async (timezone: string): Promise<ApiResponse<UserNotificationPreferences>> => {
    return await userNotificationPreferencesService.updatePreferences({
      timezone,
    });
  },
};