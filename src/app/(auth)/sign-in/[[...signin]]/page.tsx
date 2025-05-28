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
  const [isClient, setIsClient] = useState(false);

  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = !!clerkPublishableKey && clerkPublishableKey.length > 0;

  // Ensure client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Log configuration status only in development
  if (process.env.NODE_ENV === 'development' && isClient) {
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
    if (isClerkConfigured && isClient) {
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
  }, [isClerkConfigured, isClient]);

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return <AuthSkeleton />;
  }

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
    <div className="w-full">
      {/* Unified Auth Block - Header and Form Centered Together */}
      <div className="text-center space-y-3 sm:space-y-4 lg:space-y-3 xl:space-y-5">
        {/* Welcome Header */}
        <div>
          <h2 className="font-sora text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold text-slate-900 mb-1 sm:mb-2 lg:mb-1 xl:mb-3 tracking-tight leading-tight">
            Welcome back
          </h2>
          <p className="text-slate-600 font-medium text-xs sm:text-sm lg:text-sm xl:text-base leading-relaxed">
            Access your measurement dashboard
          </p>
        </div>

        {/* Clerk Form - Responsive and Dynamic Styling */}
        <div>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl={redirectUrl || '/dashboard'}
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                card: 'bg-white border border-slate-200/60 rounded-xl shadow-sm p-4 sm:p-5 lg:p-4 xl:p-5 w-full',
                rootBox: 'w-full',
                formContainer: 'w-full space-y-2 sm:space-y-3 lg:space-y-2 xl:space-y-3',
                formFieldInput:
                  'w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] focus:outline-none transition-colors text-left leading-tight',
                formFieldLabel:
                  'text-left text-sm font-medium text-slate-700 mb-1 block w-full leading-tight',
                formButtonPrimary:
                  'w-full bg-[#333333] hover:bg-[#4A5568] text-white font-medium py-2 px-4 rounded-md transition-colors text-sm mt-2 leading-tight',
                formHeaderTitle: 'hidden',
                formHeaderSubtitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtons: 'w-full space-y-1.5 mb-2 sm:mb-3 lg:mb-2 xl:mb-3',
                socialButtonsBlockButton:
                  'w-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-md transition-colors text-sm flex items-center justify-center gap-2 leading-tight',
                dividerLine: 'bg-slate-200 my-2 sm:my-3 lg:my-2 xl:my-3',
                dividerText: 'text-slate-500 text-sm bg-white px-3 leading-tight',
                footerAction:
                  'text-center w-full mt-2 sm:mt-3 lg:mt-2 xl:mt-3 pt-2 border-t border-slate-100',
                footerActionLink:
                  'text-[#00BFFF] hover:text-[#3182CE] font-medium text-sm leading-tight',
                formFieldErrorText: 'text-red-500 text-xs mt-0.5 text-left leading-tight',
                identityPreviewEditButton: 'text-[#00BFFF] hover:text-[#3182CE] leading-tight',
              },
            }}
          />
        </div>
      </div>
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
