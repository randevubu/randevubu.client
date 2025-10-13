/**
 * Reservation Rules Service
 * 
 * Service for managing business reservation rules settings.
 * Follows the API documentation structure with proper error handling,
 * validation, and type safety.
 */

import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import {
  ReservationSettings,
  UpdateReservationSettingsRequest,
  ReservationSettingsResponse,
  validateReservationSettings
} from '../../types/reservationRules';

/**
 * Reservation Rules API Service
 * 
 * Handles all reservation rules API calls with proper error handling,
 * validation, and type safety following the documented API structure.
 */
export const reservationRulesService = {
  /**
   * Get current reservation settings for the business
   * 
   * @returns Promise<ReservationSettingsResponse>
   * @throws Error if API call fails or returns error
   */
  getSettings: async (): Promise<ReservationSettingsResponse> => {
    try {
      const response = await apiClient.get<ReservationSettingsResponse>(
        '/api/v1/businesses/my-business/reservation-settings'
      );
      
      if (!response.data.success) {
        throw new Error('Failed to fetch reservation settings');
      }
      
      return response.data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized access - please log in again');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access reservation settings');
      } else if (error.response?.status === 400) {
        throw new Error('Business context is required');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Failed to fetch reservation settings');
      }
    }
  },

  /**
   * Update reservation settings for the business
   * 
   * @param settings - Partial reservation settings to update
   * @returns Promise<ReservationSettingsResponse>
   * @throws Error if validation fails or API call fails
   */
  updateSettings: async (settings: UpdateReservationSettingsRequest): Promise<ReservationSettingsResponse> => {
    try {
      // Validate settings before sending to API
      const validationErrors = validateReservationSettings(settings);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Ensure at least one field is provided
      if (Object.keys(settings).length === 0) {
        throw new Error('At least one setting must be provided for update');
      }

      const response = await apiClient.put<ReservationSettingsResponse>(
        '/api/v1/businesses/my-business/reservation-settings',
        settings
      );
      
      if (!response.data.success) {
        throw new Error('Failed to update reservation settings');
      }
      
      return response.data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized access - please log in again');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to edit reservation settings');
      } else if (error.response?.status === 400) {
        // Handle validation errors from server
        const serverError = error.response.data.error;
        if (serverError.includes('Max advance booking days')) {
          throw new Error('Maximum advance booking is 365 days');
        } else if (serverError.includes('Minimum notification period')) {
          throw new Error('Minimum notification period is 1 hour');
        } else if (serverError.includes('Maximum notification period')) {
          throw new Error('Maximum notification period is 1 week (168 hours)');
        } else if (serverError.includes('Minimum daily appointments')) {
          throw new Error('Minimum daily appointments is 1');
        } else if (serverError.includes('Maximum daily appointments')) {
          throw new Error('Maximum daily appointments is 1000');
        } else {
          throw new Error(serverError);
        }
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Failed to update reservation settings');
      }
    }
  },

  /**
   * Reset reservation settings to default values
   * 
   * @returns Promise<ReservationSettingsResponse>
   * @throws Error if API call fails
   */
  resetToDefaults: async (): Promise<ReservationSettingsResponse> => {
    try {
      const defaultSettings: UpdateReservationSettingsRequest = {
        maxAdvanceBookingDays: 30,
        minNotificationHours: 2,
        maxDailyAppointments: 50
      };

      return await reservationRulesService.updateSettings(defaultSettings);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset reservation settings to defaults');
    }
  }
};

