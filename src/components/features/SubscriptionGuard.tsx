'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../lib/services/business';
import { hasActiveSubscription } from '../../lib/utils/permissions';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/auth');
      return;
    }

    // Allow access to subscription page without checking subscription
    if (pathname === '/dashboard/subscription') {
      setCanAccess(true);
      setIsChecking(false);
      return;
    }

    // Always check via API (don't trust user context)
    checkSubscription();
  }, [user, isAuthenticated, router, pathname]);

  const checkSubscription = async () => {
    try {
      const response = await businessService.getMyBusiness('?includeSubscription=true');
      console.log('SubscriptionGuard - API response:', response);
      
      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        const subscription = primaryBusiness.subscription;
        
        console.log('SubscriptionGuard - Business:', primaryBusiness.name);
        console.log('SubscriptionGuard - Subscription:', subscription);
        
        if (subscription && ['ACTIVE', 'TRIAL', 'PAST_DUE'].includes(subscription.status)) {
          console.log('SubscriptionGuard - Active subscription found, allowing dashboard access');
          setCanAccess(true);
        } else {
          console.log('SubscriptionGuard - No active subscription, redirecting to subscription page');
          router.replace('/dashboard/subscription');
          return;
        }
      } else {
        console.log('SubscriptionGuard - No business found, redirecting to onboarding');
        router.replace('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
      // On error, redirect to subscription page
      router.replace('/dashboard/subscription');
      return;
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
          <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">Abonelik kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  // Only render children if user has active subscription
  if (!canAccess) {
    return null; // Will redirect, so don't render anything
  }

  return <>{children}</>;
}
