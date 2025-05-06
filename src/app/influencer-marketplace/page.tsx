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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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

// Define CampaignType reused from profile page
type CampaignType = {
  id: string;
  name: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
};

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

  // --- State for Bulk Add Dialog (Task 2.1 - Bulk) ---
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [bulkCampaignsList, setBulkCampaignsList] = useState<CampaignType[]>([]);
  const [bulkSelectedCampaignId, setBulkSelectedCampaignId] = useState<string | null>(null);
  const [isFetchingBulkCampaigns, setIsFetchingBulkCampaigns] = useState(false);
  const [isBulkAddingToCampaign, setIsBulkAddingToCampaign] = useState(false);
  // --- End State for Bulk Add Dialog ---

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

  // --- Logic for Bulk Add Dialog (Task 2.3) ---
  const fetchBulkCampaignsForDropdown = useCallback(async () => {
    // Only fetch if dialog is open
    if (!isBulkAddDialogOpen) return;
    // Simple check: If list already has items, don't refetch. User can close/reopen to refresh.
    if (bulkCampaignsList.length > 0) return;

    logger.info('[MarketplacePage] Fetching campaigns for Bulk Add dialog...');
    setIsFetchingBulkCampaigns(true);
    try {
      const response = await fetch('/api/campaigns/selectable-list'); // Use the same endpoint
      const data = await response.json();
      if (response.ok && data.success) {
        setBulkCampaignsList(data.data || []);
        if (data.data.length === 0) {
          toast('No draft or active campaigns available.');
        }
      } else {
        logger.error(
          '[MarketplacePage] Failed to fetch selectable campaigns for bulk add:',
          data.error
        );
        toast.error(data.error || 'Failed to load campaigns.');
        setBulkCampaignsList([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network or fetch error';
      logger.error('[MarketplacePage] Error fetching campaigns for bulk add:', err);
      toast.error(`Failed to load campaigns: ${message}`);
      setBulkCampaignsList([]);
    } finally {
      setIsFetchingBulkCampaigns(false);
    }
  }, [isBulkAddDialogOpen, bulkCampaignsList.length]); // Dependency includes length to re-evaluate if list is empty

  // Effect to fetch campaigns when the bulk add dialog opens
  useEffect(() => {
    if (isBulkAddDialogOpen) {
      fetchBulkCampaignsForDropdown();
    }
  }, [isBulkAddDialogOpen, fetchBulkCampaignsForDropdown]);

  // --- handleBulkAddToCampaignSubmit function (Task 2.3) - Updated Error Handling ---
  const handleBulkAddToCampaignSubmit = async () => {
    if (!bulkSelectedCampaignId || selectedIds.length === 0) {
      toast.error('Please select a campaign and at least one influencer.');
      return;
    }

    setIsBulkAddingToCampaign(true);
    const loadingToastId = toast.loading(`Adding ${selectedIds.length} influencers...`);

    // Prepare payload by mapping selected IDs to required data
    const influencerPayload: Array<{ handle: string; platform: PlatformEnum }> = [];
    const skippedInfluencers: { handle: string | null; reason: string }[] = [];

    for (const id of selectedIds) {
      const influencer = influencers.find(inf => inf.id === id);
      if (!influencer) {
        logger.warn(
          `[MarketplacePage] BulkAdd: Could not find influencer data for selected ID: ${id}`
        );
        skippedInfluencers.push({ handle: `ID ${id}`, reason: 'Data not found' });
        continue;
      }

      let platformToSubmit: PlatformEnum;
      if (appliedFilters.platforms && appliedFilters.platforms.length === 1) {
        platformToSubmit = appliedFilters.platforms[0];
      } else if (influencer.platforms && influencer.platforms.length > 0) {
        platformToSubmit = influencer.platforms[0];
        if (
          influencer.platforms.length > 1 &&
          !(appliedFilters.platforms && appliedFilters.platforms.length === 1)
        ) {
          logger.info(
            `[MarketplacePage] BulkAdd: Multiple platforms for ${influencer.handle}, using first: ${platformToSubmit}`
          );
        }
      } else {
        logger.error(
          `[MarketplacePage] BulkAdd: Cannot determine platform for influencer: ${influencer.handle} (ID: ${id})`
        );
        skippedInfluencers.push({ handle: influencer.handle, reason: 'Missing platform' });
        continue;
      }

      influencerPayload.push({
        handle: influencer.handle || 'Unknown Handle',
        platform: platformToSubmit,
      });
    }

    // Check if any influencers were skipped and inform user
    if (skippedInfluencers.length > 0) {
      const skippedHandles = skippedInfluencers.map(s => s.handle || 'Unknown').join(', ');
      toast.error(
        `Could not process: ${skippedHandles}. Reason(s): ${[...new Set(skippedInfluencers.map(s => s.reason))].join(', ')}`,
        {
          duration: 6000, // Longer duration for error message
        }
      );
      // Continue if some influencers are still valid
      if (influencerPayload.length === 0) {
        toast.dismiss(loadingToastId); // Dismiss loading if nothing to send
        setIsBulkAddingToCampaign(false);
        return; // Stop if no valid influencers left
      }
    }

    const payload = { influencers: influencerPayload };

    try {
      const response = await fetch(
        `/api/campaigns/${bulkSelectedCampaignId}/influencers/bulk-add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Bulk add operation completed.', { id: loadingToastId });
        setIsBulkAddDialogOpen(false); // Close dialog
        setSelectedIds([]); // Clear selection on success
        setBulkSelectedCampaignId(null); // Reset campaign selection
      } else {
        logger.error('[MarketplacePage] Failed to bulk add influencers:', result);
        toast.error(result.error || result.message || 'Failed to bulk add influencers.', {
          id: loadingToastId,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network or submission error';
      logger.error('[MarketplacePage] Error submitting bulk add:', err);
      toast.error(`Error: ${message}`, { id: loadingToastId });
    } finally {
      setIsBulkAddingToCampaign(false);
    }
  };
  // --- End handleBulkAddToCampaignSubmit ---

  // --- Effects ---
  useEffect(() => {
    fetchData(currentPage, appliedFilters, appliedSearchTerm);
  }, [currentPage, appliedFilters, appliedSearchTerm, fetchData]);

  // --- End Logic for Bulk Add Dialog is implicitly covered by the functions above/below ---

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

          {/* Bulk Add to Campaign Button and Dialog - NEW FOR TASK 2.2 */}
          {selectedIds.length > 0 && (
            <AlertDialog open={isBulkAddDialogOpen} onOpenChange={setIsBulkAddDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-white" // Applied requested styling
                  onClick={() => {
                    setBulkSelectedCampaignId(null); // Reset selection
                    // fetchBulkCampaignsForDropdown(); // Will be called by useEffect
                    setIsBulkAddDialogOpen(true);
                  }}
                  disabled={isLoading} // Disable if page is loading
                >
                  Add {selectedIds.length} to Campaign
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Add {selectedIds.length} Influencers to Campaign
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Select a campaign to add the selected influencers to.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2">
                  <label
                    htmlFor="bulk-campaign-select"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Campaign
                  </label>
                  {isFetchingBulkCampaigns ? (
                    <Skeleton className="h-10 w-full rounded-md" />
                  ) : bulkCampaignsList.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">
                      {isFetchingBulkCampaigns ? '' : 'No draft or active campaigns found.'}{' '}
                      {/* Avoid double message during fetch */}
                    </p>
                  ) : (
                    <Select
                      onValueChange={setBulkSelectedCampaignId}
                      value={bulkSelectedCampaignId || ''}
                      disabled={isFetchingBulkCampaigns}
                    >
                      <SelectTrigger id="bulk-campaign-select" className="w-full">
                        <SelectValue placeholder="Select a campaign..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bulkCampaignsList.map(campaign => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name}{' '}
                            <span className="text-xs opacity-70 ml-2">({campaign.status})</span>
                            {campaign.startDate && campaign.endDate && (
                              <span className="text-xs opacity-50 ml-2">
                                {new Date(campaign.startDate).toLocaleDateString()} -{' '}
                                {new Date(campaign.endDate).toLocaleDateString()}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setIsBulkAddDialogOpen(false)}
                    disabled={isBulkAddingToCampaign}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkAddToCampaignSubmit} // Wire up the handler here
                    disabled={
                      isBulkAddingToCampaign || isFetchingBulkCampaigns || !bulkSelectedCampaignId
                    }
                  >
                    {isBulkAddingToCampaign ? 'Adding...' : 'Add Influencers'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
