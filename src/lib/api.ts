import axios from 'axios';
import { getAcceptLanguageHeader } from './utils/locale';
import { defaultLocale } from '@/src/i18n';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Token storage for interceptor access
let currentAccessToken: string | null = null;
let refreshTokenPromise: Promise<string | null> | null = null;
let currentLocale: string = defaultLocale;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
  console.log('🔄 API Client: Access token updated', token ? 'Token set' : 'Token cleared');
};

export const setCurrentLocale = (locale: string) => {
  currentLocale = locale;
  console.log('🌐 API Client: Locale updated to', locale);
};

export const getAccessToken = () => currentAccessToken;

// Add debug method for token inspection
export const debugCurrentToken = () => {
  if (currentAccessToken) {
    try {
      const payload = JSON.parse(atob(currentAccessToken.split('.')[1]));
      console.log('🎭 Current token roles:', payload.roles || 'No roles in token');
      console.log('🔍 Token preview:', currentAccessToken.substring(0, 50) + '...');
      return payload;
    } catch (e) {
      console.warn('Could not decode current token');
      return null;
    }
  } else {
    console.log('❌ No access token set');
    return null;
  }
};

export const clearAccessToken = () => {
  currentAccessToken = null;
};

// Function to refresh token - will be set by AuthContext
let refreshTokenFunction: () => Promise<string | null> = async () => null;

export const setRefreshTokenFunction = (fn: () => Promise<string | null>) => {
  refreshTokenFunction = fn;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Include cookies in requests
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }

    // Add Accept-Language header based on current locale
    config.headers['Accept-Language'] = getAcceptLanguageHeader(currentLocale as any);

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    // Check if response contains new tokens and update them
    if (response.data?.tokens?.accessToken) {
      console.log('🔑 New access token received in API response, updating...');
      setAccessToken(response.data.tokens.accessToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a 401 error and we haven't already tried refreshing for this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Prevent multiple simultaneous refresh attempts
        if (!refreshTokenPromise) {
          refreshTokenPromise = refreshTokenFunction();
        }

        const newToken = await refreshTokenPromise;
        refreshTokenPromise = null;

        if (newToken) {
          // Update the token for this request and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        refreshTokenPromise = null;
        // If refresh fails, reject the original error
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);