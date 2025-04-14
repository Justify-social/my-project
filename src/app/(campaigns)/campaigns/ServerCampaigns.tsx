// This is a server component that handles data fetching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { Suspense } from 'react';
import ClientCampaignList from './page';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

export default function ServerCampaigns() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <TableSkeleton rows={5} columns={6} />
        </div>
      }
    >
      <ClientCampaignList />
    </Suspense>
  );
}
