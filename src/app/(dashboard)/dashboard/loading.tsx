import React from 'react';
import { Skeleton } from "@/components/ui/atoms/skeleton";

export default function Loading() {
  return (
    <div className="px-4 md:px-6 py-6 font-work-sans">
      <DashboardSkeleton />
    </div>);

}