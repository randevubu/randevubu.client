'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { usePrimaryBusiness } from '../../lib/hooks/usePrimaryBusiness';
import { useSidebarNavigation } from '../../lib/hooks/useSidebarNavigation';
import { DashboardProvider } from '../../context/DashboardContext';
import DashboardGuard from '../../components/features/DashboardGuard';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { business, refetch: refetchBusiness } = usePrimaryBusiness();
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