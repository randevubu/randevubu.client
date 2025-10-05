import { apiClient } from '../api';
import {
  PhoneVerificationRequest,
  PhoneVerificationConfirm,
  User
} from '../../types/auth';
import { ApiResponse } from '../../types/api';

export const authService = {
  sendVerification: async (data: PhoneVerificationRequest): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      '/api/v1/auth/send-verification',
      data
    );
    return response.data;
  },

  verifyLogin: async (data: PhoneVerificationConfirm): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; expiresIn: number } }>> => {
    const response = await apiClient.post<ApiResponse<{ user: User; tokens: { accessToken: string; expiresIn: number } }>>(
      '/api/v1/auth/verify-login',
      data
    );

    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<{ tokens: { accessToken: string; expiresIn: number } }>> => {
    // Use fetch with credentials to send HttpOnly cookies
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Handle 401 - refresh token is invalid/revoked
    if (response.status === 401) {
      const error = new Error(data.error?.message || data.message || 'Refresh token is invalid or revoked') as Error & {
        isAuthError: boolean;
        status: number;
      };
      error.isAuthError = true;
      error.status = 401;
      throw error;
    }

    // Handle other errors (403, 500, etc.)
    if (!response.ok) {
      const error = new Error(data.error?.message || data.message || 'Token refresh failed') as Error & {
        status: number;
      };
      error.status = response.status;
      throw error;
    }

    return data;
  },

  getProfile: async (forceRoleRefresh = false): Promise<ApiResponse<{ user: User }>> => {
    const headers: Record<string, string> = {};

    if (forceRoleRefresh) {
      headers['X-Role-Update'] = 'true';
    }

    const response = await apiClient.get<ApiResponse<{ user: User }>>(
      '/api/v1/users/profile?includeBusinessSummary=true',
      { headers }
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/api/v1/auth/logout');
    return response.data;
  },
};