import { User } from '../../types/auth';

/**
 * Checks if a user has completed their required profile information
 */
export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  
  const hasFirstName = Boolean(user.firstName?.trim());
  const hasLastName = Boolean(user.lastName?.trim());
  
  return hasFirstName && hasLastName;
};

/**
 * Checks if the current pathname should allow incomplete profiles
 */
export const isProfileRelatedPage = (pathname: string): boolean => {
  const profilePaths = ['/profile', '/settings', '/appointments', '/businesses'];
  const profilePatterns = ['/settings', '/businesses'];
  
  return profilePaths.includes(pathname) || 
         profilePatterns.some(pattern => pathname.includes(pattern));
};

/**
 * Determines if user should be redirected due to incomplete profile
 */
export const shouldRedirectForProfile = (
  user: User | null, 
  pathname: string
): boolean => {
  if (!user) return false;
  
  const profileComplete = isProfileComplete(user);
  const isProfilePage = isProfileRelatedPage(pathname);
  
  // Redirect if profile incomplete and not on a profile page
  return !profileComplete && !isProfilePage;
};