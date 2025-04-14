// This is a server component that handles data fetching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';
import ClientCampaignList from './page';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ServerCampaigns() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-12 font-body">
          <LoadingSpinner className="w-12 h-12 text-[var(--accent-color)] font-body" />
          <p className="mt-4 text-gray-500 font-body">Loading campaigns...</p>
        </div>
      }
    >
      <ClientCampaignList />
    </Suspense>
  );
}
