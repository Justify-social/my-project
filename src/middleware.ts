import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    '/',  // Protect root path
    '/brand-lift/:path*',
    '/brand-lift-test/:path*',
    '/api/:path((?!auth).*)',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'  // Protect all routes except auth and Next.js internals
  ]
}; 