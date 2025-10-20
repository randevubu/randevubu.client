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

export default function ProfileGuard({ children, redirectTo = '/settings?tab=profile' }: ProfileGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [profileToastShown, setProfileToastShown] = useState(() => {
    // Use sessionStorage to persist across component remounts but reset on logout
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('profileGuardToastShown') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Use replace to prevent back button from returning to protected page
      router.replace('/auth');
      return;
    }

    if (shouldRedirectForProfile(user, pathname)) {
      // Show toast notification only once
      if (!profileToastShown) {
        toast.error('Lütfen ad ve soyadınızı girin', { duration: 3000 });
        setProfileToastShown(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('profileGuardToastShown', 'true');
        }
      }

      // Use replace to prevent back button from returning to protected page
      router.replace(redirectTo);
      return;
    }

    setIsChecking(false);
  }, [user, isAuthenticated, isLoading, router, redirectTo, pathname, profileToastShown]);

  // Reset toast flag when profile is complete
  useEffect(() => {
    if (profileToastShown && isProfileComplete(user)) {
      setProfileToastShown(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('profileGuardToastShown');
      }
    }
  }, [profileToastShown, user]);

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
