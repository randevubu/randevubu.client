'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface CustomerGuardProps {
  children: React.ReactNode;
}

export default function CustomerGuard({ children }: CustomerGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasInitialized } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to initialize
    if (!hasInitialized || isLoading) return;

    // If not authenticated, redirect to auth
    if (!isAuthenticated || !user) {
      router.replace('/auth');
      return;
    }

    // Authentication check passed
    setIsChecking(false);
  }, [user, isAuthenticated, isLoading, hasInitialized, router]);

  // Show loading while checking authentication
  if (!hasInitialized || isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">
            Kimlik doğrulanıyor...
          </span>
        </div>
      </div>
    );
  }

  // Only render children if user is authenticated
  return <>{children}</>;
}
