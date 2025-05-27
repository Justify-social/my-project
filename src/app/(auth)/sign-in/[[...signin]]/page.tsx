'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Removed Link import as it's handled by Clerk component
// import Link from 'next/link';

function SignInComponent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect_url');

  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = !!clerkPublishableKey && clerkPublishableKey.length > 0;

  // Always log configuration status for debugging production issues
  console.log('🔍 [SIGN-IN] Environment check:', {
    hasClerkKey: !!clerkPublishableKey,
    keyPrefix: clerkPublishableKey?.substring(0, 15) + '...',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    redirectUrl,
    timestamp: new Date().toISOString(),
  });

  // Show error state if Clerk is not configured
  if (!isClerkConfigured) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Authentication Service Unavailable</AlertTitle>
          <AlertDescription>
            The authentication service is not properly configured. Please contact support if this
            persists.
          </AlertDescription>
        </Alert>

        {process.env.NODE_ENV === 'development' && (
          <Alert>
            <AlertTitle>Development Debug Info</AlertTitle>
            <AlertDescription>
              <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> is missing or invalid.
              <br />
              Current value: {clerkPublishableKey || 'undefined'}
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={() => window.location.reload()} className="w-full" variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl={redirectUrl || '/dashboard'}
        fallbackRedirectUrl="/dashboard"
        appearance={{
          baseTheme: undefined,
          elements: {
            // Make card background transparent or remove padding/shadow if the right column provides it
            // Let's keep the card style for now, as it provides structure within the right column.
            card: 'bg-white shadow-md border border-divider p-6 rounded-lg max-w-md w-full',
            formButtonPrimary:
              'bg-interactive hover:bg-interactive/90 text-white text-sm font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
            formFieldInput:
              'block w-full rounded-md border border-divider shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 px-3',
            formFieldLabel: 'text-sm font-medium text-secondary',
            footerActionLink: 'text-interactive hover:underline text-sm',
            headerTitle: 'text-primary text-xl font-semibold',
            headerSubtitle: 'text-secondary text-sm',
            identityPreviewEditButton: 'text-accent hover:text-accent/80',
            dividerLine: 'bg-divider',
            socialButtonsBlockButton: 'border-divider hover:bg-gray-50',
          },
        }}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <SignInComponent />
    </Suspense>
  );
}
