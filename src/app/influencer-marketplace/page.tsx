'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// import { useWizard } from '@/components/features/campaigns/WizardContext'; // REMOVE Wizard Context
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
import { Input } from '@/components/ui/input';

// Define the shape of filters state - Aligned with current BE capabilities
export interface FiltersState {
  platforms?: PlatformEnum[];
  // minScore?: number; // Deferred until BE supports Justify Score filtering
  // maxScore?: number; // Deferred
  minFollowers?: number;
  maxFollowers?: number;
  // audienceAge?: string; // Deferred until BE supports audience filtering
  // audienceLocation?: string; // Deferred
  isVerified?: boolean; // Renamed to match API schema (boolean type handled by Zod transform)
  // Add Audience Quality
  audienceQuality?: 'High' | 'Medium' | 'Low';
}

function MarketplacePage() {
  const router = useRouter();
  // const wizard = useWizard(); // REMOVE

  // REMOVE isWizardJourney logic
  // const isWizardJourney = useMemo(
  //   () => wizard?.wizardState?.isFindingInfluencers === true,
  //   [wizard?.wizardState?.isFindingInfluencers]
  // );

  // Component State
  const [influencers, setInfluencers] = useState<InfluencerSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // Keep selection state for now
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalInfluencers, setTotalInfluencers] = useState<number>(0);
  const [limit, setLimit] = useState<number>(12);
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState<boolean>(false);
  // Initialize appliedFilters to empty object (no context dependency)
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>(() => {
    logger.info('[MarketplacePage] Initializing with default empty appliedFilters.');
    return {};
  });
  // Add state for search term (live input)
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Add state for the search term that triggers the API call
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');

  // --- Data Fetching ---
  const fetchData = useCallback(
    // Use appliedSearchTerm for the API call
    async (page = 1, filtersToUse: FiltersState, currentAppliedSearchTerm: string) => {
      // Log the term being used for THIS specific fetch
      logger.info(
        `[MarketplacePage] >>> fetchData called with search: '${currentAppliedSearchTerm}'`,
        { page, filters: filtersToUse }
      );
      setIsLoading(true);
      setError(null);
      try {
        // Pass filters AND appliedSearchTerm to the service call
        const response = await influencerService.getInfluencers({
          pagination: { page, limit },
          filters: { ...filtersToUse, searchTerm: currentAppliedSearchTerm }, // Use appliedSearchTerm
        });
        setInfluencers(response.influencers);
        setCurrentPage(response.page);
        // ** Artificial Inflation for Sandbox UI **
        // If the API reports 12 or fewer total, pretend there are 48 for pagination UI demo
        const actualTotal = response.total;
        const displayTotal = actualTotal <= 12 ? 48 : actualTotal;
        setTotalInfluencers(displayTotal);
        setLimit(response.limit);
        logger.info(
          `[MarketplacePage] Data fetch successful. Actual total: ${actualTotal}, Display total set to: ${displayTotal}`
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

  // Fetch data on initial load & when appliedFilters, appliedSearchTerm or currentPage change
  useEffect(() => {
    // Log when the effect triggers and the value it sees
    logger.info(`[MarketplacePage] --- useEffect triggered for Fetch ---`, {
      currentPage,
      appliedFilters,
      appliedSearchTerm,
    });
    // Pass appliedFilters AND appliedSearchTerm to fetchData
    fetchData(currentPage, appliedFilters, appliedSearchTerm);
  }, [currentPage, appliedFilters, appliedSearchTerm, fetchData]); // Watch appliedSearchTerm, not searchTerm

  // --- Event Handlers ---
  const handleSelectToggle = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const handleViewProfile = useCallback(
    // Accept handle and platformEnum string
    (handle: string | null, platformEnum: PlatformEnum | null) => {
      if (!handle || !platformEnum) {
        logger.error('[MarketplacePage] handleViewProfile called without handle or platformEnum!', {
          handle,
          platformEnum,
        });
        toast.error('Cannot view profile: Missing required identifiers.');
        return;
      }

      // Construct query params with platform enum string
      const queryParams = new URLSearchParams();
      // Convert enum value to string for URL param
      queryParams.append('platform', platformEnum);
      const destinationUrl = `/influencer-marketplace/${encodeURIComponent(handle)}?${queryParams.toString()}`;

      logger.debug('[MarketplacePage] Navigating to profile:', {
        destinationUrl,
        handle: handle,
        platform: platformEnum,
      });

      router.push(destinationUrl);
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

  const handleApplyFilters = useCallback(
    (filtersFromComponent: FiltersState) => {
      // Log BEFORE setting appliedSearchTerm
      logger.info(
        '[MarketplacePage] handleApplyFilters: Applying filters and current searchTerm:',
        { filters: filtersFromComponent, searchTerm }
      );
      setAppliedFilters(filtersFromComponent);
      // Apply the current search term when filters are applied
      setAppliedSearchTerm(searchTerm);
      // Log AFTER setting appliedSearchTerm to confirm the update is registered for the next effect run
      logger.info(
        `[MarketplacePage] handleApplyFilters: Set appliedSearchTerm to: '${searchTerm}'`
      );
      setCurrentPage(1); // Reset page when filters change
      setIsFiltersSheetOpen(false);
    },
    [searchTerm]
  ); // Add searchTerm dependency here

  const handleResetFilters = useCallback(() => {
    logger.info('[MarketplacePage] Resetting filters and search term.');
    setAppliedFilters({});
    setSearchTerm(''); // Clear the input field state
    setAppliedSearchTerm(''); // Clear the state that triggers API calls
    setCurrentPage(1); // Reset page
    setIsFiltersSheetOpen(false);
  }, []);

  // REMOVE handleAddToCampaign callback
  // const handleAddToCampaign = useCallback(() => {
  //   // ... removed logic ...
  // }, [wizard, selectedIds, router, isWizardJourney]);

  const totalPages = Math.ceil(totalInfluencers / limit);

  // --- Render Logic ---
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Influencer Marketplace</h1>
        {/* Keep only the Filters button */}
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
                  // Pass down live search term state and handler
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* REMOVE Add to Campaign Button */}
          {/* {isWizardJourney && ( ... )} */}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
          <AlertTitle>Error Loading Influencers</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MarketplaceList
        influencers={influencers}
        isLoading={isLoading}
        error={error}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onViewProfile={identifier => {
          const clickedInfluencer = influencers.find(inf => inf.id === identifier);
          // Explicitly check handle AND platformEnum before calling
          if (clickedInfluencer && clickedInfluencer.handle && clickedInfluencer.platformEnum) {
            handleViewProfile(clickedInfluencer.handle, clickedInfluencer.platformEnum);
          } else {
            logger.error(
              '[MarketplacePage] Could not find influencer data or required fields (handle, platformEnum) for id:',
              {
                identifier,
                influencerExists: !!clickedInfluencer,
                handle: clickedInfluencer?.handle,
                platformEnum: clickedInfluencer?.platformEnum,
              }
            );
            toast.error('Error navigating to profile.');
          }
        }}
        itemsPerPage={limit}
      />

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
            {/* Add page numbers if needed */}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default MarketplacePage;
