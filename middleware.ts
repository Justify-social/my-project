// Remove or replace this file if it contains Clerk middleware
// If using Auth0, you might not need middleware at all
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired({
  returnTo: '/api/auth/login',
});

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/campaigns/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    
    // Exclude public pages and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|auth|pricing).*)',
  ],
}; 