'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { influencerService } from '@/services/influencer'; // Ensure service is imported
import { InfluencerSummary } from '@/types/influencer';
// import { useWizard } from '@/components/features/campaigns/WizardContext'; // Context interaction later
import ConditionalLayout from '@/components/layouts/conditional-layout';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { MarketplaceList } from '@/components/features/influencers/MarketplaceList';
import {
  MarketplaceFilters,
  FilterValues,
} from '@/components/features/influencers/MarketplaceFilters'; // Import Filters component and type
import { logger } from '@/utils/logger'; // Import logger
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

// Define initial empty filters state
const initialFilters: FilterValues = {
  platforms: undefined,
  minScore: undefined,
  maxScore: undefined,
  minFollowers: undefined,
  maxFollowers: undefined,
  audienceAge: undefined,
  audienceLocation: undefined,
  isPhylloVerified: undefined,
};

export default function MarketplacePage() {
  const router = useRouter();
  // const { wizardState, updateWizardState } = useWizard(); // Integrate later

  const [influencers, setInfluencers] = useState<InfluencerSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalInfluencers, setTotalInfluencers] = useState<number>(0);
  const [limit, setLimit] = useState<number>(12); // Default page size
  const [showFilters, setShowFilters] = useState<boolean>(false); // State for drawer visibility
  const [activeFilters, setActiveFilters] = useState<FilterValues>(initialFilters); // State for applied filters
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

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

  // Fetch data function - updated to accept filters
  const fetchData = useCallback(
    async (page = 1, currentFilters: FilterValues = initialFilters) => {
      setIsLoading(true);
      setError(null);
      // Clean up filters before sending to API (remove undefined/empty values)
      const cleanFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
          acc[key as keyof FilterValues] = value;
        }
        return acc;
      }, {} as FilterValues);

      logger.info(`[MarketplacePage] Fetching data for page ${page} with filters:`, cleanFilters);

      try {
        // Pass the cleaned filters to the service
        const response = await influencerService.getInfluencers({
          pagination: { page, limit },
          filters: cleanFilters,
        });
        setInfluencers(response.influencers);
        setTotalInfluencers(response.total);
        setCurrentPage(response.page);
        setLimit(response.limit);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load influencers.';
        logger.error('[MarketplacePage] Error fetching influencers:', message);
        setError(message);
        setInfluencers([]);
        setTotalInfluencers(0);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  // Handler for applying filters from the drawer
  const handleApplyFilters = useCallback(
    (newFilters: FilterValues) => {
      logger.info('[MarketplacePage] Applying filters:', newFilters);
      setActiveFilters(newFilters);
      setCurrentPage(1); // Reset to page 1 is crucial when filters change
      fetchData(1, newFilters); // Fetch data with the new filters applied
      setShowFilters(false);
    },
    [fetchData]
  );

  // Handler for resetting filters
  const handleResetFilters = useCallback(() => {
    logger.info('[MarketplacePage] Resetting filters');
    setActiveFilters(initialFilters);
    setCurrentPage(1);
    fetchData(1, initialFilters);
    // Optionally keep drawer open: setShowFilters(true);
  }, [fetchData]);

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchData(newPage, activeFilters);
    },
    [fetchData, activeFilters]
  );

  // TODO: Implement handleAddToCampaign
  const handleAddToCampaign = useCallback(() => {
    // Logic depends on whether coming from Wizard or direct navigation
    // updateWizardState({ selectedInfluencerIds: selectedIds, isFindingInfluencers: false });
    // router.push('/campaigns/wizard/step-X'); // Navigate back to Wizard Review step
    logger.info('[MarketplacePage] Add to campaign clicked with IDs:', selectedIds);
  }, [selectedIds, router /*, updateWizardState */]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchData(1, activeFilters);
  }, [fetchData]); // Trigger only once on mount based on initial fetchData instance

  const totalPages = Math.ceil(totalInfluencers / limit);

  return (
    <ConditionalLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header Area */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Influencer Marketplace</h1>
          <div className="flex items-center space-x-2">
            {/* Filter Button */}
            <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>
              <Icon iconId="faFilterLight" className="mr-2 h-4 w-4" /> Filters
            </Button>
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

        {/* Pagination - Using Shadcn structure */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  aria-disabled={currentPage <= 1}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={
                    currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                  aria-disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Filter Drawer - Pass state and handlers */}
        <MarketplaceFilters
          isOpen={isFiltersOpen}
          onOpenChange={setIsFiltersOpen}
          currentFilters={activeFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
      </div>
    </ConditionalLayout>
  );
}
