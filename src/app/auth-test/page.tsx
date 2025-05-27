'use client';

import { useState } from 'react';
import { SignIn, SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/nextjs';
import { ClerkDebugPanel } from '@/components/debug/clerk-debug';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function AuthTestPage() {
  const [showDebug, setShowDebug] = useState(false);
  const { isLoaded: authLoaded, userId } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clerk Authentication Test Page</h1>
          <p className="text-gray-600">
            Simple environment to test Clerk authentication without layout interference
          </p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Auth Loaded:</strong> {authLoaded ? '✅ Yes' : '⏳ Loading...'}
              </div>
              <div>
                <strong>User Loaded:</strong> {userLoaded ? '✅ Yes' : '⏳ Loading...'}
              </div>
              <div>
                <strong>User ID:</strong> {userId ? '✅ Set' : '❌ None'}
              </div>
              <div>
                <strong>User Email:</strong> {user?.primaryEmailAddress?.emailAddress || '❌ None'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Node Env:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>Vercel Env:</strong> {process.env.VERCEL_ENV || 'Not set'}
              </div>
              <div>
                <strong>Clerk Key:</strong>{' '}
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Configured' : '❌ Missing'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication States */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Signed Out State */}
          <Card>
            <CardHeader>
              <CardTitle>Not Signed In</CardTitle>
            </CardHeader>
            <CardContent>
              <SignedOut>
                <Alert className="mb-4">
                  <AlertTitle>You are not signed in</AlertTitle>
                  <AlertDescription>Please sign in using the form below.</AlertDescription>
                </Alert>

                <div className="max-w-sm mx-auto">
                  <SignIn
                    routing="hash"
                    afterSignInUrl="/auth-test"
                    signUpUrl="#"
                    appearance={{
                      elements: {
                        card: 'shadow-none border-0 p-0',
                        footer: 'hidden',
                      },
                    }}
                  />
                </div>
              </SignedOut>

              <SignedIn>
                <Alert>
                  <AlertTitle>You are signed in!</AlertTitle>
                  <AlertDescription>
                    Welcome back! The authentication is working correctly.
                  </AlertDescription>
                </Alert>
              </SignedIn>
            </CardContent>
          </Card>

          {/* Signed In State */}
          <Card>
            <CardHeader>
              <CardTitle>Signed In</CardTitle>
            </CardHeader>
            <CardContent>
              <SignedIn>
                <div className="space-y-4">
                  <Alert>
                    <AlertTitle>✅ Authentication Successful</AlertTitle>
                    <AlertDescription>
                      You are successfully authenticated with Clerk.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Welcome, {user?.firstName || 'User'}!</p>
                      <p className="text-sm text-gray-600">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                    <UserButton afterSignOutUrl="/auth-test" />
                  </div>

                  <Button onClick={() => (window.location.href = '/dashboard')} className="w-full">
                    Go to Dashboard
                  </Button>
                </div>
              </SignedIn>

              <SignedOut>
                <Alert variant="destructive">
                  <AlertTitle>Not Signed In</AlertTitle>
                  <AlertDescription>Please sign in using the form on the left.</AlertDescription>
                </Alert>
              </SignedOut>
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        <div className="space-y-4">
          <div className="text-center">
            <Button onClick={() => setShowDebug(!showDebug)} variant="outline" className="mx-auto">
              {showDebug ? 'Hide' : 'Show'} Debug Information
            </Button>
          </div>

          {showDebug && <ClerkDebugPanel />}
        </div>

        {/* Navigation */}
        <div className="text-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/sign-in">Go to Sign-In Page</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
