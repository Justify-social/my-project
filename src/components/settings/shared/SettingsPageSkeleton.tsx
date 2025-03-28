'use client';

import React from 'react';

/**
 * Skeleton loading state for settings pages
 */
const SettingsPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-4 w-full max-w-md bg-gray-200 rounded-md animate-pulse"></div>
      </div>
      
      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
        >
          {/* Card header */}
          <div className="flex items-start mb-6">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-3"></div>
            <div className="flex-1">
              <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          
          {/* Card content */}
          <div className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
          
          {/* Card actions */}
          <div className="flex justify-end mt-6">
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsPageSkeleton; 