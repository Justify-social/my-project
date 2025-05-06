'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'; // Hooks for App Router
import { influencerService } from '@/services/influencer';
import { InfluencerProfileData } from '@/types/influencer';
import ConditionalLayout from '@/components/layouts/conditional-layout'; // Assuming layout component
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { Skeleton } from '@/components/ui/skeleton'; // Use actual Skeleton
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Use actual Alert
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component exists
import { ProfileHeader } from '@/components/features/influencers/ProfileHeader'; // Import the ProfileHeader component
// Import Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import Section components
import { OverallPerformanceSection } from '@/components/features/influencers/OverallPerformanceSection';
import { CertificationStatusSection } from '@/components/features/influencers/CertificationStatusSection';
import { RiskScoreSection } from '@/components/features/influencers/RiskScoreSection';
import { RecentCampaignsSection } from '@/components/features/influencers/RecentCampaignsSection';
// import { LoadingSkeleton } from '@/components/ui/loading-skeleton'; // TODO: Import Skeleton component
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // TODO: Import Alert component
// TODO: Import ProfileHeader and Profile Details components later (Tickets 2.2, 2.4)
import { PlatformEnum } from '@/types/enums'; // Need this type
// --- Import Alert Dialog for Risk Report ---
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
// Import Select components for the dialog
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

// Helper function to get enum key from value (case-insensitive)
function getPlatformEnumFromString(value: string | null): PlatformEnum | null {
  if (!value) return null;
  const upperValue = value.toUpperCase(); // Match against uppercase enum values
  for (const key in PlatformEnum) {
    // Check if the key is a valid enum member (not a number for reverse mapping)
    // and if its value matches the input string (case-insensitive)
    if (
      isNaN(Number(key)) &&
      PlatformEnum[key as keyof typeof PlatformEnum].toUpperCase() === upperValue
    ) {
      return PlatformEnum[key as keyof typeof PlatformEnum];
    }
  }
  return null; // Not found
}

// Define a simple skeleton placeholder
const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    {/* Tabs/Details Skeleton */}
    <div className="space-y-4 p-4 border rounded-lg">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-40 w-full" />
    </div>
    <div className="space-y-4 p-4 border rounded-lg">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);

// Define a simple error display
const ErrorDisplay = ({ message }: { message: string }) => (
  <Alert variant="destructive">
    {/* <Icon name="triangle-exclamation" className="h-4 w-4" /> */}
    <AlertTitle>Error Loading Profile</AlertTitle>
    <AlertDescription>{message || 'An unexpected error occurred.'}</AlertDescription>
  </Alert>
);

