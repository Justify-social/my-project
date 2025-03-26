import React from 'react';

/**
 * Main Settings Page Skeleton Loader
 * Simple skeleton shown while redirecting to the appropriate settings page
 */
export default function SettingsPageSkeleton() {
  return (
    <div className="flex flex-col justify-center items-center py-12 space-y-4">
      <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse"></div>
      <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse"></div>
      <div className="mt-4">
        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
} 