// Updated import paths via tree-shake script - 2025-04-01T17:13:32.218Z
import React, { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { Influencer } from '../../../types/influencer';
import { Icon } from '@/components/ui/icon/icon';
import { InfluencerCard } from '@/components/ui/card-influencer';
import { PlatformSchema, PlatformEnumBackend } from './types';
import { z } from 'zod';

export interface MarketplaceListProps {
  influencers: Influencer[];
  isLoading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  onInfluencerSelect: (influencer: Influencer) => void;
  emptyStateMessage?: string;
  showMetrics?: boolean;
}

const MarketplaceList: React.FC<MarketplaceListProps> = ({
  influencers,
  isLoading,
  error,
  viewMode,
  onInfluencerSelect,
  emptyStateMessage = 'No influencers found matching your criteria',
  showMetrics = true,
}) => {
  const [hoveredInfluencer, setHoveredInfluencer] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingSpinner className="mt-10 mx-auto" />;
  }

  if (error) {
    return <Alert variant="destructive" title="Error loading influencers" description={error} className="mt-4" />;
  }

  if (influencers.length === 0) {
    return <div className="text-center text-muted-foreground mt-10">{emptyStateMessage}</div>;
  }

  return (
    <div
      className={cn(
        'mt-6 grid gap-4',
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          : 'grid-cols-1'
      )}
    >
      {influencers.map(influencer => {
        let platformEnum: z.infer<typeof PlatformEnumBackend> | undefined;
        try {
          platformEnum = PlatformSchema.parse(influencer.platform);
        } catch {
          platformEnum = undefined;
          console.warn(`Invalid platform string for influencer ${influencer.id}: ${influencer.platform}`);
        }

        return platformEnum ? (
          <div key={influencer.id} onClick={() => onInfluencerSelect(influencer)}>
            <InfluencerCard
              platform={platformEnum}
              handle={influencer.username}
              displayName={influencer.name}
              avatarUrl={influencer.avatar}
              followerCount={influencer.followers}
              engagementRate={influencer.audienceMetrics?.engagement?.rate}
              className={cn(
                viewMode === 'list' ? 'flex-row items-center' : '',
                'transition-all duration-200 ease-in-out',
                hoveredInfluencer === influencer.id ? 'shadow-lg scale-[1.02]' : 'shadow-sm'
              )}
              onMouseEnter={() => setHoveredInfluencer(influencer.id)}
              onMouseLeave={() => setHoveredInfluencer(null)}
            />
          </div>
        ) : null;
      })}
    </div>
  );
};

export default MarketplaceList;
