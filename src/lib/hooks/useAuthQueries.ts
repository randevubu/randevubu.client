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
    queryKey: [...authKeys.profile(), { forceRoleRefresh }],
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

// Hook for token refresh
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
      queryClient.setQueryData(authKeys.session(), newToken);
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
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
      } catch {
        // Continue with logout even if API call fails
      }
    },
    onSuccess: async () => {
      await clearAuthState();
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.setQueryData(authKeys.profile(), null);

      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
  });
}

// Hook for session management - backend-only approach
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

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-updated', handleTokenUpdate);
      return () => {
        window.removeEventListener('auth-token-updated', handleTokenUpdate);
      };
    }
  }, [queryClient]);

  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      if (typeof window !== 'undefined') {
        const currentToken = getAccessToken();
        if (currentToken && !isTokenExpired(currentToken) && !shouldRefreshToken(currentToken)) {
          return currentToken;
        }

        try {
          if (typeof window !== 'undefined') {
            (window as unknown as Record<string, unknown>)['__sessionRefreshInProgress'] = true;
          }

          const refreshPromise = authService.refreshToken();
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Refresh timeout')), 10000)
          );

          const response = await Promise.race([refreshPromise, timeoutPromise]) as ApiResponse<{ tokens: { accessToken: string; expiresIn: number } }>;

          if (response.success && response.data?.tokens?.accessToken) {
            const newToken = response.data.tokens.accessToken;
            setApiAccessToken(newToken);
            return newToken;
          } else {
            setApiAccessToken(null);
            return null;
          }
        } catch (error) {
          const authError = error as { status?: number; isAuthError?: boolean };

          if (authError.status === 401 || authError.isAuthError) {
            await clearAuthState();
          } else {
            setApiAccessToken(null);
          }

          return null;
        } finally {
          if (typeof window !== 'undefined') {
            (window as unknown as Record<string, unknown>)['__sessionRefreshInProgress'] = false;
          }
        }
      }

      return null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 4 * 60 * 1000,
  });
}
