// Updated import paths via tree-shake script - 2025-04-01T17:13:32.216Z
import React from 'react';
import MarketplaceListProps from './influencers/index';
import LoadingSpinner from '../../ui/spinner-examples';
import { Influencer } from '@/types/influencer';
import InfluencerCard from '@/src/components/features/campaigns/influencers/InfluencerCard';
import { Button } from '@/components/ui/button/Button'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner/Spinner'

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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading influencers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <Icon iconId="faCircleExclamationLight" className="text-4xl text-red-500 mb-3" />
        <h3 className="text-xl font-bold mb-2">Error Loading Influencers</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button>
          <Icon iconId="faRotateLight" className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!influencers.length) {
    return (
      <div className="text-center py-10">
        <Icon iconId="faMagnifyingGlassLight" className="text-4xl text-gray-400 mb-3" />
        <h3 className="text-xl font-bold mb-2">No Results Found</h3>
        <p className="text-gray-600 mb-4">{emptyStateMessage}</p>
        <Button>
          <Icon iconId="faFilterSlashLight" className="mr-2" />
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid'
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "flex flex-col space-y-4"
    }>
      {influencers.map((influencer) => (
        <InfluencerCard
          key={influencer.id}
          influencer={influencer}
          layout={viewMode === 'grid' ? 'card' : 'row'}
          showMetrics={showMetrics}
          onClick={() => onInfluencerSelect(influencer)}
        />
      ))}
    </div>
  );
};

export default MarketplaceList; 