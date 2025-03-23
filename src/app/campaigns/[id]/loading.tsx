import React from 'react';
import { SkeletonSection } from '@/components/ui/loading-skeleton';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
      
      {/* Campaign Details Section */}
      <SkeletonSection 
        title={true} 
        titleWidth="w-1/4" 
        actionButton={true}
        lines={3}
        className="mb-6"
      />

      {/* Objectives Section */}
      <SkeletonSection 
        title={true} 
        titleWidth="w-1/3" 
        actionButton={true}
        lines={4}
        className="mb-6"
      />

      {/* Audience Section */}
      <SkeletonSection 
        title={true} 
        titleWidth="w-1/4" 
        actionButton={true}
        lines={3}
        className="mb-6"
      />

      {/* Creative Assets Section */}
      <SkeletonSection 
        title={true} 
        titleWidth="w-1/4" 
        actionButton={true}
        lines={3}
        className="mb-6"
      />
    </div>
  );
} 