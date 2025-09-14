import { apiClient } from '../api';
import { 
  PhoneVerificationRequest,
  PhoneVerificationConfirm
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

  verifyLogin: async (data: PhoneVerificationConfirm): Promise<ApiResponse<{ user: any; tokens: { accessToken: string; expiresIn: number } }>> => {
    const response = await apiClient.post<ApiResponse<{ user: any; tokens: { accessToken: string; expiresIn: number } }>>(
      '/api/v1/auth/verify-login',
      data
    );
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<{ tokens: { accessToken: string; expiresIn: number } }>> => {
    // Use fetch with credentials to send HttpOnly cookies
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // 🔑 This sends HttpOnly cookies!
      headers: {
        'Content-Type': 'application/json'
      }
      // No body needed! Cookie is sent automatically
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Return the error response instead of throwing
      // This allows the caller to handle different error types gracefully
      return data;
    }

    return data;
  },

  getProfile: async (forceRoleRefresh = false): Promise<ApiResponse<{ user: any }>> => {
    const headers: Record<string, string> = {};
    
    if (forceRoleRefresh) {
      headers['X-Role-Update'] = 'true';
    }

    const response = await apiClient.get<ApiResponse<{ user: any }>>(
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