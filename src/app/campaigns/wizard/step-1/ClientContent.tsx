'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the actual form content
const Step1Content = dynamic(
  () => import('./Step1Content'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ),
  }
);

export default function ClientContent() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <Step1Content />
    </Suspense>
  );
} 