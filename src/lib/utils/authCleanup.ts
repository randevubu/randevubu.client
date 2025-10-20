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

  // Attempt to clear cookies (note: HttpOnly cookies can only be cleared by backend)
  if (typeof window !== 'undefined') {
    // Clear hasAuth cookie (this one is not HttpOnly)
    document.cookie = 'hasAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // Attempt to clear refreshToken cookie (likely HttpOnly, so this may not work)
    // The backend should clear this when it sends 401
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
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
