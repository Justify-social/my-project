import React from 'react';
import { SkeletonSection } from '@/components/ui/molecules/skeleton/SkeletonSection'

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-work-sans">
      {/* Header with title and new campaign button */}
      <div className="flex justify-between items-center font-work-sans">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse font-work-sans" />
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse font-work-sans" />
      </div>
      
      {/* Search and Filters */}
      <div className="flex justify-between items-center font-work-sans">
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse font-work-sans" />
        <div className="flex space-x-2 font-work-sans">
          {[1, 2, 3, 4].map((i) =>
          <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse font-work-sans" />
          )}
        </div>
      </div>
      
      {/* Table with campaigns */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden font-work-sans">
        <TableSkeleton
          rows={8}
          cols={6}
          hasHeader={true}
          hasFilter={false}
          colWidths={['30%', '15%', '15%', '15%', '15%', '10%']} />

      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center font-work-sans">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse font-work-sans" />
        <div className="flex space-x-2 font-work-sans">
          {[1, 2, 3].map((i) =>
          <div key={i} className="h-8 bg-gray-200 rounded w-8 animate-pulse font-work-sans" />
          )}
        </div>
      </div>
    </div>);

}