'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  redirectTo = '/auth',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, hasInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isReady = hasInitialized && !isLoading;
  const authDestination = useMemo(() => {
    const localePrefixMatch = pathname?.match(/^\/(en|tr)(?=\/|$)/);
    const localePrefix = localePrefixMatch ? localePrefixMatch[0] : '';
    const normalizedRedirect =
      redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
    return `${localePrefix}${normalizedRedirect}`;
  }, [pathname, redirectTo]);

  useEffect(() => {
    if (!isReady || isAuthenticated) {
      return;
    }

    const redirectParam =
      pathname && pathname !== '/'
        ? `?redirect=${encodeURIComponent(pathname)}`
        : '';

    router.replace(`${authDestination}${redirectParam}`);
  }, [authDestination, isAuthenticated, isReady, pathname, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)] transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--theme-foregroundSecondary)] font-medium">
            Yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

