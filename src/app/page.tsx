// Updated import paths via tree-shake script - 2025-04-01T17:13:32.199Z
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/lib/auth/authCoordinator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized } = useAuthState();

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/api/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner label="Loading..." />
    </div>
  );
}
