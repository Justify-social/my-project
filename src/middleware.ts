import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/brand-lift/:path*',
    '/brand-lift-test/:path*',
    '/api/:path((?!auth).*)',
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'  // Exclude SVG files
  ]
}; 