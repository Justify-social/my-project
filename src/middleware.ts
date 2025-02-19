import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    // Add routes that should be protected
    '/brand-lift/:path*',
    '/brand-lift-test/:path*',
    '/api/:path((?!auth).*)'  // Match API routes except /api/auth/*
  ]
}; 