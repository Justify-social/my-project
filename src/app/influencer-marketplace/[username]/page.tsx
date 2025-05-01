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
  const searchParams = useSearchParams();

  // Extract handle from path parameter
  const handle = params?.username ? decodeURIComponent(params.username as string) : null;
  // Extract platformId from query parameter
  const platformId = searchParams?.get('platformId') || null;

  const [influencer, setInfluencer] = useState<InfluencerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data Fetching Logic - Uses handle and platformId
  const fetchData = useCallback(async (fetchHandle: string, fetchPlatformId: string) => {
    if (!fetchHandle || !fetchPlatformId) {
      logger.warn('[ProfilePage] Missing required handle or platformId', {
        handle: fetchHandle,
        platformId: fetchPlatformId,
      });
      setError('Invalid handle or platform ID for profile lookup.');
      setIsLoading(false);
      return;
    }

    logger.info(
      `[ProfilePage] Fetching analytics data for handle: ${fetchHandle}, platformId: ${fetchPlatformId}`
    );
    setIsLoading(true);
    setError(null);
    setInfluencer(null); // Clear previous data

    // Construct the NEW backend API endpoint URL
    const queryParams = new URLSearchParams();
    queryParams.append('identifier', fetchHandle); // Pass handle as 'identifier' query param
    queryParams.append('platformId', fetchPlatformId);
    const apiUrl = `/api/influencers/analytics?${queryParams.toString()}`;

    logger.debug(`[ProfilePage] Constructed Analytics API URL: ${apiUrl}`);

    try {
      // We will use GET for simplicity here, assuming the new backend route handles GET
      // If POST is strictly needed for the backend route, adjust this fetch call
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error(`[ProfilePage] Analytics API error response: ${response.status}`, errorData);
        setError(`Failed to load profile analytics: ${errorData?.error || response.statusText}`);
        return;
      }
      const data = await response.json();
      // Assuming the analytics API returns the full profile data structure needed
      if (data.success && data.data) {
        logger.info(`[ProfilePage] Analytics data fetched successfully for handle: ${fetchHandle}`);
        // TODO: Potentially map the analytics response to InfluencerProfileData if needed
        setInfluencer(data.data as InfluencerProfileData);
      } else {
        logger.warn(`[ProfilePage] Analytics data not found for handle: ${fetchHandle}`, data);
        setError('Influencer analytics not found.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network or fetch error';
      logger.error(`[ProfilePage] Fetch analytics error for handle ${fetchHandle}:`, err);
      setError(`Failed to load profile analytics: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when handle or platformId changes
  useEffect(() => {
    if (handle && platformId) {
      fetchData(handle, platformId);
    }
    // Ensure fetchData is stable or included if it depends on changing state
  }, [handle, platformId, fetchData]);

  // Log the platformSpecificId once influencer data is loaded
  useEffect(() => {
    if (influencer) {
      logger.info(
        `[ProfilePage] Influencer data loaded. platformSpecificId: ${influencer.platformSpecificId}, profileId (unique ID): ${influencer.profileId}`
      );
    }
  }, [influencer]);

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
        {/* Placeholder for Action Buttons - Render conditionally based on data load? */}
        {!isLoading && !error && influencer && (
          <div className="flex items-center gap-2">
            {/* Buttons based on individual-influencer-profile.png (brand view) */}
            <Button variant="outline" size="sm">
              Remove Influencer
            </Button>
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
            <Button variant="outline" size="sm">
              Download Report
            </Button>
            <Button size="sm">Add to Campaign</Button>
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
