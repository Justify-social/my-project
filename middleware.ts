// Remove or replace this file if it contains Clerk middleware
// If using Auth0, you might not need middleware at all
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

// Public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/callback',
  '/pricing',
  '/about',
  '/',
  '/favicon.ico',
];

// Static assets and internal Next.js routes that should be public
const staticRoutes = [
  '/_next',
  '/images',
  '/api/health',
];

export default withMiddlewareAuthRequired({
  returnTo: '/api/auth/login',
});

export const config = {
  matcher: [
    // Match all routes
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    
    // Exclude public routes using negative lookahead
    ...publicRoutes.map(route => `(?!${route})`),
    
    // Exclude static routes
    ...staticRoutes.map(route => `(?!${route})`),
  ],
}; 