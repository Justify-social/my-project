'use client';

import React from 'react';
import { SkeletonSection } from '@/components/ui/loading-skeleton';
import Card from '@/components/settings/shared/Card';

/**
 * A skeleton loader for the Branding page
 * Uses the existing skeleton components to create a consistent loading experience
 */
export default function BrandingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Colors Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={1}
        >
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded w-full"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
              <div className="h-24 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </SkeletonSection>
      </Card>

      {/* Typography Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={1}
        >
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Font */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            
            {/* Body Font */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </SkeletonSection>
      </Card>

      {/* Brand Logo Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={1}
        >
          <div className="mt-6">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </SkeletonSection>
      </Card>

      {/* Action Buttons Skeleton */}
      <div className="flex justify-end">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
} 