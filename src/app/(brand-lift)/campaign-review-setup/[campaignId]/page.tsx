'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CampaignReviewStudySetup from '@/components/features/brand-lift/CampaignReviewStudySetup';
// import { ConditionalLayout } from '@/components/ConditionalLayout'; // Assuming this is your layout component

const CampaignReviewSetupPage: React.FC = () => {
  const params = useParams();
  const campaignId = params?.campaignId as string | undefined;

  // Placeholder for ConditionalLayout or any other page layout structure
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    // <ConditionalLayout title="Brand Lift - Review & Setup" description="Review campaign details and set up your new Brand Lift study.">
    //   {children}
    // </ConditionalLayout>
    // For now, a simple div wrapper:
    <div className="container mx-auto py-8">{children}</div>
  );

  if (!campaignId) {
    // This case should ideally be handled by Next.js routing if the param is missing/invalid,
    // or redirect if necessary.
    return (
      <LayoutWrapper>
        <p className="text-red-500 text-center">Campaign ID is missing. Cannot load setup page.</p>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <CampaignReviewStudySetup campaignId={campaignId} />
    </LayoutWrapper>
  );
};

export default CampaignReviewSetupPage;
