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
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: import('./auth').User;
  };
  error?: {
    message: string;
    code: string;
    requestId?: string;
    details?: any;
  };
}

export interface MyBusinessResponse {
  success: boolean;
  message: string;
  data?: {
    businesses: import('./business').Business[];
    subscriptions?: import('./subscription').BusinessSubscription[];
  };
  error?: {
    message: string;
    code: string;
    requestId?: string;
    details?: any;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}