'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import SurveyQuestionBuilder from '@/components/features/brand-lift/SurveyQuestionBuilder';
// import { ConditionalLayout } from '@/components/ConditionalLayout'; // Assuming this is your layout component

const SurveyDesignPage: React.FC = () => {
  const params = useParams();
  const studyId = params?.studyId as string | undefined;

  // Placeholder for ConditionalLayout or any other page layout structure
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    // <ConditionalLayout title="Brand Lift - Survey Design" description="Build and design your survey questions.">
    //   {children}
    // </ConditionalLayout>
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      {/* TODO: Add breadcrumbs or back navigation here if needed */}
      {children}
    </div>
  );

  if (!studyId) {
    return (
      <LayoutWrapper>
        <p className="text-red-500 text-center">
          Study ID is missing. Cannot load survey designer.
        </p>
      </LayoutWrapper>
    );
  }

  // TODO: Fetch campaign creative context if needed for the builder display
  // const campaignCreative = { type: 'image', url: '/placeholder-campaign-creative.jpg' }; // Example

  return (
    <LayoutWrapper>
      <SurveyQuestionBuilder
        studyId={studyId}
        // campaignCreative={campaignCreative} // Pass creative context if fetched
      />
    </LayoutWrapper>
  );
};

export default SurveyDesignPage;
