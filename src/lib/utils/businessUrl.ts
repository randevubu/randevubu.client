/**
 * Utility functions for generating business URLs
 */

/**
 * Get the production domain from environment variables
 * Falls back to localhost for development
 */
export const getProductionDomain = (): string => {
  return process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'localhost:3000';
};

/**
 * Generate the public business URL
 * Format: https://domain.com/businesses/[business-slug]
 */
export const generateBusinessUrl = (businessSlug: string): string => {
  const domain = getProductionDomain();
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${domain}/businesses/${businessSlug}`;
};

/**
 * Generate the public business URL with proper protocol handling
 * Handles both development and production environments
 */
export const getBusinessPublicUrl = (businessSlug: string): string => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000/businesses/${businessSlug}`;
  }
  
  // In production, use the configured domain
  return generateBusinessUrl(businessSlug);
};
