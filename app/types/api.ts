export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    message: string;
    code: string;
    requestId?: string;
    details?: any;
  };
}

export interface SendVerificationRequest {
  phoneNumber: string;
  purpose: 'REGISTRATION' | 'LOGIN';
}

export interface SendVerificationResponse {
  phoneNumber: string;
  expiresIn: number;
  purpose: 'REGISTRATION' | 'LOGIN';
}

export interface VerifyLoginRequest {
  phoneNumber: string;
  verificationCode: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  businessName?: string;
  ownerName?: string;
  email?: string;
}

export interface VerifyLoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    expiresIn: number;
    // refreshToken is handled by HttpOnly cookie, not in response
  };
  isNewUser: boolean;
}

export interface RefreshTokenResponse {
  tokens: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}