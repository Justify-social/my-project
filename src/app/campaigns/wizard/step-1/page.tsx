"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with no SSR
const DynamicSearchParamsWrapper = dynamic(
  () => import('@/components/SearchParamsWrapper'),
  { ssr: false }
);

const DynamicStep1Content = dynamic(
  () => import('./Step1Content'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
);

// Simple wrapper component
export default function CampaignStep1Page() {
  return (
    <DynamicSearchParamsWrapper>
      <DynamicStep1Content />
    </DynamicSearchParamsWrapper>
  );
}