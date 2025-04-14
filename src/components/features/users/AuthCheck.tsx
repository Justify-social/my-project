'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

export default function AuthCheck({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/signin');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
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