export default function InfluencerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams(); // Need this again for platform

  // Extract handle from path parameter
  const handle = params?.username ? decodeURIComponent(params.username as string) : null;
  // Read 'platform' query param as string
  const platformString = searchParams?.get('platform') || null;

  // Use the helper function for conversion
  const platformEnum = getPlatformEnumFromString(platformString);

  const [influencer, setInfluencer] = useState<InfluencerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // --- Add State for Risk Report Dialog ---
  const [isRequestingReport, setIsRequestingReport] = useState(false);

  // --- State for "Add to Campaign" Dialog (Task 2.1) ---
  const [isAddCampaignDialogOpen, setIsAddCampaignDialogOpen] = useState(false);
  // Define a simple type for campaigns in the dropdown - Updated for dates
  type CampaignType = {
    id: string;
    name: string;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
  };
  const [campaignsList, setCampaignsList] = useState<CampaignType[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedPlatformForCampaign, setSelectedPlatformForCampaign] =
    useState<PlatformEnum | null>(null);
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  const [isAddingToCampaign, setIsAddingToCampaign] = useState(false);
  // --- End State for "Add to Campaign" Dialog ---

  // --- Logic for "Add to Campaign" Dialog (Task 2.3) ---
  const fetchCampaignsForDropdown = useCallback(async () => {
    if (!isAddCampaignDialogOpen) return; // Don't fetch if dialog is not open
    // Potentially, don't refetch if campaignsList already has items, unless a refresh is explicitly desired.
    // For now, it refetches every time dialog opens and list is empty or we decide to always refresh.
    // if (campaignsList.length > 0 && !forceRefresh) return;

    logger.info('[ProfilePage] Fetching campaigns for Add to Campaign dialog...');
    setIsFetchingCampaigns(true);
    try {
      const response = await fetch('/api/campaigns/selectable-list');
      const data = await response.json();
      if (response.ok && data.success) {
        setCampaignsList(data.data || []);
        if (data.data.length === 0) {
          toast('No draft or active campaigns available to add this influencer to.');
        }
      } else {
        logger.error('[ProfilePage] Failed to fetch selectable campaigns:', data.error);
        toast.error(data.error || 'Failed to load campaigns for dropdown.');
        setCampaignsList([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network or fetch error';
      logger.error('[ProfilePage] Error fetching selectable campaigns:', err);
      toast.error(`Failed to load campaigns: ${message}`);
      setCampaignsList([]);
    } finally {
      setIsFetchingCampaigns(false);
    }
  }, [isAddCampaignDialogOpen]);

  // Effect to fetch campaigns when the dialog opens
  useEffect(() => {
    if (isAddCampaignDialogOpen) {
      fetchCampaignsForDropdown();
    }
  }, [isAddCampaignDialogOpen, fetchCampaignsForDropdown]);

  const handleAddToCampaignSubmit = async () => {
    if (!selectedCampaignId || !influencer) {
      toast.error('Please select a campaign and ensure influencer data is loaded.');
      return;
    }

    let platformToSubmit: PlatformEnum;
    if (influencer.platforms && influencer.platforms.length > 1) {
      if (!selectedPlatformForCampaign) {
        toast.error('Please select a platform for this campaign.');
        return;
      }
      platformToSubmit = selectedPlatformForCampaign;
    } else if (influencer.platforms && influencer.platforms.length === 1) {
      platformToSubmit = influencer.platforms[0];
    } else {
      // This case should ideally not happen if influencer data is valid and has at least one platform.
      // However, as a fallback, try to use the platformEnum from page params if available or error out.
      if (platformEnum) {
        // platformEnum is the one derived from URL query param for the page itself
        platformToSubmit = platformEnum;
        logger.warn('[ProfilePage] AddToCampaign: Using page-level platformEnum as fallback.', {
          platformToSubmit,
        });
      } else {
        toast.error('Influencer platform information is missing.');
        logger.error(
          '[ProfilePage] AddToCampaign: Influencer platform data is critically missing.',
          { influencerPlatforms: influencer.platforms }
        );
        return;
      }
    }

    // Payload now only needs handle and platform
    const payload = {
      handle: influencer.handle,
      platform: platformToSubmit,
    };

    logger.info('[ProfilePage] Submitting Add to Campaign:', {
      campaignId: selectedCampaignId,
      payload,
    });
    setIsAddingToCampaign(true);
    const addCampaignToastId = toast('Adding influencer to campaign...');

    try {
      const response = await fetch(`/api/campaigns/${selectedCampaignId}/influencers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Influencer added to campaign successfully!', {
          id: addCampaignToastId,
        });
        setIsAddCampaignDialogOpen(false); // Close dialog on success
        // Optionally reset selections, though dialog closing might be enough
        // setSelectedCampaignId(null);
        // setSelectedPlatformForCampaign(null);
      } else {
        logger.error('[ProfilePage] Failed to add influencer to campaign:', result);
        toast.error(result.error || result.message || 'Failed to add influencer.', {
          id: addCampaignToastId,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network or submission error';
      logger.error('[ProfilePage] Error submitting Add to Campaign:', err);
      toast.error(`Error: ${message}`, { id: addCampaignToastId });
    } finally {
      setIsAddingToCampaign(false);
    }
  };
  // --- End Logic for "Add to Campaign" Dialog ---

  // Data Fetching Logic - Updated to use handle AND platformEnum for new API route
  const fetchData = useCallback(
    async (fetchHandle: string, fetchPlatformEnum: PlatformEnum | null) => {
      // Check handle and platformEnum
      if (!fetchHandle || !fetchPlatformEnum) {
        logger.warn('[ProfilePage] Missing required handle or valid platformEnum', {
          handle: fetchHandle,
          platformEnum: fetchPlatformEnum,
        });
        setError('Invalid parameters for profile lookup.');
        setIsLoading(false);
        return;
      }

      logger.info(
        `[ProfilePage] Fetching profile data for handle: ${fetchHandle}, platform: ${fetchPlatformEnum}`
      );
      setIsLoading(true);
      setError(null);
      setInfluencer(null);

      // Construct API URL using handle and platform enum string
      const queryParams = new URLSearchParams();
      queryParams.append('handle', fetchHandle);
      queryParams.append('platform', fetchPlatformEnum);
      const apiUrl = `/api/influencers/fetch-profile?${queryParams.toString()}`;

      logger.debug(`[ProfilePage] Constructed Profile API URL: ${apiUrl}`);

      try {
        const response = await fetch(apiUrl); // Using GET
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          logger.error(`[ProfilePage] Profile API error response: ${response.status}`, errorData);
          setError(`Failed to load profile: ${errorData?.error || response.statusText}`);
          return;
        }
        const data = await response.json();
        if (data.success && data.data) {
          logger.info(`[ProfilePage] Profile data fetched successfully for handle: ${fetchHandle}`);
          setInfluencer(data.data as InfluencerProfileData);
        } else {
          logger.warn(`[ProfilePage] Profile data not found for handle: ${fetchHandle}`, data);
          setError('Influencer profile not found.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Network or fetch error';
        logger.error(`[ProfilePage] Fetch profile error for handle ${fetchHandle}:`, err);
        setError(`Failed to load profile: ${message}`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch data when handle OR platformEnum changes
  useEffect(() => {
    if (handle && platformEnum) {
      fetchData(handle, platformEnum);
    } else if (handle && !platformEnum && platformString) {
      // Handle case where platform string was invalid
      logger.error(`[ProfilePage] Invalid platform query parameter received: ${platformString}`);
      setError(`Invalid platform specified: ${platformString}`);
      setIsLoading(false);
    }
  }, [handle, platformEnum, platformString, fetchData]);

  // Log the platformSpecificId once influencer data is loaded
  useEffect(() => {
    if (influencer) {
      logger.info(
        `[ProfilePage] Influencer data loaded. platformSpecificId: ${influencer.platformSpecificId}, profileId (unique ID): ${influencer.profileId}`
      );
    }
  }, [influencer]);

  // --- Handler for Risk Report (Simplified for Sandbox Testing) ---
  const handleRequestRiskReport = async () => {
    // Basic check for influencer data still useful
    if (!influencer?.id) {
      logger.error('[ProfilePage] Cannot request risk report: Missing influencer ID.');
      toast.error('Cannot request report: Influencer identifier is missing.');
      return;
    }
    setIsRequestingReport(true);

    const sampleReportUrl = '/Jonathan+Mark+Doe.pdf'; // Relative path in /public

    // Directly simulate the async process and show PDF
    const generatingToastId = toast('Generating sample report...');

    try {
      // Simulate delay for Sandbox/testing
      await new Promise(resolve => setTimeout(resolve, 4000)); // Use await with Promise for cleaner async simulation

      toast.success('Sample report ready. Opening...', { id: generatingToastId });
      window.open(sampleReportUrl, '_blank');
    } catch (error) {
      // Catch potential errors from setTimeout or window.open, though unlikely
      logger.error('[ProfilePage] Error during simulated report generation:', error);
      toast.error('An unexpected error occurred while preparing the sample report.', {
        id: generatingToastId,
      });
    } finally {
      setIsRequestingReport(false); // Re-enable button after process completes or fails
    }
  };

  return (
    // REMOVE ConditionalLayout wrapper - it's provided by RootLayout
    // <ConditionalLayout>
    <div className="p-4 md:p-6 space-y-4">
      {/* Top Bar: Back Button & Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <Icon iconId="faArrowLeftLight" className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
        {/* Action Buttons - Rendered when data is loaded */}
        {!isLoading && !error && influencer && (
          <div className="flex items-center gap-2">
            {/* Enable Buttons */}
            <Button variant="outline" size="sm">
              Remove Influencer
            </Button>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>

            {/* Risk Report Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isRequestingReport}>
                  {isRequestingReport ? 'Requesting...' : 'Request Risk Report'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Request Influencer Risk Report</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will trigger a background check to review the influencer's profile
                    and content for any potential risks, such as inappropriate material or harmful
                    associations, based on set criteria. The full report will be generated once the
                    check is complete.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isRequestingReport}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRequestRiskReport}
                    disabled={isRequestingReport}
                  >
                    Confirm & Request Report
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Enable Add to Campaign Button - MODIFIED FOR TASK 2.2 */}
            <AlertDialog open={isAddCampaignDialogOpen} onOpenChange={setIsAddCampaignDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-white"
                  onClick={() => {
                    setSelectedCampaignId(null);
                    setSelectedPlatformForCampaign(null);
                    setIsAddCampaignDialogOpen(true);
                  }}
                  disabled={isLoading || !influencer}
                >
                  Add to Campaign
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Add {influencer?.name || 'Influencer'} to Campaign
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Select a campaign and platform (if applicable) to add this influencer.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                  <div>
                    <label
                      htmlFor="campaign-select"
                      className="block text-sm font-medium text-gray-900 mb-1"
                    >
                      Campaign
                    </label>
                    {isFetchingCampaigns ? (
                      <Skeleton className="h-10 w-full rounded-md" />
                    ) : campaignsList.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">
                        No draft or active campaigns found.
                      </p>
                    ) : (
                      <Select
                        onValueChange={setSelectedCampaignId}
                        value={selectedCampaignId || ''}
                        disabled={isFetchingCampaigns || campaignsList.length === 0}
                      >
                        <SelectTrigger id="campaign-select" className="w-full">
                          <SelectValue placeholder="Select a campaign..." />
                        </SelectTrigger>
                        <SelectContent>
                          {campaignsList.map(campaign => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.name}{' '}
                              <span className="text-xs opacity-70 ml-2">({campaign.status})</span>
                              {/* Display Dates - New */}
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

                  {influencer && influencer.platforms && influencer.platforms.length > 1 && (
                    <div>
                      <label
                        htmlFor="platform-select"
                        className="block text-sm font-medium text-gray-900 mb-1"
                      >
                        Platform for this Campaign
                      </label>
                      <Select
                        onValueChange={value =>
                          setSelectedPlatformForCampaign(value as PlatformEnum)
                        }
                        value={selectedPlatformForCampaign || ''}
                        disabled={!influencer} // Should generally not be disabled if rendered, but defensive.
                      >
                        <SelectTrigger id="platform-select" className="w-full">
                          <SelectValue placeholder="Select platform..." />
                        </SelectTrigger>
                        <SelectContent>
                          {influencer.platforms.map(platformValue => (
                            <SelectItem key={platformValue} value={platformValue}>
                              {platformValue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setIsAddCampaignDialogOpen(false)}
                    disabled={isAddingToCampaign}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAddToCampaignSubmit}
                    disabled={
                      isAddingToCampaign ||
                      isFetchingCampaigns ||
                      !selectedCampaignId ||
                      (influencer &&
                        influencer.platforms &&
                        influencer.platforms.length > 1 &&
                        !selectedPlatformForCampaign)
                    }
                  >
                    {isAddingToCampaign ? 'Adding...' : 'Add to Campaign'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Content Area: Loading, Error, or Profile Structure */}
      {isLoading ? (
        <ProfileSkeleton />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : influencer ? (
        <div className="space-y-6">
          {/* --- Render Profile Header --- */}
          <ProfileHeader influencer={influencer} />

          {/* --- Profile Details Tabs --- */}
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              {' '}
              {/* Adjust grid-cols based on number of tabs */}
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="risk">Risk Score</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              {/* TODO: Add Audience/Content tabs later */}
            </TabsList>
            <TabsContent value="performance">
              <OverallPerformanceSection influencer={influencer} />
            </TabsContent>
            <TabsContent value="certifications">
              <CertificationStatusSection influencer={influencer} />
            </TabsContent>
            <TabsContent value="risk">
              <RiskScoreSection influencer={influencer} />
            </TabsContent>
            <TabsContent value="campaigns">
              <RecentCampaignsSection influencer={influencer} />
            </TabsContent>
            {/* TODO: Add Audience/Content TabsContent later */}
          </Tabs>
        </div>
      ) : (
        // Should not happen if error handles not found, but as fallback
        <ErrorDisplay message={'Influencer data could not be loaded.'} />
      )}
    </div>
    // </ConditionalLayout>
  );
}
