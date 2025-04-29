'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWizard } from '@/components/features/campaigns/WizardContext';
import { influencerService } from '@/services/influencer';
import { InfluencerSummary } from '@/types/influencer';
import { PlatformEnum } from '@/types/enums';
import { logger } from '@/utils/logger';

// Import UI Components
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { MarketplaceList } from '@/components/features/influencers/MarketplaceList';
import { MarketplaceFilters } from '@/components/features/influencers/MarketplaceFilters';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

// Define the shape of filters state
export interface FiltersState {
  platforms?: PlatformEnum[];
  minScore?: number;
  maxScore?: number;
  minFollowers?: number;
  maxFollowers?: number;
  audienceAge?: string;
  audienceLocation?: string;
  isPhylloVerified?: boolean;
}

function MarketplacePage() {
  const router = useRouter();
  const wizard = useWizard();

  const isWizardJourney = useMemo(
    () => wizard?.wizardState?.isFindingInfluencers === true,
    [wizard?.wizardState?.isFindingInfluencers]
  );

  // Component State (Keep appliedFilters separate)
  const [influencers, setInfluencers] = useState<InfluencerSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalInfluencers, setTotalInfluencers] = useState<number>(0);
  const [limit, setLimit] = useState<number>(12);
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>(() => {
    if (isWizardJourney && wizard?.wizardState) {
      const initialFilters: FiltersState = {};
      if (wizard.wizardState.targetPlatforms && wizard.wizardState.targetPlatforms.length > 0) {
        initialFilters.platforms = wizard.wizardState.targetPlatforms as PlatformEnum[];
      }
      logger.info(
        '[MarketplacePage] Initializing appliedFilters from Wizard context',
        initialFilters
      );
      return initialFilters;
    }
    logger.info('[MarketplacePage] Initializing with default empty appliedFilters.');
    return {};
  });

  // --- Data Fetching ---
  const fetchData = useCallback(
    async (page = 1, filtersToUse: FiltersState) => {
      logger.info(`[MarketplacePage] Fetching data for page ${page}`, { filters: filtersToUse });
      setIsLoading(true);
      setError(null);
      try {
        const response = await influencerService.getInfluencers({
          pagination: { page, limit },
          filters: filtersToUse,
        });
        setInfluencers(response.influencers);
        setCurrentPage(response.page);
        setTotalInfluencers(response.total);
        setLimit(response.limit);
        logger.info(
          `[MarketplacePage] Data fetch successful. Found ${response.total} influencers.`
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load influencers.';
        logger.error('[MarketplacePage] Data fetch error:', err);
        setError(message);
        setInfluencers([]);
        setTotalInfluencers(0);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  // Fetch data on initial load & when appliedFilters or currentPage change
  useEffect(() => {
    fetchData(currentPage, appliedFilters);
  }, [currentPage, appliedFilters, fetchData]);

  // --- Event Handlers ---
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

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= Math.ceil(totalInfluencers / limit)) {
        setCurrentPage(newPage);
      }
    },
    [totalInfluencers, limit]
  );

  // Apply filters handler - Called by MarketplaceFilters via onApply prop
  const handleApplyFilters = useCallback((filtersFromComponent: FiltersState) => {
    logger.info('[MarketplacePage] Applying filters:', filtersFromComponent);
    setAppliedFilters(filtersFromComponent);
    setCurrentPage(1);
    setIsFiltersSheetOpen(false);
  }, []);

  // Reset filters handler - Called by MarketplaceFilters via onReset prop
  const handleResetFilters = useCallback(() => {
    logger.info('[MarketplacePage] Resetting filters.');
    const initialFilters =
      isWizardJourney && wizard?.wizardState
        ? {
            platforms: wizard.wizardState.targetPlatforms as PlatformEnum[],
          }
        : {};
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
    setIsFiltersSheetOpen(false);
  }, [isWizardJourney, wizard?.wizardState]);

  // Handler for adding selected influencers back to the wizard
  const handleAddToCampaign = useCallback(() => {
    if (isWizardJourney && wizard && selectedIds.length > 0) {
      logger.info(
        `[MarketplacePage] Adding ${selectedIds.length} influencers to campaign via Wizard context.`
      );
      wizard.updateWizardState({ selectedInfluencerIds: selectedIds, isFindingInfluencers: false });
      if (wizard.campaignId) {
        router.push(`/campaigns/wizard/step-5?id=${wizard.campaignId}`);
      } else {
        logger.error(
          '[MarketplacePage] Cannot navigate back to wizard: campaignId is missing from context.'
        );
        toast.error('Error returning to campaign wizard (missing campaign ID).');
      }
    } else {
      logger.warn(
        '[MarketplacePage] AddToCampaign called outside of wizard journey or no selection/context.'
      );
    }
  }, [wizard, selectedIds, router, isWizardJourney]);

  // Calculate total pages
  const totalPages = Math.ceil(totalInfluencers / limit);

  // --- Render Logic ---
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Influencer Marketplace</h1>
        <div className="flex items-center gap-2">
          <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Icon iconId="faFilterLight" className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 md:w-96 flex flex-col" side="right">
              <SheetHeader className="mb-4 border-b pb-4">
                <SheetTitle>Filter Influencers</SheetTitle>
                <SheetDescription>Refine the list based on your criteria.</SheetDescription>
              </SheetHeader>
              <div className="flex-grow overflow-y-auto pr-6">
                <MarketplaceFilters
                  isOpen={isFiltersSheetOpen}
                  onOpenChange={setIsFiltersSheetOpen}
                  currentFilters={appliedFilters}
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          {isWizardJourney && (
            <Button onClick={handleAddToCampaign} disabled={selectedIds.length === 0}>
              Add {selectedIds.length > 0 ? `(${selectedIds.length}) ` : ''}to Campaign
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon iconId="faExclamationTriangle" className="h-4 w-4" />
          <AlertTitle>Error Loading Influencers</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MarketplaceList
        influencers={influencers}
        isLoading={isLoading}
        error={null}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onViewProfile={handleViewProfile}
        itemsPerPage={limit}
      />

      {totalPages > 1 && !isLoading && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                  aria-disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;
