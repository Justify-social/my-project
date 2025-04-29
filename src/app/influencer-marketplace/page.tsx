'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { influencerService } from '@/services/influencer'; // Import the service layer
import { InfluencerSummary } from '@/types/influencer';
// import { useWizard } from '@/components/features/campaigns/WizardContext'; // Context interaction later
import { ConditionalLayout } from '@/components/layout/conditional-layout'; // Assuming layout component path
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon path
import { MarketplaceList } from '@/components/features/influencers/MarketplaceList'; // Import list component
// import { MarketplaceFilters } from '@/components/features/influencers/MarketplaceFilters';

// Placeholder type for filters state
interface FiltersState {
  platform?: string[];
  minScore?: number;
  // Add other filter fields as needed
}

export default function MarketplacePage() {
  const router = useRouter();
  // const { wizardState, updateWizardState } = useWizard(); // Integrate later

  const [influencers, setInfluencers] = useState<InfluencerSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalInfluencers, setTotalInfluencers] = useState<number>(0);
  const [limit, setLimit] = useState<number>(12); // Default page size

  // TODO: Add state for filters and filter drawer visibility later (Ticket 1.6, 1.7)
  // const [showFilters, setShowFilters] = useState<boolean>(false);
  // const [filters, setFilters] = useState<FiltersState>({});

  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const handleViewProfile = useCallback(
    (id: string) => {
      router.push(`/influencer-marketplace/${id}`);
    },
    [router]
  );

  // TODO: Implement actual data fetching in Ticket 1.4
  const fetchData = useCallback(
    async (page = 1 /*, currentFilters = {} */) => {
      setIsLoading(true);
      setError(null);
      console.log(`[MarketplacePage] Fetching data for page ${page}... (Using Mock Service)`);
      try {
        // TEMPORARY: Fetch using mock service until BE API is ready
        // In Ticket 1.4, this call will remain, but influencerService will point to the real API
        const response = await influencerService.getInfluencers({
          pagination: { page, limit },
          // filters: currentFilters, // Add filters when implemented
        });
        setInfluencers(response.influencers);
        setTotalInfluencers(response.total);
        setCurrentPage(response.page); // Ensure page state is updated from response
        setLimit(response.limit); // Ensure limit state is updated from response
      } catch (err: any) {
        console.error('[MarketplacePage] Error fetching influencers:', err);
        setError(err.message || 'Failed to load influencers.');
        setInfluencers([]); // Clear data on error
        setTotalInfluencers(0);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  ); // Add limit as dependency if it can change

  // TODO: Implement handlePageChange for pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchData(newPage /*, filters */); // Fetch data for new page
    },
    [fetchData /*, filters */]
  );

  // TODO: Implement handleAddToCampaign
  const handleAddToCampaign = useCallback(() => {
    // Logic depends on whether coming from Wizard or direct navigation
    // updateWizardState({ selectedInfluencerIds: selectedIds, isFindingInfluencers: false });
    // router.push('/campaigns/wizard/step-X'); // Navigate back to Wizard Review step
    console.log('Add to campaign clicked with IDs:', selectedIds);
  }, [selectedIds, router /*, updateWizardState */]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchData(1); // Fetch first page initially
  }, [fetchData]); // Depend on fetchData

  const totalPages = Math.ceil(totalInfluencers / limit);

  return (
    <ConditionalLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header Area */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Influencer Marketplace</h1>
          <div className="flex items-center space-x-2">
            {/* TODO: Add Filter Button (Ticket 1.6) */}
            {/* <Button variant="outline" onClick={() => setShowFilters(true)}> */}
            {/*   <Icon iconId="faFilterLight" className="mr-2 h-4 w-4" /> Filters */}
            {/* </Button> */}
            <Button onClick={handleAddToCampaign} disabled={selectedIds.length === 0}>
              Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}to Campaign
            </Button>
          </div>
        </div>

        {/* Content Area - Use MarketplaceList */}
        <MarketplaceList
          influencers={influencers}
          isLoading={isLoading}
          error={error}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
          onViewProfile={handleViewProfile}
          itemsPerPage={limit}
        />

        {/* TODO: Add Pagination Component */}
        {/* <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /> */}

        {/* TODO: Add Filter Drawer (Ticket 1.6) */}
        {/* <MarketplaceFilters isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} /> */}
      </div>
    </ConditionalLayout>
  );
}
