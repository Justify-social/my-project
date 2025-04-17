// Updated import paths via tree-shake script - 2025-04-01T17:13:32.199Z
'use client';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Home() {
  // TODO: Decide what to show here for authenticated users.
  // Maybe redirect to /dashboard or show a welcome message?
  // If redirecting authenticated users, consider doing it server-side
  // or using a simpler client-side check if necessary.

  // The middleware now handles redirecting unauthenticated users *before* this renders.
  // We can show a basic loading state or null while the initial auth state
  // might still be loading client-side for potentially authenticated users.
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner label="Loading..." />
    </div>
  );
}
