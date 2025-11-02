'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../lib/services/business';
import { SubscriptionStatus } from '../../types/enums';

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
      // Use replace to prevent back button from returning to protected page
      router.replace('/auth');
      return;
    }

    // Always check with fresh API data (don't trust user context)
    // This ensures we get the most up-to-date business status
    checkBusiness();
  }, [user, isAuthenticated, router]);

  const checkBusiness = async () => {
    try {
      const response = await businessService.getMyBusiness(true);
      console.log('BusinessGuard - API response:', response);
      
      if (response.success && response.data?.hasBusinesses) {
        const businesses = response.data.businesses || [];
        
        // Extract subscriptions from businesses (subscriptions are embedded in business objects)
        const subscriptions = businesses
          .filter(business => business.subscription)
          .map(business => business.subscription!);
        
        // Check if user has any active subscription
        const hasActiveSubscription = subscriptions.some(sub => 
          sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRIAL
        );
        
        if (hasActiveSubscription) {
          console.log('BusinessGuard - Business with active subscription found, redirecting to dashboard');
          router.replace('/dashboard');
          return;
        } else {
          console.log('BusinessGuard - Business found but no active subscription, allowing onboarding access');
          setCanAccess(true);
          return;
        }
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
