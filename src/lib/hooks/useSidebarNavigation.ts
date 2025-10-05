'use client';

import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_NAVIGATION_ITEMS, NavigationItem } from '../constants/navigation';
import { canViewNavigationItem } from '../utils/permissions';

export interface UseSidebarNavigationResult {
  navigationItems: NavigationItem[];
  filteredItems: NavigationItem[];
}

/**
 * Custom hook to manage sidebar navigation items with permission filtering
 * 
 * Features:
 * - Returns all sidebar navigation items
 * - Filters items based on user permissions
 * - Memoized for performance
 * - Type-safe navigation structure
 */
export function useSidebarNavigation(): UseSidebarNavigationResult {
  const { user } = useAuth();

  const filteredItems = useMemo(() => {
    if (!user) return [];
    
    return SIDEBAR_NAVIGATION_ITEMS.filter((item) => 
      canViewNavigationItem(user, item.id)
    );
  }, [user]);

  return {
    navigationItems: SIDEBAR_NAVIGATION_ITEMS,
    filteredItems
  };
}
