'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ConditionalLayout from '@/components/layouts/conditional-layout';
import SurveyQuestionBuilder from '@/components/features/brand-lift/SurveyQuestionBuilder';
import logger from '@/lib/logger';

const SurveyDesignPage: React.FC = () => {
  const params = useParams();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

  if (!studyId) {
    logger.error('Invalid study ID in route parameter for survey design', { param: studyIdParam });
    return (
      <ConditionalLayout>
        <h1 className="text-2xl font-bold mb-6 text-destructive">Error</h1>
        <div className="text-red-600">Invalid Study ID. Please return to the previous page.</div>
      </ConditionalLayout>
    );
  }

  return (
    <ConditionalLayout>
      {/* Title can be managed within SurveyQuestionBuilder or here */}
      <h1 className="text-2xl font-bold mb-6">Survey Design: Build &amp; Refine Questions</h1>
      <SurveyQuestionBuilder studyId={studyId} />
    </ConditionalLayout>
  );
};

export default SurveyDesignPage;
