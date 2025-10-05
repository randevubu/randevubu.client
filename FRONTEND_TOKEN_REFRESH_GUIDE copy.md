# Frontend Token Refresh Handling Guide

## Problem Description

The backend is correctly rejecting revoked/invalid refresh tokens and returning 401 responses, but the frontend is stuck in an infinite refresh loop because it's not properly handling these 401 responses.

## Current Backend Behavior

✅ **Backend is working correctly:**
- Rejects revoked tokens with 401 status
- Returns proper error messages
- Clears HttpOnly cookies when tokens are invalid
- Logs show: "Token validation failed", "reason": "revoked"

❌ **Frontend issue:**
- Continues making refresh requests after receiving 401
- Not detecting that cookies were cleared by server
- Not clearing local state when authentication fails

## Required Frontend Changes

### 1. Handle 401 Responses Properly

When the refresh token endpoint returns a 401 status:

```typescript
// In your refresh token logic
const refreshToken = async () => {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // 🚨 CRITICAL: Handle 401 by clearing all auth state
      await clearAuthState();
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    // Handle successful refresh...
  } catch (error) {
    // 🚨 CRITICAL: Clear auth state on any error
    await clearAuthState();
    redirectToLogin();
  }
};
```

### 2. Clear Authentication State Function

Create a function to clear all authentication-related data:

```typescript
const clearAuthState = async () => {
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('hasAuth');
  
  // Clear session storage
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('hasAuth');
  
  // Clear any state management (Redux, Zustand, etc.)
  dispatch(clearAuthState());
  // or
  setAuthState(null);
  
  // Clear any cached API responses
  queryClient.clear();
  
  console.log('🧹 Cleared all authentication state');
};
```

### 3. Redirect to Login Function

```typescript
const redirectToLogin = () => {
  // Clear any pending requests
  if (refreshTokenTimeout) {
    clearTimeout(refreshTokenTimeout);
  }
  
  // Redirect to login page
  window.location.href = '/login';
  // or
  router.push('/login');
  
  console.log('🔐 Redirected to login page');
};
```

### 4. Update Token Refresh Logic

Modify your token refresh logic to stop making requests after 401:

```typescript
let isRefreshing = false;
let refreshTokenTimeout: NodeJS.Timeout | null = null;

const refreshToken = async () => {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing) {
    return;
  }
  
  isRefreshing = true;
  
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // 🚨 Stop making refresh requests and clear state
      console.log('🚫 Refresh token invalid, clearing auth state');
      await clearAuthState();
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Update tokens
    if (data.tokens) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      // Note: refreshToken is handled via HttpOnly cookies
    }
    
    console.log('✅ Token refreshed successfully');
    
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    await clearAuthState();
    redirectToLogin();
  } finally {
    isRefreshing = false;
  }
};
```

### 5. Update API Request Interceptor

Ensure your API request interceptor handles 401 responses correctly:

```typescript
// Axios interceptor example
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Don't attempt refresh for 401s from refresh endpoint
      if (error.config.url?.includes('/auth/refresh')) {
        await clearAuthState();
        redirectToLogin();
        return Promise.reject(error);
      }
      
      // For other 401s, try to refresh token
      try {
        await refreshToken();
        // Retry the original request
        return axios.request(error.config);
      } catch (refreshError) {
        await clearAuthState();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 6. Check for Cookie Changes

Since the backend clears HttpOnly cookies, you can detect this by checking if the refresh request fails:

```typescript
const checkAuthStatus = async () => {
  try {
    const response = await fetch('/api/v1/auth/me', {
      credentials: 'include',
    });
    
    if (response.status === 401) {
      // Auth cookies were cleared by server
      await clearAuthState();
      redirectToLogin();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    await clearAuthState();
    redirectToLogin();
  }
};
```

## Testing the Fix

1. **Test with revoked token:**
   - Login normally
   - Revoke the refresh token in the database
   - Refresh the page
   - Should redirect to login immediately

2. **Test with expired token:**
   - Login normally
   - Wait for token to expire
   - Make an API request
   - Should refresh token or redirect to login

3. **Test with invalid token:**
   - Manually set an invalid refresh token
   - Should clear state and redirect to login

## Key Points

- **Stop making refresh requests after 401** - This prevents the infinite loop
- **Clear all auth state on 401** - This ensures clean logout
- **Redirect to login on 401** - This provides proper user experience
- **Handle both cookie and localStorage** - The backend uses HttpOnly cookies
- **Prevent multiple simultaneous refresh attempts** - This avoids race conditions

## Expected Behavior After Fix

✅ **Before:** Infinite refresh loop with revoked tokens
✅ **After:** Clean redirect to login page when tokens are invalid

The backend is working correctly - the issue is entirely on the frontend side and requires proper 401 response handling.