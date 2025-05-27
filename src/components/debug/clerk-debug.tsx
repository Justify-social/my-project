'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DebugInfo {
  clerkLoaded: boolean;
  authState: any;
  userState: any;
  networkConnectivity: boolean;
  clerkScripts: string[];
  errors: string[];
  cspErrors: string[];
}

export function ClerkDebugPanel() {
  const { isLoaded: authLoaded, userId, sessionId } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    clerkLoaded: false,
    authState: null,
    userState: null,
    networkConnectivity: false,
    clerkScripts: [],
    errors: [],
    cspErrors: [],
  });

  useEffect(() => {
    const checkClerkStatus = async () => {
      const errors: string[] = [];
      const clerkScripts: string[] = [];
      const cspErrors: string[] = [];

      // Check for Clerk scripts in DOM
      const scripts = Array.from(document.querySelectorAll('script')).filter(
        script => script.src && script.src.includes('clerk')
      );
      scripts.forEach(script => clerkScripts.push(script.src));

      // Check for CSP violations
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Content Security Policy') || message.includes('CSP')) {
          cspErrors.push(message);
        }
        originalConsoleError.apply(console, args);
      };

      // Test network connectivity to Clerk
      let networkConnectivity = false;
      try {
        const response = await fetch('https://api.clerk.com/v1/health', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        networkConnectivity = true;
      } catch (error) {
        errors.push(`Network test failed: ${error}`);
        networkConnectivity = false;
      }

      // Check for global Clerk object
      const hasClerkGlobal = typeof window !== 'undefined' && 'Clerk' in window;
      if (!hasClerkGlobal) {
        errors.push('Clerk global object not found on window');
      }

      setDebugInfo({
        clerkLoaded: authLoaded && userLoaded,
        authState: {
          isLoaded: authLoaded,
          userId,
          sessionId,
          hasSession: !!sessionId,
        },
        userState: {
          isLoaded: userLoaded,
          hasUser: !!user,
          userEmail: user?.primaryEmailAddress?.emailAddress,
        },
        networkConnectivity,
        clerkScripts,
        errors,
        cspErrors,
      });
    };

    checkClerkStatus();
  }, [authLoaded, userLoaded, userId, sessionId, user]);

  const getStatusColor = (condition: boolean) => (condition ? 'default' : 'destructive');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Clerk Authentication Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Badge variant={getStatusColor(!!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)}>
              Publishable Key: {!!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing'}
            </Badge>
          </div>
          <div>
            <Badge variant={getStatusColor(debugInfo.clerkLoaded)}>
              Clerk Loaded: {debugInfo.clerkLoaded ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        {/* Auth State */}
        <Alert>
          <AlertTitle>Authentication State</AlertTitle>
          <AlertDescription>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo.authState, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>

        {/* User State */}
        <Alert>
          <AlertTitle>User State</AlertTitle>
          <AlertDescription>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo.userState, null, 2)}
            </pre>
          </AlertDescription>
        </Alert>

        {/* Network Status */}
        <div>
          <Badge variant={getStatusColor(debugInfo.networkConnectivity)}>
            Clerk API Connectivity: {debugInfo.networkConnectivity ? 'Connected' : 'Failed'}
          </Badge>
        </div>

        {/* Clerk Scripts */}
        {debugInfo.clerkScripts.length > 0 && (
          <Alert>
            <AlertTitle>Loaded Clerk Scripts</AlertTitle>
            <AlertDescription>
              <ul className="text-xs">
                {debugInfo.clerkScripts.map((script, index) => (
                  <li key={index} className="truncate">
                    {script}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Errors */}
        {debugInfo.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Detected Issues</AlertTitle>
            <AlertDescription>
              <ul className="text-xs space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* CSP Errors */}
        {debugInfo.cspErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Content Security Policy Issues</AlertTitle>
            <AlertDescription>
              <ul className="text-xs space-y-1">
                {debugInfo.cspErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Refresh Page
          </Button>
          <Button
            onClick={() => {
              console.log('🔍 Clerk Debug Info:', debugInfo);
              console.log('🔍 Window Clerk:', (window as any).Clerk);
            }}
            variant="outline"
            size="sm"
          >
            Log to Console
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
