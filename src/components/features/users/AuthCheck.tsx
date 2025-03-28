'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default function AuthCheck({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/api/auth/login');
  }

  return <>{children}</>;
} 