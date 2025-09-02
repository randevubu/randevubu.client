'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { shouldRedirectForProfile, isProfileComplete } from '../../lib/utils/profileValidation';
import toast from 'react-hot-toast';

interface ProfileGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Global state to track if toast has been shown
let globalToastShown = false;

export default function ProfileGuard({ children, redirectTo = '/settings?tab=profile' }: ProfileGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (shouldRedirectForProfile(user, pathname)) {
      // Show toast notification only once globally
      if (!globalToastShown) {
        toast.error('Profil bilgilerinizi tamamlamanız gerekiyor! Ad ve soyad bilgilerinizi girin.');
        globalToastShown = true;
      }
      
      router.push(redirectTo);
      return;
    }

    // Reset global toast state when user has completed profile
    if (globalToastShown && isProfileComplete(user)) {
      globalToastShown = false;
    }

    setIsChecking(false);
  }, [user, isAuthenticated, isLoading, router, redirectTo, pathname]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If user should be redirected for incomplete profile, don't render anything
  if (shouldRedirectForProfile(user, pathname)) {
    return null;
  }

  return <>{children}</>;
}
