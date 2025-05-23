'use client';

import React from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClerkConfig, validateClerkConfig } from '@/lib/auth/clerk-config';
import Link from 'next/link';

export default function AuthTestPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded, userId, orgId } = useAuth();
  const config = getClerkConfig();
  const validation = validateClerkConfig();

  if (!userLoaded || !authLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading authentication state...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Authentication Test</h1>
        <p className="text-muted-foreground">
          This page helps verify that Clerk authentication is working correctly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Authentication Status
              <Badge variant={user ? 'default' : 'destructive'}>
                {user ? 'Authenticated' : 'Not Authenticated'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-2">
                <div>
                  <strong>User ID:</strong> {userId}
                </div>
                <div>
                  <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || 'N/A'}
                </div>
                <div>
                  <strong>Name:</strong> {user.fullName || user.firstName || 'N/A'}
                </div>
                <div>
                  <strong>Organization ID:</strong> {orgId || 'None'}
                </div>
                <div>
                  <strong>Created:</strong>{' '}
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">You are not signed in.</p>
                <Button asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Configuration Status
              <Badge variant={validation.isValid ? 'default' : 'destructive'}>
                {validation.isValid ? 'Valid' : 'Issues Detected'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div>
                <strong>Environment:</strong> {config.environment}
              </div>
              <div>
                <strong>Key Type:</strong>{' '}
                {config.publishableKey?.startsWith('pk_test_')
                  ? 'Development'
                  : config.publishableKey?.startsWith('pk_live_')
                    ? 'Production'
                    : 'Unknown'}
              </div>
              <div>
                <strong>Key Prefix:</strong>{' '}
                {config.publishableKey?.substring(0, 15) + '...' || 'Missing'}
              </div>
              <div>
                <strong>Sign In URL:</strong> {config.signInUrl}
              </div>
              <div>
                <strong>After Sign In:</strong> {config.afterSignInUrl}
              </div>
            </div>

            {validation.errors.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-semibold text-destructive mb-2">Configuration Issues:</h4>
                <ul className="text-sm text-destructive space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Test navigation to protected and public routes:
            </p>
            <div className="grid gap-2">
              <Button variant="outline" asChild className="justify-start">
                <Link href="/dashboard">Dashboard (Protected)</Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href="/campaigns">Campaigns (Protected)</Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href="/brand-lift/survey-design/test">Brand Lift (Protected)</Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href="/settings">Settings (Protected)</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
              </div>
              <div>
                <strong>VERCEL_ENV:</strong> {process.env.VERCEL_ENV || 'Not set'}
              </div>
              <div>
                <strong>Domain:</strong>{' '}
                {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}
              </div>
              <div>
                <strong>Configured:</strong> {config.isConfigured ? 'Yes' : 'No'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
