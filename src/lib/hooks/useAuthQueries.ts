import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { setAccessToken as setApiAccessToken, getAccessToken } from '../api';
import { handleApiError } from '../utils/toast';
import { isTokenExpired, shouldRefreshToken } from '../utils/jwt';
import { clearAuthAndRedirect, clearAuthState } from '../utils/authCleanup';
import { ApiResponse } from '../../types/api';

// Query keys for consistent caching
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// Hook for user profile
export function useUserProfile(accessToken?: string | null, forceRoleRefresh = false) {
  return useQuery({
    queryKey: [...authKeys.profile(), { forceRoleRefresh: forceRoleRefresh || false }],
    queryFn: async () => {
      if (!accessToken) return null;

      const response = await authService.getProfile(forceRoleRefresh);
      if (response.success && response.data?.user) {
        return response.data.user;
      }
      return null;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

// Hook for manual token refresh (rarely needed - interceptor handles automatic refresh)
export function useTokenRefresh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await authService.refreshToken();

        if (response.success && response.data?.tokens?.accessToken) {
          const newToken = response.data.tokens.accessToken;
          setApiAccessToken(newToken);
          return newToken;
        }

        throw new Error('Unexpected response format from refresh endpoint');
      } catch (error) {
        const authError = error as { status?: number; isAuthError?: boolean };

        if (authError.status === 401 || authError.isAuthError) {
          await clearAuthState();
          queryClient.setQueryData(authKeys.session(), null);
          queryClient.setQueryData(authKeys.profile(), null);

          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
        }

        throw error;
      }
    },
    onSuccess: (newToken) => {
      // Update session cache with new token
      queryClient.setQueryData(authKeys.session(), newToken);
      // Profile query will automatically refetch due to accessToken dependency (enabled: !!accessToken)
      // No need for manual invalidation
    },
    onError: (error: unknown) => {
      const authError = error as { status?: number; isAuthError?: boolean };

      if (authError.status !== 401 && !authError.isAuthError) {
        queryClient.setQueryData(authKeys.session(), null);
        queryClient.setQueryData(authKeys.profile(), null);
        setApiAccessToken(null);
      }
    },
  });
}

// Hook for login
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ phoneNumber, verificationCode }: { phoneNumber: string; verificationCode: string }) => {
      const response = await authService.verifyLogin({
        phoneNumber,
        verificationCode,
      });

      if (response.success && response.data?.tokens?.accessToken) {
        return {
          accessToken: response.data.tokens.accessToken,
          user: response.data.user,
        };
      }

      throw new Error(response.message || 'Login failed');
    },
  onSuccess: (data) => {
    // Set token in API client
    setApiAccessToken(data.accessToken);
    
    // Note: hasAuth cookie is set by backend automatically
    // We don't need to set it manually for web clients
    
    // Update query cache
    queryClient.setQueryData(authKeys.session(), data.accessToken);
    queryClient.setQueryData(authKeys.profile(), data.user);
  },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

// Hook for logout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (error) {
        // Log error but continue with client-side cleanup
        console.warn('Logout API call failed, continuing with local cleanup:', error);
      }

      // Clear all auth state synchronously before redirect
      await clearAuthState();

      // Clear query cache
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.setQueryData(authKeys.profile(), null);
      queryClient.clear(); // Clear all queries to ensure clean slate
    },
    onSuccess: () => {
      // Hard redirect to clear all in-memory state
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
    onError: (error) => {
      // Even on error, we want to clear local state and redirect
      console.error('Logout error:', error);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
  });
}

// Hook for session management - relies on API interceptor for refresh
export function useAuthSession() {
  const queryClient = useQueryClient();

  // Listen for token updates from API interceptor
  React.useEffect(() => {
    const handleTokenUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ accessToken?: string }>;
      const { accessToken } = customEvent.detail;
      if (accessToken) {
        queryClient.setQueryData(authKeys.session(), accessToken);
      }
    };

    const handleAuthCleared = () => {
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.setQueryData(authKeys.profile(), null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-updated', handleTokenUpdate);
      window.addEventListener('auth-cleared', handleAuthCleared);
      return () => {
        window.removeEventListener('auth-token-updated', handleTokenUpdate);
        window.removeEventListener('auth-cleared', handleAuthCleared);
      };
    }
  }, [queryClient]);

  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      // Simply return the current token from memory
      // Token refresh is handled by the API interceptor on 401 errors
      const currentToken = getAccessToken();

      if (!currentToken) {
        // Try to refresh once on app initialization
        try {
          const response = await authService.refreshToken();
          if (response.success && response.data?.tokens?.accessToken) {
            const newToken = response.data.tokens.accessToken;
            setApiAccessToken(newToken);
            return newToken;
          }
        } catch (error) {
          const authError = error as { status?: number; isAuthError?: boolean };
          if (authError.status === 401 || authError.isAuthError) {
            await clearAuthState();
          }
          return null;
        }
      }

      return currentToken;
    },
    staleTime: Infinity, // Token doesn't go stale - interceptor handles refresh
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false, // No polling - interceptor handles refresh
  });
}
