'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { AuthSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ClerkDebugPanel } from '@/components/debug/clerk-debug';

// Removed Link import as it's handled by Clerk component
// import Link from 'next/link';

function SignInComponent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get('redirect_url');
  const [showDebug, setShowDebug] = useState(false);
  const [clerkRenderTimeout, setClerkRenderTimeout] = useState(false);

  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = !!clerkPublishableKey && clerkPublishableKey.length > 0;

  // Log configuration status only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [SIGN-IN] Environment check:', {
      hasClerkKey: !!clerkPublishableKey,
      keyPrefix: clerkPublishableKey?.substring(0, 15) + '...',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      redirectUrl,
      timestamp: new Date().toISOString(),
    });
  }

  // Set a timeout to detect if Clerk form fails to render
  useEffect(() => {
    if (isClerkConfigured) {
      const timer = setTimeout(() => {
        // Check if Clerk form has rendered
        const clerkForm = document.querySelector('.cl-rootBox, .cl-card, [data-clerk-id]');
        if (!clerkForm) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('🚨 [SIGN-IN] Clerk form failed to render within 5 seconds');
          }
          setClerkRenderTimeout(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isClerkConfigured]);

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

  // Show debug info only in development or if user explicitly requests it
  if ((showDebug || clerkRenderTimeout) && process.env.NODE_ENV === 'development') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Authentication Loading Issue Detected</AlertTitle>
          <AlertDescription>
            The sign-in form is taking longer than expected to load. This could be due to network
            issues, content security policy restrictions, or client-side loading problems.
          </AlertDescription>
        </Alert>

        <ClerkDebugPanel />

        <div className="flex gap-2 justify-center">
          <Button onClick={() => setShowDebug(false)} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  // In production, if there's a timeout, just show a simple error message
  if (clerkRenderTimeout && process.env.NODE_ENV === 'production') {
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Loading Issue</AlertTitle>
          <AlertDescription>
            The sign-in form is taking longer than expected to load. Please try refreshing the page.
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} className="w-full">
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
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

      {/* Debug trigger button - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setShowDebug(true)}
            variant="link"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Having trouble signing in? Show diagnostic info
          </Button>
        </div>
      )}
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
