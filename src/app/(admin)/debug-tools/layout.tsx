'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import { usePathname } from 'next/navigation'; // Unused import

// Simply pass children through without wrapping in additional containers
// This will allow debug tools to inherit the root layout with navigation
export default function DebugToolsLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, sessionClaims } = useAuth();
  const router = useRouter();

  const isSuperAdmin = sessionClaims?.['metadata.role'] === 'super_admin';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const canAccess = isSuperAdmin || isDevelopment;

  // Redirect unauthorized users
  useEffect(() => {
    if (isLoaded && !canAccess) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Access denied to debug tools - Super Admin role required');
      }
      router.push('/dashboard');
    }
  }, [isLoaded, canAccess, router]);

  // Show loading while auth is being checked
  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6 text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Verifying access permissions...</p>
      </div>
    );
  }

  // Show access denied if not authorized
  if (!canAccess) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Debug tools are restricted to Super Admin users only.
          </p>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return children;
}
