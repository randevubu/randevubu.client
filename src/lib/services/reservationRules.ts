/**
 * Reservation Rules Service
 * 
 * Service for managing business reservation rules settings.
 * Follows the API documentation structure with proper error handling,
 * validation, and type safety.
 */

import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import { extractErrorMessage } from '../utils/errorExtractor';
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
    } catch (error: unknown) {
      // Use backend's translated error message if available
      const errorMessage = extractErrorMessage(error, 'Failed to fetch reservation settings');
      throw new Error(errorMessage);
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
    } catch (error: unknown) {
      // Use backend's translated error message if available
      const errorMessage = extractErrorMessage(error, 'Failed to update reservation settings');
      throw new Error(errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Failed to reset reservation settings to defaults');
      throw new Error(errorMessage);
    }
  }
};

