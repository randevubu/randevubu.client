/**
 * Customer Management Service
 *
 * Handles all API calls for customer management settings
 */

import { apiClient } from '../api';
import { extractErrorMessage } from '../utils/errorExtractor';
import {
  CustomerManagementSettings,
  CustomerManagementSettingsResponse,
  UpdateCustomerManagementSettingsRequest
} from '../../types/customerManagement';

/**
 * Get customer management settings for the business
 */
const getSettings = async (): Promise<CustomerManagementSettingsResponse> => {
  try {
    const response = await apiClient.get<CustomerManagementSettingsResponse>(
      '/api/v1/businesses/my-business/customer-management-settings'
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch customer management settings');
    }

    return response.data;
  } catch (error: unknown) {
    // Use backend's translated error message if available
    const errorMessage = extractErrorMessage(error, 'İşlem başarısız oldu');
    throw new Error(errorMessage);
  }
};

/**
 * Update customer management settings
 */
const updateSettings = async (
  settings: UpdateCustomerManagementSettingsRequest
): Promise<CustomerManagementSettingsResponse> => {
  try {
    const response = await apiClient.put<CustomerManagementSettingsResponse>(
      '/api/v1/businesses/my-business/customer-management-settings',
      settings
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update customer management settings');
    }

    return response.data;
  } catch (error: unknown) {
    // Use backend's translated error message if available
    const errorMessage = extractErrorMessage(error, 'Failed to update customer management settings');
    throw new Error(errorMessage);
  }
};

/**
 * Reset customer management settings to defaults
 */
const resetToDefaults = async (): Promise<CustomerManagementSettingsResponse> => {
  try {
    const response = await apiClient.post<CustomerManagementSettingsResponse>(
      '/api/v1/businesses/my-business/customer-management-settings/reset'
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reset customer management settings');
    }

    return response.data;
  } catch (error: unknown) {
    // Use backend's translated error message if available
    const errorMessage = extractErrorMessage(error, 'İşlem başarısız oldu');
    throw new Error(errorMessage);
  }
};

export const customerManagementService = {
  getSettings,
  updateSettings,
  resetToDefaults
};
