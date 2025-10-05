import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Only add locale prefix when needed (non-default locales)
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

  // Get auth cookies that indicate user session
  const hasAuthCookie = request.cookies.get('hasAuth');
  const refreshTokenCookie = request.cookies.get('refreshToken');
  
  // Check for authentication indicators using industry best practices:
  // 1. Primary: hasAuth cookie (set by backend on login)
  // 2. Fallback: refreshToken cookie (indicates valid session)
  const hasAuth = (hasAuthCookie?.value === '1' || 
                   hasAuthCookie?.value === 'true') && 
                  !!refreshTokenCookie;

  // Debug logging for troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [MIDDLEWARE] Auth check:', {
      path: pathWithoutLocale,
      hasAuthCookie: hasAuthCookie?.value,
      hasRefreshToken: !!refreshTokenCookie,
      hasAuth,
      willRedirectFromAuth: pathWithoutLocale.startsWith('/auth') && hasAuth,
      allCookies: request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`)
    });
  }

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
    const redirectUrl = `${locale}/`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [MIDDLEWARE] Redirecting authenticated user from auth page:', {
        from: pathWithoutLocale,
        to: redirectUrl,
        hasAuth,
        hasAuthCookie: hasAuthCookie?.value,
        hasRefreshToken: !!refreshTokenCookie
      });
    }
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
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
