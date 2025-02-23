"use client";

import dynamic from 'next/dynamic';

// Import the Step1Content component with no SSR and proper error boundary
const Step1Content = dynamic(
  () => import('./Step1Content').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
);

// Create a client-side only wrapper component
function ClientSideWrapper() {
  return <Step1Content />;
}

// Export a server component that renders the client wrapper
export default function Page() {
  return <ClientSideWrapper />;
}