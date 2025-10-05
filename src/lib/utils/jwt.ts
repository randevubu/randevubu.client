/**
 * JWT Token utilities
 * Handles parsing and validation of JWT tokens
 * All token lifetimes are backend-decided via JWT exp claim
 */

export interface JWTPayload {
  sub?: string; // Subject (user ID)
  exp?: number; // Expiration time
  iat?: number; // Issued at
  roles?: string[];
  [key: string]: any;
}

/**
 * Parse JWT token and return payload
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.warn('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return true; // Consider invalid tokens as expired
  }
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpiry(token: string): number | null {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }
  
  return payload.exp * 1000; // Convert to milliseconds
}

/**
 * Get time until token expires in milliseconds
 */
export function getTimeUntilExpiry(token: string): number | null {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return null;
  }
  
  return expiry - Date.now();
}

/**
 * Check if token needs refresh (expires within specified minutes)
 */
export function needsRefresh(token: string, minutesBeforeExpiry = 5): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  if (!timeUntilExpiry) {
    return true; // Consider invalid tokens as needing refresh
  }
  
  const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
  return minutesUntilExpiry <= minutesBeforeExpiry;
}

/**
 * Get user ID from JWT token
 */
export function getUserIdFromToken(token: string): string | null {
  const payload = parseJWT(token);
  return payload?.sub || null;
}

/**
 * Get roles from JWT token
 */
export function getRolesFromToken(token: string): string[] {
  const payload = parseJWT(token);
  return payload?.roles || [];
}

/**
 * Log JWT contents for debugging
 */
export function logJWTContents(token: string, label = 'JWT Token'): void {
  const payload = parseJWT(token);
  if (payload) {
    console.log(`🔍 ${label} contents:`, {
      sub: payload.sub,
      exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiry',
      iat: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'No issued at',
      roles: payload.roles || 'No roles',
      timeUntilExpiry: payload.exp ? Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60) + ' minutes' : 'Unknown'
    });
  } else {
    console.warn(`⚠️ Could not parse ${label}`);
  }
}

/**
 * Check if token needs refresh based on time remaining
 * Returns true if token expires within the specified minutes
 */
export function shouldRefreshToken(token: string, minutesBeforeExpiry = 2): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  if (!timeUntilExpiry) {
    return true; // Invalid token needs refresh
  }
  
  const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
  return minutesUntilExpiry <= minutesBeforeExpiry;
}

/**
 * Get token age in minutes
 */
export function getTokenAge(token: string): number | null {
  const payload = parseJWT(token);
  if (!payload || !payload.iat) {
    return null;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return (now - payload.iat) / 60; // Age in minutes
}