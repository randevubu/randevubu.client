import { User, UserRole } from '../../types/auth';
import { BusinessSubscription } from '../../types/subscription';
import { SubscriptionStatus } from '../../types/enums';

// Role hierarchy and permissions (matches backend exactly)
export const ROLE_LEVELS = {
  CUSTOMER: 100,
  STAFF: 200,
  OWNER: 300,
  ADMIN: 1000,
} as const;

// Check if user has a specific role
export const hasRole = (user: User | null, roleName: string): boolean => {
  if (!user?.roles) return false;
  return user.roles.some(role => role.name === roleName);
};

// Check if user has minimum permission level
export const hasMinimumLevel = (user: User | null, minLevel: number): boolean => {
  if (!user?.effectiveLevel) return false;
  return user.effectiveLevel >= minLevel;
};

// Role checking functions - prioritize exact role name matching
export const isCustomer = (user: User | null): boolean => {
  if (!user?.roles || user.roles.length === 0) return true;
  return user.roles.some(role => role.name === 'CUSTOMER');
};

export const isStaff = (user: User | null): boolean => {
  return hasRole(user, 'STAFF');
};

export const isOwner = (user: User | null): boolean => {
  return hasRole(user, 'OWNER');
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

// Check if user can manage business
export const canManageBusiness = (user: User | null): boolean => {
  return isOwner(user) || isAdmin(user);
};

// Check if user can view business stats (İşletmem button)
export const canViewBusinessStats = (user: User | null): boolean => {
  console.log('🔍 canViewBusinessStats called with user:', user);
  
  if (!user) {
    console.log('❌ No user provided');
    return false;
  }
  
  const isOwnerResult = isOwner(user);
  const isStaffResult = isStaff(user);
  
  console.log('🔑 Permission check results:', {
    isOwner: isOwnerResult,
    isStaff: isStaffResult
  });
  
  // Only show İşletmem for OWNER and STAFF (not MANAGER, not CUSTOMER)
  const result = isOwnerResult || isStaffResult;
  console.log('✅ Final permission result:', result);
  
  return result;
};

// Get user's primary role for display
export const getPrimaryRole = (user: User | null): string => {
  if (!user?.roles || user.roles.length === 0) return 'Müşteri';
  
  // Return the role with highest level
  const primaryRole = user.roles.reduce((prev, current) => 
    (prev.level > current.level) ? prev : current
  );
  
  return primaryRole.displayName;
};

// Get user's primary business ID
export const getPrimaryBusinessId = (user: User | null): string | null => {
  console.log('🔍 getPrimaryBusinessId called with user:', user);
  
  if (!user) {
    console.log('❌ No user provided');
    return null;
  }
  
  // First, check if there's an explicitly set primary business
  if (user.primaryBusinessId) {
    console.log('✅ Found primaryBusinessId:', user.primaryBusinessId);
    return user.primaryBusinessId;
  }
  
  // Otherwise, get from businesses array
  if (user.businesses && user.businesses.length > 0) {
    console.log('🏢 User has businesses array:', user.businesses);
    // Return first active business, or just first business
    const activeBusiness = user.businesses.find(b => b.isActive);
    const businessId = activeBusiness?.id || user.businesses[0].id;
    console.log('🎯 Selected business ID from businesses array:', businessId);
    return businessId;
  }
  
  // As fallback, try to extract from roles if they have businessId
  if (user.roles) {
    console.log('🔑 User has roles:', user.roles);
    const roleWithBusiness = user.roles.find(r => r.businessId);
    if (roleWithBusiness?.businessId) {
      console.log('✅ Found business ID from role:', roleWithBusiness.businessId);
      return roleWithBusiness.businessId;
    }
  }
  
  console.log('❌ No business ID found in any location');
  return null;
};

// Check if user has access to specific business
export const hasBusinessAccess = (user: User | null, businessId: string): boolean => {
  if (!user || !businessId) return false;
  
  // Check in businesses array
  if (user.businesses) {
    return user.businesses.some(b => b.id === businessId && b.isActive);
  }
  
  // Check in roles
  if (user.roles) {
    return user.roles.some(r => r.businessId === businessId);
  }
  
  return false;
};

/**
 * Check if a business has an active subscription
 */
export function hasActiveSubscription(subscriptions?: BusinessSubscription[]): boolean {
  if (!subscriptions || subscriptions.length === 0) {
    return false;
  }
  
  return subscriptions.some(subscription => 
    subscription.status === SubscriptionStatus.ACTIVE || 
    subscription.status === SubscriptionStatus.TRIAL
  );
}

/**
 * Check if a user can access dashboard features
 * This combines business stats permission with subscription check
 */
export function canAccessDashboard(user: User, subscriptions?: BusinessSubscription[]): boolean {
  return canViewBusinessStats(user) && hasActiveSubscription(subscriptions);
}

/**
 * Check if user is a customer only (no business, no subscription)
 * Should show: İşletmeleri Keşfet + İşletme Oluştur buttons
 */
export function isCustomerOnly(user: User | null): boolean {
  if (!user) return false;
  
  // User must be a customer
  if (!isCustomer(user)) return false;
  
  // User should not have any businesses
  if (user.businesses && user.businesses.length > 0) return false;
  
  // User should not have business-related roles (OWNER, STAFF, MANAGER)
  if (user.roles) {
    const hasBusinessRole = user.roles.some(role => 
      ['OWNER', 'STAFF', 'MANAGER'].includes(role.name)
    );
    if (hasBusinessRole) return false;
  }
  
  return true;
}

/**
 * Check if user has business but no active subscription
 * Should show: Only subscription button
 */
export function hasBusinessNoSubscription(user: User | null, subscriptions?: BusinessSubscription[]): boolean {
  if (!user) return false;
  
  // User must have a business (either in businesses array or business roles)
  const hasBusiness = (user.businesses && user.businesses.length > 0) || 
                     (user.roles && user.roles.some(role => 
                       ['OWNER', 'STAFF', 'MANAGER'].includes(role.name) && role.businessId
                     ));
  
  if (!hasBusiness) return false;
  
  // User must not have active subscription
  return !hasActiveSubscription(subscriptions);
}

/**
 * Check if user has both business and active subscription
 * Should show: Only İşletmem button
 */
export function hasBusinessAndSubscription(user: User | null, subscriptions?: BusinessSubscription[]): boolean {
  if (!user) return false;
  
  // User must have a business (either in businesses array or business roles)
  const hasBusiness = (user.businesses && user.businesses.length > 0) || 
                     (user.roles && user.roles.some(role => 
                       ['OWNER', 'STAFF', 'MANAGER'].includes(role.name) && role.businessId
                     ));
  
  if (!hasBusiness) return false;
  
  // User must have active subscription
  return hasActiveSubscription(subscriptions);
}

/**
 * Check if user has business access using the businesses array from API
 */
export function hasBusinessAccessFromAPI(user: User | null, businesses: any[]): boolean {
  if (!user || !businesses) return false;
  
  // Check if user has businesses from API
  if (businesses.length > 0) return true;
  
  // Fallback to role-based check
  if (user.roles) {
    return user.roles.some(role => 
      ['OWNER', 'STAFF', 'MANAGER'].includes(role.name)
    );
  }
  
  return false;
}

/**
 * Check if user has business but no active subscription using API data
 */
export function hasBusinessNoSubscriptionFromAPI(user: User | null, businesses: any[], subscriptions?: BusinessSubscription[]): boolean {
  if (!user) return false;
  
  // User must have business access
  if (!hasBusinessAccessFromAPI(user, businesses)) return false;
  
  // User must not have active subscription
  return !hasActiveSubscription(subscriptions);
}

/**
 * Check if user has both business and active subscription using API data
 */
export function hasBusinessAndSubscriptionFromAPI(user: User | null, businesses: any[], subscriptions?: BusinessSubscription[]): boolean {
  if (!user) return false;
  
  // User must have business access
  if (!hasBusinessAccessFromAPI(user, businesses)) return false;
  
  // User must have active subscription
  return hasActiveSubscription(subscriptions);
}