'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Custom hook to extract the 'id' parameter from URL search params
 */
export function useSearchParamsHook() {
  const searchParams = useSearchParams();
  return searchParams ? searchParams.get('id') : null;
}

export interface SearchParamsWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides the campaign ID from URL search params to its children
 */
export default function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  const campaignId = useSearchParamsHook();

  return (
    <div data-campaign-id={campaignId} className="font-work-sans">
      {children}
    </div>
  );
} 