'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ApprovalWorkflow from '@/components/features/brand-lift/ApprovalWorkflow';
import logger from '@/lib/logger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import { BrandLiftStudyData } from '@/types/brand-lift';
import BrandLiftPageSubtitle from '@/components/features/brand-lift/BrandLiftPageSubtitle';
import { Skeleton } from '@/components/ui/skeleton';

const ApprovalPage: React.FC = () => {
  const params = useParams();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

  const [studyDetails, setStudyDetails] = React.useState<Partial<BrandLiftStudyData> | null>(null);
  const [isLoadingStudyDetails, setIsLoadingStudyDetails] = React.useState(true);
  const [fetchErrorStudyDetails, setFetchErrorStudyDetails] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (studyId) {
      const fetchStudyDetails = async () => {
        setIsLoadingStudyDetails(true);
        setFetchErrorStudyDetails(null);
        try {
          const res = await fetch(`/api/brand-lift/surveys/${studyId}`);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch study details: ${res.statusText}`);
          }
          const data = await res.json();
          setStudyDetails(data);
        } catch (err: unknown) {
          logger.error('Error fetching study details for ApprovalPage:', {
            studyId,
            error: (err as Error).message,
          });
          setFetchErrorStudyDetails((err as Error).message);
        } finally {
          setIsLoadingStudyDetails(false);
        }
      };
      fetchStudyDetails();
    } else {
      setIsLoadingStudyDetails(false); // No studyId, so not loading
    }
  }, [studyId]);

  if (!studyId) {
    logger.error('Invalid study ID for approval page', { param: studyIdParam });
    return (
      <>
        <div className="container mx-auto p-4 text-center">
          <Alert variant="destructive">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Error: Missing Study ID</AlertTitle>
            <AlertDescription>
              The Study ID is missing from the URL. Cannot display approval workflow.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-2">Survey Approval Workflow</h1>
        {isLoadingStudyDetails && <Skeleton className="h-5 w-1/2" />}
        {fetchErrorStudyDetails && (
          <p className="text-sm text-destructive mt-1 mb-4">Error loading study details.</p>
        )}
        {!isLoadingStudyDetails && !fetchErrorStudyDetails && studyDetails && (
          <BrandLiftPageSubtitle
            campaignId={studyDetails.campaignId}
            campaignName={studyDetails.campaign?.campaignName}
            studyName={studyDetails.name}
            funnelStage={studyDetails.funnelStage}
          />
        )}
        {!isLoadingStudyDetails && studyDetails && <div className="mb-4"></div>}

        <ApprovalWorkflow studyId={studyId} />
      </div>
    </>
  );
};

export default ApprovalPage;
