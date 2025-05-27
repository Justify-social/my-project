'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'; // Hooks for App Router
import { InfluencerProfileData } from '@/types/influencer';
import { logger } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton'; // Use actual Skeleton
import { Icon } from '@/components/ui/icon/icon'; // Assuming Icon component exists
import { ProfileHeader } from '@/components/features/influencers/ProfileHeader'; // Import the ProfileHeader component
// Import Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import ALL analytics components (existing + new)
import { OverallPerformanceSection } from '@/components/features/influencers/OverallPerformanceSection';
import AudienceAnalyticsSection from '@/components/features/influencers/AudienceAnalyticsSection';
import ContentAnalyticsSection from '@/components/features/influencers/ContentAnalyticsSection';
import DemographicsSection from '@/components/features/influencers/DemographicsSection';
import ContactAnalyticsSection from '@/components/features/influencers/ContactAnalyticsSection';
import PlatformSpecificSection from '@/components/features/influencers/PlatformSpecificSection';
import AdvancedAnalyticsSection from '@/components/features/influencers/AdvancedAnalyticsSection';
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
// Import Select components for the dialog -- NO LONGER NEEDED HERE FOR ADD TO CAMPAIGN
// import {
// Select,
// SelectContent,
// SelectItem,
// SelectTrigger,
// SelectValue,
// } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { ButtonAddToCampaign } from '@/components/ui/button-add-to-campaign'; // Import new component
import { Button } from '@/components/ui/button'; // Added Button import
import { Card, CardContent } from '@/components/ui/card';
// import { ProfilePageLayout } from '@/components/layouts/ProfilePageLayout';

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

// Enhanced skeleton with premium design
const ProfileSkeleton = () => (
  <div className="space-y-8">
    {/* Premium Header Skeleton */}
    <Card className="border border-border/50 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-8">
        <div className="flex items-center space-x-6">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-accent/20" />
          <div className="space-y-4 flex-1">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Enhanced Tabs Skeleton */}
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  </div>
);

