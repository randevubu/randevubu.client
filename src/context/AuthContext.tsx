'use client';

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { User } from '../types';
import { useAuthSession, useUserProfile, useTokenRefresh, useLogin, useLogout } from '../lib/hooks/useAuthQueries';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (phoneNumber: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: (forceRoleRefresh?: boolean) => Promise<void>;
  hasInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Get session using TanStack Query
  const { data: accessToken, isLoading: sessionLoading, refetch: refetchSession } = useAuthSession();

  // Get user profile using TanStack Query
  const { data: user, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(accessToken);

  // Mutations
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = useCallback(async (phoneNumber: string, verificationCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await loginMutation.mutateAsync({ phoneNumber, verificationCode });
      return { success: true };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: err.message || 'Login failed'
      };
    }
  }, [loginMutation]);

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refreshUser = useCallback(async (forceRoleRefresh = false): Promise<void> => {
    // Refetch user profile with optional role refresh
    await refetchProfile();
  }, [refetchProfile]);

  const isLoading = sessionLoading || profileLoading || loginMutation.isPending || logoutMutation.isPending;
  const isAuthenticated = !!accessToken;
  const hasInitialized = !sessionLoading;

  const contextValue: AuthContextType = useMemo(() => ({
    user: user ?? null,
    isLoading,
    isAuthenticated,
    accessToken: accessToken || null,
    login,
    logout,
    refreshUser,
    hasInitialized,
  }), [
    user,
    isLoading,
    isAuthenticated,
    accessToken,
    login,
    logout,
    refreshUser,
    hasInitialized,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
