import { apiClient } from '../api';
import { 
  ApiResponse, 
  SendVerificationRequest, 
  SendVerificationResponse,
  VerifyLoginRequest,
  VerifyLoginResponse,
  RefreshTokenResponse
} from '../../types/api';

export const authService = {
  sendVerification: async (data: SendVerificationRequest): Promise<ApiResponse<SendVerificationResponse>> => {
    const response = await apiClient.post<ApiResponse<SendVerificationResponse>>(
      '/api/v1/auth/send-verification',
      data
    );
    return response.data;
  },

  verifyLogin: async (data: VerifyLoginRequest): Promise<ApiResponse<VerifyLoginResponse>> => {
    const response = await apiClient.post<ApiResponse<VerifyLoginResponse>>(
      '/api/v1/auth/verify-login',
      data
    );
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<RefreshTokenResponse>> => {
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

  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  },
};