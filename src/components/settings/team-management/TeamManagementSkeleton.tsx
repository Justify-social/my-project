'use client';

import React from 'react';
import { SkeletonSection } from '@/components/ui/loading-skeleton';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import Card from '@/components/settings/shared/Card';

/**
 * A skeleton loader for the Team Management page
 * Uses the existing skeleton components to create a consistent loading experience
 */
export default function TeamManagementSkeleton() {
  return (
    <div className="space-y-8">
      {/* Members List Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={0}
          actionButton={true}
        >
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <TableSkeleton 
              rows={5} 
              cols={4} 
              hasFilter={true}
            />
            <div className="mt-6 flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-8"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        </SkeletonSection>
      </Card>

      {/* Roles & Permissions Section Skeleton */}
      <Card>
        <SkeletonSection 
          title={true} 
          titleWidth="w-1/3" 
          lines={1}
        >
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Role Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Role Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viewer Role Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
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