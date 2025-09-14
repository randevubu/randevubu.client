import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only add locale prefix when needed (non-default locales)
  defaultLocaleRedirect: false // Don't redirect default locale to have prefix
});

export function middleware(request: NextRequest) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(request);

  // Get the pathname of the request (e.g. /api/auth/callback, /profile, etc.)
  const path = request.nextUrl.pathname;

  // Skip auth middleware for API routes and static files
  if (path.startsWith('/api') || path.startsWith('/_next')) {
    return intlResponse;
  }

  // Remove locale prefix from path for auth checking
  const pathWithoutLocale = path.replace(/^\/(en|tr)/, '') || '/';

  // Get the auth cookie that indicates user session
  const hasAuth = request.cookies.get('hasAuth')?.value === '1';

  // Create response based on intl middleware or create new one
  const response = intlResponse || NextResponse.next();

  // Pass auth state to client-side for hydration consistency
  // This prevents layout shift and enables SSR auth state
  if (hasAuth) {
    response.headers.set('x-auth-state', 'authenticated');
  } else {
    response.headers.set('x-auth-state', 'unauthenticated');
  }

  // Protect authenticated routes
  const protectedPaths = ['/profile', '/settings', '/dashboard'];
  if (protectedPaths.some(protectedPath => pathWithoutLocale.startsWith(protectedPath)) && !hasAuth) {
    const locale = path.startsWith('/en') ? '/en' : '';
    return NextResponse.redirect(new URL(`${locale}/auth`, request.url));
  }

  // Redirect authenticated users away from auth pages
  if (pathWithoutLocale.startsWith('/auth') && hasAuth) {
    const locale = path.startsWith('/en') ? '/en' : '';
    return NextResponse.redirect(new URL(`${locale}/`, request.url));
  }

  // Note: Subscription checking is handled by SubscriptionGuard component
  // This provides better UX by checking subscriptions before rendering dashboard
  // and redirecting users without subscriptions to the subscription page
  //
  // Business checking is handled by BusinessGuard component for onboarding pages
  // This prevents users with existing businesses from accessing onboarding

  return response;
}

export const config = {
  // Match all paths except static files and api routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
