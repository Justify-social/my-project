'use client';

import React from 'react';

/**
 * Loading skeleton for component browser
 * Displays a nice animation while components are being loaded
 */
export default function ComponentsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="w-1/3 h-8 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-md"></div>
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-4">
        <div className="w-64 h-10 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="w-40 h-10 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="w-48 h-10 bg-gray-200 animate-pulse rounded-md"></div>
      </div>

      {/* Grid of component skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm">
            <div className="w-full h-36 bg-gray-200 animate-pulse rounded-md mb-4"></div>
            <div className="w-2/3 h-6 bg-gray-200 animate-pulse rounded-md mb-2"></div>
            <div className="w-full h-4 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 