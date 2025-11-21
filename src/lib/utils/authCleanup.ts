/**
 * Centralized authentication state cleanup utility
 *
 * This function clears ALL authentication-related data when tokens are invalid/revoked.
 * It should be called when receiving 401 from the refresh endpoint to prevent infinite loops.
 */

import { setAccessToken } from '../api';

/**
 * Clears all authentication state from the application
 * - Clears access token from memory
 * - Clears localStorage items
 * - Clears sessionStorage items
 * - Clears cookies (attempts to, HttpOnly cookies are cleared by backend)
 * - Broadcasts auth-cleared event to other parts of app
 */
export const clearAuthState = async (): Promise<void> => {
  // Clear access token from memory
  setAccessToken(null);

  // Clear localStorage
  if (typeof window !== 'undefined') {
    const itemsToClear = [
      'accessToken',
      'refreshToken',
      'user',
      'hasAuth',
      'auth',
      'userSettings',
      'settingsSectionPreferences'
    ];

    itemsToClear.forEach(item => {
      localStorage.removeItem(item);
    });
  }

  // Clear sessionStorage
  if (typeof window !== 'undefined') {
    const sessionItemsToClear = [
      'accessToken',
      'refreshToken',
      'user',
      'hasAuth',
      'dashboardProfileToastShown',
      'profileGuardToastShown'
    ];

    sessionItemsToClear.forEach(item => {
      sessionStorage.removeItem(item);
    });
  }

  // Clear cookies (note: HttpOnly cookies can ONLY be cleared by backend)
  // When clearing cookies, Express requires matching ALL options (including httpOnly) that were used when setting them
  // IMPORTANT: HttpOnly cookies (refreshToken, csrf-token) cannot be cleared from JavaScript
  // They MUST be cleared by the backend logout endpoint with matching options:
  // - refreshToken: httpOnly: true, Secure: true, SameSite: Lax, path: /
  // - csrf-token: httpOnly: true, Secure: true, SameSite: Lax, path: /
  // - hasAuth: httpOnly: false, SameSite: Lax, path: /
  if (typeof window !== 'undefined') {
    // Clear hasAuth cookie (httpOnly: false) - this one we can clear from frontend
    // Must match: path=/, SameSite=Lax (httpOnly=false is default, so not needed)
    document.cookie = 'hasAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // Note: refreshToken and csrf-token cookies are HttpOnly and CANNOT be cleared from JavaScript
    // The backend logout endpoint (/api/v1/auth/logout) MUST clear these cookies
    // Backend must use matching options: httpOnly: true, Secure: true, SameSite: Lax, path: /
  }

  // Broadcast auth-cleared event to other parts of the app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-cleared'));
  }
};

/**
 * Redirects to login page after clearing auth state
 */
export const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    // Use hard navigation to ensure complete state reset
    window.location.href = '/auth';
  }
};

/**
 * Combined function: Clear auth state and redirect to login
 * This is the function to call when receiving 401 from refresh endpoint
 */
export const clearAuthAndRedirect = async (): Promise<void> => {
  await clearAuthState();
  redirectToLogin();
};
