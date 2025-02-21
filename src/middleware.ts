import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired(function middleware(request: NextRequest) {
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*']
}; 