// This is a server component that handles data fetching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';
import ClientCampaignList from './page';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ServerCampaigns() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner className="w-12 h-12 text-[#0ea5e9]" />
        <p className="mt-4 text-gray-500">Loading campaigns...</p>
      </div>
    }>
      <ClientCampaignList />
    </Suspense>
  );
} 