export interface ApiResponse<T = any> {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: T;
  error?: {
    code: string;
    key: string; // Translation key for i18n (e.g., "errors.auth.unauthorized")
    message: string; // Translated message in detected language
    requestId?: string;
    details?: any;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProfileResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    user: import('./auth').User;
  };
  error?: {
    code: string;
    key: string; // Translation key for i18n
    message: string; // Translated message in detected language
    requestId?: string;
    details?: any;
  };
}

export interface MyBusinessResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    businesses: import('./business').Business[];
    hasBusinesses: boolean;
    isFirstTimeUser: boolean;
    canCreateBusiness: boolean;
    context?: {
      primaryBusinessId?: string;
      totalBusinesses: number;
      includesSubscriptionInfo: boolean;
    };
  };
  error?: {
    code: string;
    key: string; // Translation key for i18n
    message: string; // Translated message in detected language
    requestId?: string;
    details?: any;
  };
}

export interface CreateBusinessResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: import('./business').Business;
  tokens?: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  };
  error?: {
    code: string;
    key: string; // Translation key for i18n
    message: string; // Translated message in detected language
    requestId?: string;
    details?: any;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}