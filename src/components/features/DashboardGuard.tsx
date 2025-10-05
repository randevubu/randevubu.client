'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { usePrimaryBusiness } from '../../lib/hooks/usePrimaryBusiness';
import { canViewBusinessStats } from '../../lib/utils/permissions';
import { shouldRedirectForProfile } from '../../lib/utils/profileValidation';
import { businessService } from '../../lib/services/business';

interface DashboardGuardProps {
  children: React.ReactNode;
}

// Global state to track if profile toast has been shown
let globalProfileToastShown = false;

export default function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { business, isLoading: businessLoading, isError: businessError } = usePrimaryBusiness();
  const [subscriptionChecking, setSubscriptionChecking] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState<{ to: string; reason: string } | null>(null);

  const isLoading = authLoading || businessLoading;

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    // Skip subscription check on subscription page
    if (pathname === '/dashboard/subscription') {
      setHasActiveSubscription(true);
      setSubscriptionChecking(false);
      return;
    }

    try {
      const response = await businessService.getMyBusiness();

      if (response.success && response.data?.businesses && response.data.businesses.length > 0) {
        const primaryBusiness = response.data.businesses[0];
        const subscription = primaryBusiness.subscription;

        if (subscription && ['ACTIVE', 'TRIAL', 'PAST_DUE'].includes(subscription.status)) {
          setHasActiveSubscription(true);
        } else {
          setShouldRedirect({ to: '/dashboard/subscription', reason: 'No active subscription' });
          return;
        }
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
      setShouldRedirect({ to: '/dashboard/subscription', reason: 'Subscription check failed' });
    } finally {
      setSubscriptionChecking(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    // Only check subscription after auth and business checks pass
    if (!isLoading && isAuthenticated && user && business && !businessError) {
      checkSubscription();
    }
  }, [isLoading, isAuthenticated, user, business, businessError, checkSubscription]);

  // Handle all redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (shouldRedirect) {
      console.log(`🔄 [GUARD] Redirecting to ${shouldRedirect.to}: ${shouldRedirect.reason}`);
      router.push(shouldRedirect.to);
    }
  }, [shouldRedirect, router]);

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      setShouldRedirect({ to: '/auth', reason: 'Not authenticated' });
    }
  }, [authLoading, isAuthenticated, user]);

  // Handle business error redirect
  useEffect(() => {
    if (businessError) {
      setShouldRedirect({ to: '/onboarding', reason: 'Business error' });
    }
  }, [businessError]);

  // Handle no business found redirect
  useEffect(() => {
    if (!isLoading && !business) {
      setShouldRedirect({ to: '/onboarding', reason: 'No business found' });
    }
  }, [isLoading, business]);

  // Handle profile completeness redirect
  useEffect(() => {
    if (user && shouldRedirectForProfile(user, pathname)) {
      if (!globalProfileToastShown) {
        toast.error('Lütfen ad ve soyadınızı girin', { duration: 3000 });
        globalProfileToastShown = true;
      }
      setShouldRedirect({ to: '/settings?tab=profile', reason: 'Profile incomplete' });
    }
  }, [user, pathname]);

  // Show loading screen if we're redirecting
  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">
            Yönlendiriliyor...
          </span>
        </div>
      </div>
    );
  }

  // 4. Handle permission check
  if (user && !canViewBusinessStats(user)) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="max-w-md w-full bg-[var(--theme-card)] rounded-lg shadow-lg p-8 transition-colors duration-300">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--theme-error)]/20 mb-4 transition-colors duration-300">
              <svg className="h-8 w-8 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--theme-foreground)] mb-2 transition-colors duration-300">Erişim Reddedildi</h1>
            <p className="text-[var(--theme-foregroundSecondary)] mb-6 transition-colors duration-300">Dashboard'a erişim yetkiniz bulunmuyor.</p>
            <button
              onClick={() => setShouldRedirect({ to: '/', reason: 'User requested home' })}
              className="inline-flex items-center px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg hover:bg-[var(--theme-primaryHover)] transition-colors duration-300"
            >
              ← Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile completeness check is now handled in useEffect above

  // Reset profile toast when profile is complete
  if (globalProfileToastShown && user && !shouldRedirectForProfile(user, pathname)) {
    globalProfileToastShown = false;
  }

  // Show loading screen during checks
  if (isLoading || subscriptionChecking) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--theme-foregroundSecondary)] font-medium transition-colors duration-300">
            Dashboard yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  // 6. Don't render if subscription check failed
  if (!hasActiveSubscription) {
    return null;
  }

  // If we reach here, user is authenticated, has business, has permissions, has complete profile, and has active subscription
  return <>{children}</>;
}
