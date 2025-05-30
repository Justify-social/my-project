'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/icon/icon';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { Skeleton } from '@/components/ui/skeleton';

// Define a simple type for the fetched campaign data needed
interface CampaignSummary {
  id: string;
  name?: string | null;
}

// Skeleton specific to the SubmissionContent page
const SubmissionPageSkeleton = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6 bg-background">
    <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg border mb-8" />
    <Skeleton className="h-10 md:h-12 w-3/4 md:w-1/2 rounded mb-4" />
    <Skeleton className="h-6 w-full max-w-lg rounded mb-8" />
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      <Skeleton className="h-12 flex-1 rounded-lg" />
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <Skeleton className="h-12 flex-1 rounded-lg" />
        <Skeleton className="h-12 flex-1 rounded-lg" />
      </div>
    </div>
  </div>
);

export default function SubmissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get('id'); // Get ID from URL
  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch minimal campaign data using the ID from URL
  useEffect(() => {
    const fetchCampaignSummary = async () => {
      if (!campaignId) {
        logger.error('[SubmissionContent] No campaign ID found in URL.');
        setError('Campaign ID is missing.');
        setIsLoading(false);
        return;
      }

      logger.info(`[SubmissionContent] Fetching campaign summary for ID: ${campaignId}`);
      setIsLoading(true);
      setError(null);

      try {
        // Assuming the general GET endpoint fetches the necessary fields (id, name)
        const response = await fetch(`/api/campaigns/${campaignId}`); // Corrected fetch call
        if (!response.ok) {
          throw new Error(`Failed to fetch campaign data: ${response.status}`);
        }
        const apiResponse = await response.json();
        const data = apiResponse.data || apiResponse;

        if (!data || typeof data !== 'object' || !data.id) {
          // Check if data and data.id exist
          throw new Error('Invalid campaign data received');
        }

        // Set only the needed fields
        setCampaign({ id: data.id, name: data.name });
        logger.info('[SubmissionContent] Successfully fetched campaign summary.');
      } catch (err: unknown) {
        const errorDetails = { error: err instanceof Error ? err.message : String(err) };
        logger.error('[SubmissionContent] Error fetching campaign summary:', errorDetails);
        setError(err instanceof Error ? err.message : 'Failed to load campaign details.');
        setCampaign(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignSummary();
  }, [campaignId]); // Dependency is the campaignId from URL

  // --- Loading State ---
  if (isLoading) {
    return <SubmissionPageSkeleton />;
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="text-center py-10 px-4 sm:px-6 text-destructive">
        <p>Error loading campaign details: {error}</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 sm:p-6 bg-background">
      <Icon
        iconId="faCircleCheckSolid"
        className="w-16 h-16 md:w-20 md:h-20 text-accent mb-8 drop-shadow-lg"
      />
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-primary">
        Campaign Submitted!
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 px-2">
        Your campaign "
        <span className="font-semibold text-foreground">{campaign?.name || '...'}</span>" has been
        successfully submitted and is now in review.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
        <Button
          variant="default"
          size="lg"
          className="w-full sm:w-auto shadow-lg bg-accent hover:bg-accent/90 text-primary-foreground flex-1 sm:flex-none py-3 text-base"
          onClick={() => router.push(`/brand-lift/campaign-selection?campaignId=${campaignId}`)}
          disabled={!campaignId}
        >
          <Icon iconId="faChartLineLight" className="mr-2" />
          Start Brand Lift
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto bg-background/80 flex-1 sm:flex-none py-3 text-base"
          onClick={() => router.push('/campaigns')}
        >
          <Icon iconId="faClipboardLight" className="mr-2" />
          View Campaigns
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto flex-1 sm:flex-none py-3 text-base"
          onClick={() => router.push('/dashboard')}
        >
          <Icon iconId="faHouseLight" className="mr-2" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
