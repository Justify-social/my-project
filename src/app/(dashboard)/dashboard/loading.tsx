import React from 'react';
import { UIDashboardSkeleton as DashboardSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-4 md:px-6 py-6 font-work-sans">
      <DashboardSkeleton />
    </div>);

}