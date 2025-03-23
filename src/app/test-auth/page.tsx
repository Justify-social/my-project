"use client";

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export default function TestAuthPage() {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>
      <h1>Not authenticated</h1>
      <p>Please <Link href="/api/auth/login">login</Link></p>
    </div>;
  }

  return (
    <div>
      <h1>Authenticated!</h1>
      <p>User: {JSON.stringify(user)}</p>
      <Link href="/api/auth/logout">Logout</Link>
    </div>
  );
} 