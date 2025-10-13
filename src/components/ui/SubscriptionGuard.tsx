'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { businessService } from '../../lib/services/business';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  const checkSubscription = useCallback(async () => {
    try {
      const response = await businessService.getMyBusiness();

      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        const subscription = primaryBusiness.subscription;

        if (subscription && ['ACTIVE', 'TRIAL', 'PAST_DUE'].includes(subscription.status)) {
          setCanAccess(true);
        } else {
          router.replace('/dashboard/subscription');
          return;
        }
      } else {
        router.replace('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
      router.replace('/dashboard/subscription');
    } finally {
      setIsChecking(false);
    }
  }, [router]);

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

    checkSubscription();
  }, [user, isAuthenticated, pathname, checkSubscription]);

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
