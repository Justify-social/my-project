// This should be a server component (no "use client")
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the component that uses useSearchParams
const SearchParamsContent = dynamic(
  () => import('./SearchParamsContent'),
  { ssr: false } // Disable SSR for this component
);

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsContent />
    </Suspense>
  );
}