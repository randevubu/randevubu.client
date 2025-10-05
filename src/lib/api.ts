import axios from 'axios';
import { getAcceptLanguageHeader } from './utils/locale';
import { defaultLocale } from '@/src/i18n';
import { clearAuthAndRedirect } from './utils/authCleanup';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Token storage for interceptor access
let currentAccessToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];
let currentLocale: string = defaultLocale;

// Token refresh state for API interceptor

// Export function to check if refresh is in progress
export const isRefreshInProgress = () => isRefreshing;

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const getAccessToken = () => {
  return currentAccessToken;
};

export const setCurrentLocale = (locale: string) => {
  currentLocale = locale;
};

// Debug method for token inspection (development only)
export const debugCurrentToken = () => {
  if (currentAccessToken) {
    try {
      const payload = JSON.parse(atob(currentAccessToken.split('.')[1]));
      return payload;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const clearAccessToken = () => {
  currentAccessToken = null;
};

// Test helper: Clear access token and trigger a refresh (for development/testing)
export const testTokenRefresh = async () => {
  currentAccessToken = null;

  try {
    const response = await apiClient.get('/api/v1/users/profile');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Expose helpers to window for development/testing (only in non-production)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testTokenRefresh = testTokenRefresh;
  (window as any).clearAccessToken = clearAccessToken;
  (window as any).getAccessToken = getAccessToken;
  (window as any).debugCurrentToken = debugCurrentToken;
}

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
    if (response.data?.tokens?.accessToken) {
      setAccessToken(response.data.tokens.accessToken);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-token-updated', {
          detail: { accessToken: response.data.tokens.accessToken }
        }));
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>)['__sessionRefreshInProgress']) {
        return Promise.reject(error);
      }

      if (typeof window !== 'undefined' && !document.cookie.includes('refreshToken=')) {
        setAccessToken(null);
        window.location.href = '/auth';
        return Promise.reject(error);
      }

      if (isRefreshing && refreshPromise) {
        return refreshPromise
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      refreshPromise = (async () => {
        try {
          const { authService } = await import('./services/auth');
          const response = await authService.refreshToken();

          if (response.success && response.data?.tokens?.accessToken) {
            const newAccessToken = response.data.tokens.accessToken;
            setAccessToken(newAccessToken);

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth-token-updated', {
                detail: { accessToken: newAccessToken }
              }));
            }

            return newAccessToken;
          } else {
            setAccessToken(null);
            return null;
          }
        } catch (refreshError) {
          const authError = refreshError as { status?: number; isAuthError?: boolean };

          if (authError.status === 401 || authError.isAuthError) {
            await clearAuthAndRedirect();
            return null;
          }

          setAccessToken(null);
          return null;
        }
      })();

      try {
        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
          return Promise.reject(error);
        }
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);