'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ApprovalWorkflow from '@/components/features/brand-lift/ApprovalWorkflow';
import logger from '@/lib/logger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';

const ApprovalPage: React.FC = () => {
  const params = useParams();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

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
        <h1 className="text-2xl font-bold mb-6">Survey Approval Workflow</h1>
        <ApprovalWorkflow studyId={studyId} />
      </div>
    </>
  );
};

export default ApprovalPage;
