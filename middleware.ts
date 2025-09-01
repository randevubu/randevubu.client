import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /api/auth/callback, /profile, etc.)
  const path = request.nextUrl.pathname;

  // Get the auth cookie that indicates user session
  const hasAuth = request.cookies.get('hasAuth')?.value === '1';

  // Create response with auth header for client-side hydration
  const response = NextResponse.next();

  // Pass auth state to client-side for hydration consistency
  // This prevents layout shift and enables SSR auth state
  if (hasAuth) {
    response.headers.set('x-auth-state', 'authenticated');
  } else {
    response.headers.set('x-auth-state', 'unauthenticated');
  }

  // Protect authenticated routes
  const protectedPaths = ['/profile', '/settings', '/dashboard'];
  if (protectedPaths.some(protectedPath => path.startsWith(protectedPath)) && !hasAuth) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (path.startsWith('/auth') && hasAuth) {
    return NextResponse.redirect(new URL('/', request.url));
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
