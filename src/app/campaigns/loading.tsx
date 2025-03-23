import React from 'react';
import { TableSkeleton, SkeletonSection } from '@/components/ui/loading-skeleton';

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header with title and new campaign button */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      
      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Table with campaigns */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <TableSkeleton 
          rows={8} 
          cols={6} 
          hasHeader={true}
          hasFilter={false}
          colWidths={['30%', '15%', '15%', '15%', '15%', '10%']}
        />
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-8 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
} 