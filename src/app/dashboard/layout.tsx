'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../lib/hooks/useDashboardData';
import { useSidebarNavigation } from '../../lib/hooks/useSidebarNavigation';
import { DashboardProvider, useDashboard } from '../../context/DashboardContext';
import DashboardGuard from '../../components/ui/DashboardGuard';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';

/**
 * Optimized Dashboard Layout
 * 
 * This layout now uses a centralized data fetching approach:
 * - Single API call (or batched parallel calls) for all dashboard data
 * - Data is fetched once and shared via context to all child components
 * - Child components should use context hooks instead of making separate API calls
 * - Dramatically reduces the number of network requests
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  
  // Use optimized batch data hook - fetches business data once and shares it
  const { 
    business, 
    upcomingAppointments, 
    isLoading: isLoadingDashboardData,
    refetch: refetchBusiness 
  } = useDashboardData({
    includeAppointments: false, // Let individual pages fetch their own data
    includeServices: false,
    includeCustomers: false
  });
  
  const { filteredItems: navigationItems } = useSidebarNavigation();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  const handleSetSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Don't render provider if data is not ready (DashboardGuard will handle loading state)
  if (!user || !business) {
    return (
      <DashboardGuard>
        <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">
              Yükleniyor...
            </span>
          </div>
        </div>
      </DashboardGuard>
    );
  }

  return (
    <DashboardGuard>
      <DashboardProvider
        user={user}
        business={business}
        navigationItems={navigationItems}
        pathname={pathname}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={handleSetSidebarCollapsed}
        logout={handleLogout}
        refetchBusiness={refetchBusiness}
        upcomingAppointments={upcomingAppointments}
        isLoadingDashboardData={isLoadingDashboardData}
      >
        <DashboardContent>
          {children}
        </DashboardContent>
      </DashboardProvider>
    </DashboardGuard>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useDashboard();

  return (
    <div className="min-h-screen bg-[var(--theme-background)] flex overflow-x-hidden transition-colors duration-300">
      <DashboardSidebar />
      <div className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <DashboardHeader />
        <main className="overflow-x-hidden w-full">
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}