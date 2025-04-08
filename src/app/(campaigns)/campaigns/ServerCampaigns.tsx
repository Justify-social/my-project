// This is a server component that handles data fetching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';
import LoadingSpinner from '../../../components/ui/spinner-examples';
import ClientCampaignList from '@/src/components/features/users/profile/page';
import { Spinner } from '@/components/ui/spinner/Spinner'

export default function ServerCampaigns() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12 font-work-sans">
        <LoadingSpinner className="w-12 h-12 text-[#0ea5e9] font-work-sans" />
        <p className="mt-4 text-gray-500 font-work-sans">Loading campaigns...</p>
      </div>
    }>
      <ClientCampaignList />
    </Suspense>);

}