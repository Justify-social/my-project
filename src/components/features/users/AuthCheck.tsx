'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuthState } from '@/lib/auth/authCoordinator';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

export default function AuthCheck({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push('/api/auth/login');
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  // Important: Always render children to prevent interrupting component lifecycle
  if (isLoading || !isInitialized) {
    return (
      <>
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
          <DashboardSkeleton />
        </div>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </>
    );
  }

  return <>{children}</>;
}
