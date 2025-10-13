'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User } from '../types/auth';
import { Business } from '../types/business';
import { Appointment } from '../types';
import { NavigationItem } from '../lib/constants/navigation';

interface DashboardContextType {
  user: User;
  business: Business;
  navigationItems: NavigationItem[];
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
  // Add refetch capabilities for cache invalidation
  refetchBusiness: () => void;
  // Add cached dashboard data to prevent redundant API calls
  upcomingAppointments: Appointment[];
  isLoadingDashboardData: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
  user: User;
  business: Business;
  navigationItems: NavigationItem[];
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
  refetchBusiness: () => void;
  upcomingAppointments?: Appointment[];
  isLoadingDashboardData?: boolean;
}

export function DashboardProvider({
  children,
  user,
  business,
  navigationItems,
  pathname,
  sidebarOpen,
  setSidebarOpen,
  logout,
  refetchBusiness,
  upcomingAppointments = [],
  isLoadingDashboardData = false,
}: DashboardProviderProps) {
  return (
    <DashboardContext.Provider
      value={{
        user,
        business,
        navigationItems,
        pathname,
        sidebarOpen,
        setSidebarOpen,
        logout,
        refetchBusiness,
        upcomingAppointments,
        isLoadingDashboardData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Convenience hooks for specific data
export function useDashboardBusiness() {
  const { business } = useDashboard();
  return business;
}

export function useDashboardUser() {
  const { user } = useDashboard();
  return user;
}

export function useDashboardNavigation() {
  const { navigationItems } = useDashboard();
  return navigationItems;
}

// Hook for cache management
export function useDashboardRefetch() {
  const { refetchBusiness } = useDashboard();
  return refetchBusiness;
}

// Hook to get cached dashboard data without making new API calls
export function useDashboardUpcomingAppointments() {
  const { upcomingAppointments, isLoadingDashboardData } = useDashboard();
  return { upcomingAppointments, isLoading: isLoadingDashboardData };
}
