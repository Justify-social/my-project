'use client';

import { useSearchParams } from 'next/navigation';

export function useSearchParamsHook() {
  const searchParams = useSearchParams();
  return searchParams.get('id');
}

export default function SearchParamsWrapper({ children }: { children: React.ReactNode }) {
  const campaignId = useSearchParamsHook();
  
  return (
    <div data-campaign-id={campaignId}>
      {children}
    </div>
  );
} 