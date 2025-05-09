'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CampaignReviewStudySetup from '@/components/features/brand-lift/CampaignReviewStudySetup';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import logger from '@/lib/logger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';

const CampaignReviewSetupPage: React.FC = () => {
  const params = useParams();
  // params can be null or { campaignId: string | string[] } initially
  const campaignIdParam = params?.campaignId;
  const campaignId = typeof campaignIdParam === 'string' ? parseInt(campaignIdParam, 10) : null;

  // Basic validation for campaignId
  if (campaignId === null || isNaN(campaignId)) {
    logger.error('Invalid campaign ID in route parameter', { param: campaignIdParam });
    // Render an error state or redirect
    return (
      <>
        <h1 className="text-2xl font-bold mb-6 text-destructive">Error</h1>
        <div className="text-red-600">
          Invalid Campaign ID provided in the URL. Please go back and select a valid campaign.
        </div>
      </>
    );
  }

  return (
    <>
      {/* Pass validated numeric campaignId to the main component */}
      {/* Add a Suspense boundary or loading check if CampaignReviewStudySetup fetches data internally */}
      <CampaignReviewStudySetup campaignId={campaignId} />
    </>
  );
};

export default CampaignReviewSetupPage;
