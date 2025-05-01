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

  // --- Data Fetching (Remains the same, uses appliedFilters state) ---
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
    (publicIdentifier: string, platformId?: string | null) => {
      // publicIdentifier should be the creator's username/handle
      // platformId is the workPlatformId (UUID)

      if (!publicIdentifier) {
        logger.error('[MarketplacePage] handleViewProfile called without a publicIdentifier!');
        toast.error('Cannot view profile: Missing required identifier.');
        return;
      }
      if (!platformId) {
        logger.error('[MarketplacePage] handleViewProfile called without a platformId!');
        toast.error('Cannot view profile: Missing required platform ID.');
        return;
      }

      // Use the public identifier (handle) directly for the path segment
      const pathSegment = publicIdentifier;

      // Construct query params - ONLY include platformId
      const queryParams = new URLSearchParams();
      queryParams.append('platformId', platformId); // Pass the platform ID

      const queryString = queryParams.toString();
      // Construct the destination URL using the public identifier in the path and platformId in query
      const destinationUrl = `/influencer-marketplace/${encodeURIComponent(pathSegment)}?${queryString}`;

      logger.debug('[MarketplacePage] Navigating to profile (simplified):', {
        destinationUrl,
        handle: publicIdentifier,
        platformId: platformId,
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

  const handleApplyFilters = useCallback((filtersFromComponent: FiltersState) => {
    logger.info('[MarketplacePage] Applying filters:', filtersFromComponent);
    setAppliedFilters(filtersFromComponent);
    setCurrentPage(1);
    setIsFiltersSheetOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    logger.info('[MarketplacePage] Resetting filters.');
    // Reset to empty object, no context dependency
    setAppliedFilters({});
    setCurrentPage(1);
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
        onViewProfile={handleViewProfile}
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