// Enhanced error display
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Card className="border-destructive/20 bg-destructive/5 max-w-md">
      <CardContent className="p-6 text-center">
        <Icon
          iconId="faTriangleExclamationLight"
          className="h-12 w-12 text-destructive mx-auto mb-4"
        />
        <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Profile</h3>
        <p className="text-sm text-muted-foreground">
          {message || 'An unexpected error occurred.'}
        </p>
      </CardContent>
    </Card>
  </div>
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
  // const [isAddCampaignDialogOpen, setIsAddCampaignDialogOpen] = useState(false);
  // type CampaignType = {
  //   id: string;
  //   name: string;
  //   status: string;
  //   startDate?: string | null;
  //   endDate?: string | null;
  // };
  // const [campaignsList, setCampaignsList] = useState<CampaignType[]>([]);
  // const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  // const [selectedPlatformForCampaign, setSelectedPlatformForCampaign] =
  //   useState<PlatformEnum | null>(null);
  // const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  // const [isAddingToCampaign, setIsAddingToCampaign] = useState(false);
  // --- End State for "Add to Campaign" Dialog ---

  // --- Logic for "Add to Campaign" Dialog (Task 2.3) ---
  // const fetchCampaignsForDropdown = useCallback(async () => { ... });
  // useEffect(() => { ... }, [isAddCampaignDialogOpen, fetchCampaignsForDropdown]);
  // const handleAddToCampaignSubmit = async () => { ... };
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
        logger.error(`[ProfilePage] Fetch profile error for handle ${fetchHandle}:`, {
          error: message,
          originalError: err,
        });
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
    const generatingToastId = toast('Generating comprehensive risk report...');

    try {
      // Simulate delay for Sandbox/testing
      await new Promise(resolve => setTimeout(resolve, 4000)); // Use await with Promise for cleaner async simulation

      toast.success('Risk report ready. Opening...', { id: generatingToastId });
      window.open(sampleReportUrl, '_blank');
    } catch (error: unknown) {
      // Catch potential errors from setTimeout or window.open, though unlikely
      logger.error('[ProfilePage] Error during simulated report generation:', {
        error: (error as Error).message,
        originalError: error,
      });
      toast.error('An unexpected error occurred while preparing the report.', {
        id: generatingToastId,
      });
    } finally {
      setIsRequestingReport(false); // Re-enable button after process completes or fails
    }
  };

  return (
    // <ProfilePageLayout>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-6 space-y-8">
        {/* Enhanced Top Bar */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon iconId="faArrowLeftLight" className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>

          {!isLoading && !error && influencer && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-destructive/10 hover:border-destructive/20"
              >
                <Icon iconId="faTrashCanLight" className="mr-2 h-4 w-4" />
                Remove
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-interactive/10 hover:border-interactive/20"
              >
                <Icon iconId="faPenToSquareLight" className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRequestingReport}
                    className="hover:bg-warning/10 hover:border-warning/20"
                  >
                    <Icon iconId="faShieldLight" className="mr-2 h-4 w-4" />
                    {isRequestingReport ? 'Generating...' : 'Risk Report'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg">Request Risk Assessment</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                      Generate a comprehensive risk report analyzing this influencer's profile,
                      content, and potential brand safety concerns.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isRequestingReport}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRequestRiskReport}
                      disabled={isRequestingReport}
                      className="bg-warning hover:bg-warning/90"
                    >
                      Generate Report
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {influencer &&
                platformEnum &&
                influencer.profileId &&
                influencer.handle &&
                influencer.name && (
                  <ButtonAddToCampaign
                    influencerHandle={influencer.handle}
                    influencerName={influencer.name}
                    currentPlatform={platformEnum}
                    availablePlatforms={influencer.platforms}
                    onSuccess={(campaignId, campaignName) => {
                      toast.success(`${influencer?.name || 'Influencer'} added to ${campaignName}`);
                    }}
                  />
                )}
            </div>
          )}
        </div>
        {/* Content Area: Loading, Error, or Profile Structure */}
        {isLoading ? (
          <ProfileSkeleton />
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : influencer ? (
          <div className="space-y-8">
            {/* Enhanced Profile Header */}
            <ProfileHeader influencer={influencer} />

            {/* Enhanced Analytics Tabs */}
            <Tabs defaultValue="performance" className="w-full">
              <div className="border-b border-border/50 bg-card/50 rounded-t-lg p-1">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 gap-1 bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="performance"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faChartLineLight" className="mr-2 h-4 w-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger
                    value="audience"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faUsersLight" className="mr-2 h-4 w-4" />
                    Audience
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faImageLight" className="mr-2 h-4 w-4" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="demographics"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faChartPieLight" className="mr-2 h-4 w-4" />
                    Demographics
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faCreditCardLight" className="mr-2 h-4 w-4" />
                    Contact
                  </TabsTrigger>
                  <TabsTrigger
                    value="platform"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faGlobeLight" className="mr-2 h-4 w-4" />
                    Platform
                  </TabsTrigger>
                  <TabsTrigger
                    value="advanced"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faDiamondLight" className="mr-2 h-4 w-4" />
                    Advanced
                  </TabsTrigger>
                  <TabsTrigger
                    value="risk"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faShieldLight" className="mr-2 h-4 w-4" />
                    Risk
                  </TabsTrigger>
                  <TabsTrigger
                    value="campaigns"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium px-4 py-3 rounded-md"
                  >
                    <Icon iconId="faClipboardLight" className="mr-2 h-4 w-4" />
                    Campaigns
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="bg-card/30 border border-t-0 border-border/50 rounded-b-lg p-6">
                <TabsContent value="performance" className="mt-0">
                  <OverallPerformanceSection influencer={influencer} />
                </TabsContent>
                <TabsContent value="audience" className="mt-0">
                  <AudienceAnalyticsSection influencer={influencer} />
                </TabsContent>
                <TabsContent value="content" className="mt-0">
                  <ContentAnalyticsSection influencer={influencer} />
                </TabsContent>
                <TabsContent value="demographics" className="mt-0">
                  <DemographicsSection influencer={influencer} />
                </TabsContent>
                <TabsContent value="contact" className="mt-0">
                  <ContactAnalyticsSection influencer={influencer} />
                </TabsContent>
                <TabsContent value="platform" className="mt-0">
                  <PlatformSpecificSection influencer={influencer} />
                </TabsContent>
                <TabsContent value="advanced" className="mt-0">
                  <AdvancedAnalyticsSection influencer={influencer} />
                </TabsContent>
                <TabsContent value="risk" className="mt-0">
                  <div className="space-y-6">
                    <RiskScoreSection influencer={influencer} />
                    <CertificationStatusSection influencer={influencer} />
                  </div>
                </TabsContent>
                <TabsContent value="campaigns" className="mt-0">
                  <RecentCampaignsSection influencer={influencer} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          // Should not happen if error handles not found, but as fallback
          <ErrorDisplay message={'Influencer data could not be loaded.'} />
        )}
      </div>
    </div>
    // </ProfilePageLayout>
  );
}
