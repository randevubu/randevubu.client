'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../lib/hooks/useDashboardData';
import { useSidebarNavigation } from '../../lib/hooks/useSidebarNavigation';
import { DashboardProvider } from '../../context/DashboardContext';
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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <DashboardGuard>
      {/* Guard ensures user and business exist, but we still handle the type properly */}
      {user && business ? (
        <DashboardProvider
          user={user}
          business={business}
          navigationItems={navigationItems}
          pathname={pathname}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          logout={handleLogout}
          refetchBusiness={refetchBusiness}
          upcomingAppointments={upcomingAppointments}
          isLoadingDashboardData={isLoadingDashboardData}
        >
          <DashboardContent>
            {children}
          </DashboardContent>
        </DashboardProvider>
      ) : null}
    </DashboardGuard>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--theme-background)] flex transition-colors duration-300">
      <DashboardSidebar />
      <div className="flex-1 lg:ml-64">
        <DashboardHeader />
        <main className="">
          {children}
        </main>
      </div>
    </div>
  );
}