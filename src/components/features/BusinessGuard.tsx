'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../lib/services/business';

interface BusinessGuardProps {
  children: React.ReactNode;
}

export default function BusinessGuard({ children }: BusinessGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/auth');
      return;
    }

    // Immediate check using user context data if available
    if (user.businesses && user.businesses.length > 0) {
      // User already has a business - redirect to subscription
      router.replace('/subscription');
      return;
    }

    // If no immediate data, check with API
    checkBusiness();
  }, [user, isAuthenticated, router]);

  const checkBusiness = async () => {
    try {
      const response = await businessService.getMyBusiness('?includeSubscription=true');
      console.log('BusinessGuard - API response:', response);
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        console.log('BusinessGuard - Business found, redirecting to subscription');
        router.replace('/subscription');
        return;
      } else {
        console.log('BusinessGuard - No business found, allowing onboarding access');
        setCanAccess(true);
      }
    } catch (error) {
      console.error('Business check failed:', error);
      // On error, allow access to onboarding (safer default)
      setCanAccess(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Don't render anything until we've completed the check
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">İşletme durumu kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  // Only render children if user can access onboarding (no business)
  if (!canAccess) {
    return null; // Will redirect, so don't render anything
  }

  return <>{children}</>;
}
