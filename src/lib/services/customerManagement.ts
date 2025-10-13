/**
 * Customer Management Service
 *
 * Handles all API calls for customer management settings
 */

import { apiClient } from '../api';
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
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
    }
    if (error.response?.status === 403) {
      throw new Error('Bu işlem için yetkiniz bulunmuyor.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
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
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
    }
    if (error.response?.status === 403) {
      throw new Error('Bu işlem için yetkiniz bulunmuyor.');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Geçersiz ayarlar. Lütfen girdiğiniz bilgileri kontrol edin.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
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
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
    }
    if (error.response?.status === 403) {
      throw new Error('Bu işlem için yetkiniz bulunmuyor.');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const customerManagementService = {
  getSettings,
  updateSettings,
  resetToDefaults
};
