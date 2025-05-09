'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import SurveyQuestionBuilder from '@/components/features/brand-lift/SurveyQuestionBuilder';
import logger from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SurveyDesignPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

  if (!studyId) {
    logger.error('Invalid study ID in route parameter for survey design', { param: studyIdParam });
    return (
      <>
        <div className="container mx-auto p-4 text-center">
          <Alert variant="destructive">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Error: Missing Study ID</AlertTitle>
            <AlertDescription>
              Invalid Study ID. Please return to the previous page.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Survey Design: Build &amp; Refine Questions</h1>
        <Button onClick={() => router.push(`/brand-lift/survey-preview/${studyId}`)}>
          <Icon iconId="faEyeLight" className="mr-2 h-4 w-4" />
          Proceed to Preview
        </Button>
      </div>
      <SurveyQuestionBuilder studyId={studyId} />
    </>
  );
};

export default SurveyDesignPage;
