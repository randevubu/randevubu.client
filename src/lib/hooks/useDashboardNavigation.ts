'use client';

import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DASHBOARD_NAVIGATION_ITEMS, NavigationItem } from '../constants/navigation';
import { canViewNavigationItem } from '../utils/permissions';

export interface UseDashboardNavigationResult {
  navigationItems: NavigationItem[];
  filteredItems: NavigationItem[];
}

/**
 * Custom hook to manage dashboard navigation items with permission filtering
 * 
 * Features:
 * - Returns all navigation items
 * - Filters items based on user permissions
 * - Memoized for performance
 * - Type-safe navigation structure
 */
export function useDashboardNavigation(): UseDashboardNavigationResult {
  const { user } = useAuth();

  const filteredItems = useMemo(() => {
    if (!user) return [];
    
    return DASHBOARD_NAVIGATION_ITEMS.filter((item) => 
      canViewNavigationItem(user, item.id)
    );
  }, [user]);

  return {
    navigationItems: DASHBOARD_NAVIGATION_ITEMS,
    filteredItems
  };
}
