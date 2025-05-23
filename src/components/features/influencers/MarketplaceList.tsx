'use client';

import React from 'react';
import { InfluencerSummary } from '@/types/influencer';
import { InfluencerSummaryCard } from './InfluencerSummaryCard';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon'; // Use direct path
import { logger } from '@/lib/logger';

interface MarketplaceListProps {
  influencers: InfluencerSummary[];
  isLoading: boolean;
  error: string | null;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onViewProfile: (id: string, platformId?: string | null) => void;
  itemsPerPage?: number; // Used for rendering skeletons
}

export const MarketplaceList: React.FC<MarketplaceListProps> = ({
  influencers,
  isLoading,
  error,
  selectedIds,
  onSelectToggle,
  onViewProfile,
  itemsPerPage = 12, // Default to match page state
}) => {
  // Loading State: Render Skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <LoadingSkeleton key={`skeleton-${index}`} className="h-[275px] w-full" />
        ))}
      </div>
    );
  }

  // Error State: Render Alert
  if (error) {
    return (
      <Alert variant="destructive">
        <Icon iconId="faTriangleExclamationSolid" className="h-4 w-4" /> {/* Use iconId */}
        <AlertTitle>Error Loading Influencers</AlertTitle>
        <AlertDescription>
          {error || 'An unexpected error occurred. Please try refreshing the page.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty State: Render Message
  if (!influencers || influencers.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No matching influencers found.</p>
        {/* Optionally add a button to reset filters later */}
      </div>
    );
  }

  // Success State: Render Influencer Cards
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {influencers.map(influencer => {
        // Log the data being used to render the card and construct the callback
        logger.debug('[MarketplaceList] Rendering card for:', {
          id: influencer.id,
          handle: influencer.handle,
          platform: influencer.platforms ? influencer.platforms[0] : 'N/A',
          workPlatformId: influencer.workPlatformId,
        });

        // Ensure handle exists, fallback to id if absolutely necessary (though handle should be preferred)
        const _publicIdentifier = influencer.handle || influencer.id;

        return (
          <InfluencerSummaryCard
            key={influencer.id}
            influencer={influencer}
            isSelected={selectedIds.includes(influencer.id)}
            onSelectToggle={onSelectToggle}
            onViewProfile={onViewProfile}
          />
        );
      })}
    </div>
  );
};
