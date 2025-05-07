'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CampaignSelector from '@/components/features/brand-lift/CampaignSelector';
// import { ConditionalLayout } from '@/components/ConditionalLayout'; // Assuming this is your layout component

const CampaignSelectionPage: React.FC = () => {
  const router = useRouter();

  const handleCampaignSelection = (campaignId: string | number) => {
    if (campaignId) {
      router.push(`/brand-lift/campaign-review-setup/${campaignId}`);
    }
  };

  // Placeholder for ConditionalLayout or any other page layout structure
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    // <ConditionalLayout title="Brand Lift - Campaign Selection" description="Select a campaign to start your Brand Lift study.">
    //   {children}
    // </ConditionalLayout>
    // For now, a simple div wrapper:
    <div className="container mx-auto py-8">{children}</div>
  );

  return (
    <LayoutWrapper>
      <CampaignSelector onCampaignSelected={handleCampaignSelection} />
    </LayoutWrapper>
  );
};

export default CampaignSelectionPage;
