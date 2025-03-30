'use client';

import React from 'react';
import { SkeletonSection } from '@/components/ui/molecules/skeleton/SkeletonSection'
import Card from '@/components/settings/shared/Card';

/**
 * A skeleton loader for the Profile Settings page
 * Uses the existing skeleton components to create a consistent loading experience
 */
export default function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile Picture Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={0}
        >
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </SkeletonSection>
      </Card>

      {/* Personal Info Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={0}
        >
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </div>
        </SkeletonSection>
      </Card>

      {/* Password Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={0}
        >
          <div className="mt-4 space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mt-4" />
            <div className="h-10 bg-gray-200 rounded w-40 mt-6 ml-auto" />
          </div>
        </SkeletonSection>
      </Card>

      {/* Notification Preferences Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={0}
        >
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-60" />
              </div>
              <div className="h-6 w-12 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-60" />
              </div>
              <div className="h-6 w-12 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-40 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-60" />
              </div>
              <div className="h-6 w-12 bg-gray-200 rounded-full" />
            </div>
            <div className="h-24 bg-gray-200 rounded-md mt-6" />
          </div>
        </SkeletonSection>
      </Card>
    </div>
  );
} 