// Updated import paths via tree-shake script - 2025-04-01T17:13:32.199Z
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/lib/auth/authCoordinator';

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
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}