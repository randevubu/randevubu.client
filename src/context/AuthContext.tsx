'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../lib/services/auth';
import { userService } from '../lib/services/user';
import { VerificationPurpose } from '../types/enums';
import { setAccessToken as setApiAccessToken, setRefreshTokenFunction } from '../lib/api';
import { handleApiError } from '../lib/utils/toast';
import { logJWTContents } from '../lib/utils/jwt';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (phoneNumber: string, verificationCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshTokenAndUser: (forceRoleRefresh?: boolean) => Promise<void>;
  updateTokensAndUser: (tokens: { accessToken: string; refreshToken?: string }) => Promise<void>;
  hasInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sync access token with API client
  useEffect(() => {
    setApiAccessToken(accessToken);
  }, [accessToken]);

  // Enhanced authentication state that handles SSR/hydration properly
  const isAuthenticated = !!accessToken;
  
  // Show authenticated state during SSR if we detect auth cookie
  // This prevents layout shift and provides better UX
  const shouldShowAuthenticatedUI = () => {
    if (!hasInitialized) {
      // During SSR/initial load, check cookie or server state to determine UI state
      // Show as authenticated if we have auth cookies, even without access token in memory
      return getInitialAuthState() || getServerAuthState();
    }
    // After initialization, require actual authentication
    return isAuthenticated;
  };

  // Debug logging removed for cleaner console output

  // Industry-standard cookie detection (like Auth0, Firebase, AWS Cognito)
  // Backend should set a non-HttpOnly "hasAuth" cookie alongside the HttpOnly refresh token
  const hasAuthSession = (): boolean => {
    if (typeof window === 'undefined') {
      // For SSR, we can't access cookies directly
      // This will be handled by the client-side effect
      return false;
    }

    // Check for auth hint cookie that backend should set
    // This is the standard approach used by major auth providers
    // Also check for accessToken cookie as fallback in case backend is setting it
    return document.cookie.includes('hasAuth=1') ||
           document.cookie.includes('accessToken=') ||
           document.cookie.includes('refreshToken=');
  };

  // Get initial auth state from cookies (SSR-safe)
  const getInitialAuthState = (): boolean => {
    if (typeof window === 'undefined') {
      // During SSR, we can't access cookies directly
      // This will be synced by the client-side effect
      return false;
    }
    return document.cookie.includes('hasAuth=1') ||
           document.cookie.includes('accessToken=') ||
           document.cookie.includes('refreshToken=');
  };

  // Get auth state from server headers (set by middleware)
  const getServerAuthState = (): boolean => {
    if (typeof window === 'undefined') return false;

    // Check if we received auth state from server during initial load
    const metaTag = document.querySelector('meta[name="auth-state"]');
    return metaTag?.getAttribute('content') === 'authenticated';
  };

  // Try to read access token from cookie (fallback for production)
  const getAccessTokenFromCookie = (): string | null => {
    if (typeof window === 'undefined') return null;

    const match = document.cookie.match(/accessToken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  // Auto-refresh token when it expires
  // Uses HttpOnly cookies for refresh token (secure, XSS-proof)
  // Access token stored in memory only (cleared on page refresh)
  const refreshToken = async (silent = false): Promise<string | null> => {
    try {
      const response = await authService.refreshToken();
      
      if (response.success && response.data?.tokens?.accessToken) {
        const newToken = response.data.tokens.accessToken;
        setAccessToken(newToken);
        setApiAccessToken(newToken); // Ensure API client has token immediately
        return newToken;
      }
      
      // Handle error responses gracefully
      if (!response.success) {
        const isTokenMissing = response.error?.code === 'REFRESH_TOKEN_MISSING';
        
        // Only show non-missing-token errors, and only if not silent
        if (!silent && !isTokenMissing) {
          handleApiError(response);
        }
        
        // Only clear auth state for unexpected errors (not missing tokens)
        if (!isTokenMissing) {
          setAccessToken(null);
          setUser(null);
        }
      }
      
      return null;
    } catch (error) {
      // Network or parsing errors - only show if not silent
      if (!silent) {
        handleApiError(error);
      }
      return null;
    }
  };

  // Fetch user profile with role update support
  const fetchUserProfile = async (token?: string, forceRoleRefresh = false): Promise<User | null> => {
    try {
      const currentToken = token || accessToken;
      if (!currentToken) return null;

      // Temporarily set token for this request
      if (token) {
        setAccessToken(token);
        setApiAccessToken(token); // Ensure API client has token immediately
      }
      
      const response = await authService.getProfile(forceRoleRefresh);
      if (response.success && response.data?.user) {
        return response.data.user;
      }

      return null;
    } catch (error) {
      handleApiError(error);
      
      // If it's a 401, try to refresh token once
      if ((error as any)?.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          // Retry with new token
          try {
            const response = await authService.getProfile(forceRoleRefresh);
            if (response.success && response.data?.user) {
              return response.data.user;
            }
          } catch (retryError) {
            handleApiError(retryError);
          }
        }
      }

      return null;
    }
  };

  const login = async (phoneNumber: string, verificationCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await authService.verifyLogin({
        phoneNumber,
        verificationCode,
      });

      if (response.success && response.data) {
        // Store access token in memory only
        const newAccessToken = response.data.tokens?.accessToken;
        if (newAccessToken) {
          // Set token in state AND immediately sync with API client
          setAccessToken(newAccessToken);
          setApiAccessToken(newAccessToken); // Ensure API client has token immediately
          
          // Note: Backend should set "hasAuth" hint cookie automatically
          // No client-side storage needed for auth state
          
          // Now fetch user profile with guaranteed token availability
          const userProfile = await fetchUserProfile(newAccessToken);
          setUser(userProfile);
          
          return { success: true };
        }
      }

      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      handleApiError(error);
      return { 
        success: false, 
        error: (error as any)?.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      handleApiError(error);
    } finally {
      // Clear memory state only - backend clears cookies
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!accessToken) return;
    
    setIsLoading(true);
    try {
      const userProfile = await fetchUserProfile();
      setUser(userProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokenAndUser = async (forceRoleRefresh = false): Promise<void> => {
    setIsLoading(true);
    try {
      // First refresh the token to get updated roles
      const newToken = await refreshToken(false);
      if (newToken) {
        // Then fetch updated user profile with the new token and force role refresh
        const userProfile = await fetchUserProfile(newToken, forceRoleRefresh);
        setUser(userProfile);
        console.log('✅ Token and user profile updated', forceRoleRefresh ? 'with role refresh' : '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateTokensAndUser = async (tokens: { accessToken: string; refreshToken?: string }): Promise<void> => {
    console.log('🔄 updateTokensAndUser called with new tokens');
    console.log('🔍 Old token preview:', accessToken?.substring(0, 50) + '...');
    
    // Decode and log JWT contents for debugging
    logJWTContents(tokens.accessToken, 'New Access Token');
    
    setIsLoading(true);
    try {
      // Set the new access token
      setAccessToken(tokens.accessToken);
      setApiAccessToken(tokens.accessToken);
      console.log('✅ Access token updated in state and API client');
      console.log('🔍 New token preview:', tokens.accessToken.substring(0, 50) + '...');
      
      // Note: Refresh token is handled by HttpOnly cookies on the backend
      // We don't need to manually store it, but we should acknowledge it exists
      if (tokens.refreshToken) {
        console.log('✅ New refresh token received (stored in HttpOnly cookie by backend)');
      }
      
      // Small delay to ensure token is fully set before fetching profile
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Fetch updated user profile with the new token and force role refresh
      console.log('🔄 Fetching updated user profile with new token...');
      const userProfile = await fetchUserProfile(tokens.accessToken, true);
      
      if (userProfile) {
        console.log('👤 Updated user profile with new roles:', userProfile.roles?.map(r => r.name) || 'No roles');
        console.log('🎭 User effective role level:', userProfile.effectiveLevel || 'No level');
        setUser(userProfile);
      } else {
        console.warn('⚠️ Failed to fetch updated user profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize auth state on mount with proper hydration handling
  useEffect(() => {
    // Register refresh function with API client
    setRefreshTokenFunction(() => refreshToken(true));

    const initializeAuth = async () => {
      try {
        // Wait for client-side hydration to complete
        await new Promise(resolve => setTimeout(resolve, 0));

        // Debug cookie state
        if (typeof window !== 'undefined') {
          console.log('🔍 Auth initialization debug:');
          console.log('- Has hasAuth cookie:', document.cookie.includes('hasAuth=1'));
          console.log('- Has accessToken cookie:', document.cookie.includes('accessToken='));
          console.log('- Has refreshToken cookie:', document.cookie.includes('refreshToken='));
          console.log('- Current access token in memory:', !!accessToken);
        }

        // Only try refresh if we have auth session indicator
        // This completely avoids 400 requests on fresh visits
        if (getInitialAuthState() || getServerAuthState()) {
          console.log('✅ Auth session detected, initializing...');
          // Check if access token exists in cookie (production fallback)
          const tokenFromCookie = getAccessTokenFromCookie();
          if (tokenFromCookie && !accessToken) {
            console.log('🍪 Found access token in cookie, setting in memory');
            setAccessToken(tokenFromCookie);
            setApiAccessToken(tokenFromCookie);
            const userProfile = await fetchUserProfile(tokenFromCookie);
            setUser(userProfile);
          } else {
            console.log('🔄 No token in cookie or already in memory, trying refresh...');
            // Try refresh token flow
            const token = await refreshToken(true);
            if (token) {
              const userProfile = await fetchUserProfile(token);
              setUser(userProfile);
            }
          }
        } else {
          console.log('❌ No auth session detected, user not logged in');
          // No auth session cookie - user is not logged in
          // Skip the API call entirely for clean network tab
        }
      } catch (error) {
        // Silent initialization - only show unexpected errors
        handleApiError(error);
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh (Silent Refresh)
  // Refreshes token automatically before expiry to maintain session
  useEffect(() => {
    if (!accessToken) return;

    // Set up refresh timer - refresh 5 minutes before expiry (assuming 1 hour tokens)
    // This ensures users never experience authentication interruptions
    const refreshInterval = setInterval(async () => {
      await refreshToken();
    }, 55 * 60 * 1000); // 55 minutes

    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: shouldShowAuthenticatedUI(),
    accessToken,
    login,
    logout,
    refreshUser,
    refreshTokenAndUser,
    updateTokensAndUser,
    hasInitialized,
  };

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