'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function AuthCheck({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded && !isSignedIn) {
    return null;
  }

  if (isLoaded && !isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
