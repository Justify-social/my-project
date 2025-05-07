'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConditionalLayout from '@/components/layouts/conditional-layout';
import SurveyPreview from '@/components/features/brand-lift/SurveyPreview';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import logger from '@/lib/logger';

const SurveyPreviewSubmitPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  if (!studyId) {
    logger.error('Invalid study ID for survey preview page', { param: studyIdParam });
    return (
      <ConditionalLayout>
        <div className="container mx-auto p-4 text-center">
          <Alert variant="destructive">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Error: Missing Study ID</AlertTitle>
            <AlertDescription>
              The Study ID is missing from the URL. Please go back and try again.
            </AlertDescription>
          </Alert>
        </div>
      </ConditionalLayout>
    );
  }

  const handleSubmitForReview = async () => {
    if (!studyId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      logger.info(`Submitting study ${studyId} for review...`);
      const response = await fetch(`/api/brand-lift/surveys/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING_APPROVAL' }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to parse submission error' }));
        throw new Error(errorData.error || 'Failed to submit survey for review.');
      }

      logger.info(`Study ${studyId} submitted for review successfully.`);
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push(`/approval/${studyId}`);
      }, 1500);
    } catch (err: any) {
      logger.error('Error submitting survey for review', { studyId, error: err.message });
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConditionalLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Preview &amp; Submit Survey</h1>
          <Button
            onClick={handleSubmitForReview}
            disabled={isSubmitting || submitSuccess}
            size="lg"
          >
            {isSubmitting ? (
              <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Icon iconId="faPaperPlaneLight" className="mr-2 h-4 w-4" />
            )}
            {submitSuccess ? 'Submitted!' : 'Share for Initial Review'}
          </Button>
        </div>

        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert
            variant="default"
            className="mb-4 bg-green-50 border-green-300 text-green-700 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
          >
            <Icon iconId="faCheckCircleLight" className="h-4 w-4" />
            <AlertTitle className="text-green-800 dark:text-green-100">Success!</AlertTitle>
            <AlertDescription>
              Survey submitted for review. Redirecting to approval page...
            </AlertDescription>
          </Alert>
        )}

        {!submitSuccess && <SurveyPreview studyId={studyId} />}
      </div>
    </ConditionalLayout>
  );
};

export default SurveyPreviewSubmitPage;
