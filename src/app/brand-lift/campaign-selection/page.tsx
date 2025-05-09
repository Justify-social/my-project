'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CampaignSelector from '@/components/features/brand-lift/CampaignSelector';
import logger from '@/lib/logger';

const CampaignSelectionPage: React.FC = () => {
  const router = useRouter();

  const handleCampaignSelected = (campaignId: string | null) => {
    if (campaignId) {
      logger.info(`Campaign selected, navigating to review/setup for campaign ID: ${campaignId}`);
      router.push(`/brand-lift/campaign-review-setup/${campaignId}`);
    } else {
      logger.error('Invalid or no campaign ID received from selector:', {
        receivedCampaignId: campaignId,
      });
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Brand Lift Setup: Select Campaign</h1>
      <CampaignSelector onCampaignSelected={handleCampaignSelected} />
    </>
  );
};

export default CampaignSelectionPage;
