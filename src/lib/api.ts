import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Token storage for interceptor access
let currentAccessToken: string | null = null;
let refreshTokenPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

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
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
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