import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
      
      {/* Campaign Details Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full" />
          ))}
        </div>
      </div>

      {/* Objectives Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full" />
          ))}
        </div>
      </div>

      {/* Audience Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full" />
          ))}
        </div>
      </div>

      {/* Creative Assets Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 mb-4">
            <div className="h-48 bg-gray-200 rounded mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="mt-8">
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

export default LoadingSkeleton; 