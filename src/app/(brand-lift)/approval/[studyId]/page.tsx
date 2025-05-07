'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ApprovalWorkflow from '@/components/features/brand-lift/ApprovalWorkflow';
// import { ConditionalLayout } from '@/components/ConditionalLayout'; // Assuming this is your layout component
// import { useAuth } from '@clerk/nextjs'; // For getting currentUserId on client component page

const ApprovalPage: React.FC = () => {
  const params = useParams();
  const studyId = params?.studyId as string | undefined;
  // const { userId: currentUserId } = useAuth(); // Get actual current user ID via Clerk
  const currentUserId = 'user_mock_id_123'; // TODO: Replace with actual Clerk user ID

  // Placeholder for ConditionalLayout or any other page layout structure
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    // <ConditionalLayout title={`Brand Lift - Approval for Study ${studyId || ''}`} description="Review comments and approve the survey.">
    //   {children}
    // </ConditionalLayout>
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">{children}</div>
  );

  if (!studyId) {
    return (
      <LayoutWrapper>
        <p className="text-red-500 text-center">
          Study ID is missing. Cannot load approval workflow.
        </p>
      </LayoutWrapper>
    );
  }
  if (!currentUserId) {
    // This case might be handled by Clerk middleware redirecting to sign-in
    return (
      <LayoutWrapper>
        <p className="text-red-500 text-center">User not authenticated. Please sign in.</p>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <ApprovalWorkflow studyId={studyId} currentUserId={currentUserId} />
    </LayoutWrapper>
  );
};

export default ApprovalPage;
