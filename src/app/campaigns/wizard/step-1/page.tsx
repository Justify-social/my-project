"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Step1Content with no SSR
const Step1Content = dynamic(
  () => import('./Step1Content'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ),
  }
);

export default function CampaignStep1Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    }>
      <Step1Content />
    </Suspense>
  );
}