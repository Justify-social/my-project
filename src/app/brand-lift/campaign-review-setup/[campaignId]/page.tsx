'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import CampaignReviewStudySetup from '@/components/features/brand-lift/CampaignReviewStudySetup';
import logger from '@/lib/logger';

const CampaignReviewSetupPage: React.FC = () => {
  const params = useParams();
  const campaignIdParam = params?.campaignId;
  // campaignId is now directly the string from the route, or null if not a string
  const campaignId = typeof campaignIdParam === 'string' ? campaignIdParam : null;

  // Basic validation for campaignId
  if (!campaignId) {
    // Simplified check: if campaignId is null/undefined/empty string
    logger.error('Invalid or missing campaign ID in route parameter', { param: campaignIdParam });
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
      {/* Pass validated string campaignId to the main component */}
      <CampaignReviewStudySetup campaignId={campaignId} />
    </>
  );
};

export default CampaignReviewSetupPage;
