'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../lib/utils/permissions';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If not authenticated, redirect to auth
    if (!isAuthenticated || !user) {
      router.replace('/auth');
      return;
    }

    // Check admin permission
    if (!isAdmin(user)) {
      // Not an admin, redirect to dashboard
      router.replace('/dashboard');
      return;
    }

    // Admin access granted
    setIsChecking(false);
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading while checking
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">
            Yetki kontrolü yapılıyor...
          </span>
        </div>
      </div>
    );
  }

  // Only render children if user is admin
  return <>{children}</>;
}