"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the entire page content with no SSR
const DynamicStep1Page = dynamic(
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
  return <DynamicStep1Page />;
}