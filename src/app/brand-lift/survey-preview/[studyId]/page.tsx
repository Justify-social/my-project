'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SurveyPreview from '@/components/features/brand-lift/SurveyPreview';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import logger from '@/lib/logger';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';

const SurveyPreviewSubmitPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!studyId) {
    logger.error('Invalid study ID for survey preview page', { param: studyIdParam });
    return (
      <>
        <div className="container mx-auto p-4 text-center">
          <Alert variant="destructive">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Error: Missing Study ID</AlertTitle>
            <AlertDescription>
              The Study ID is missing from the URL. Please go back and try again.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const handleSubmitForReview = async () => {
    if (!studyId) return;
    setIsSubmitting(true);
    setSubmitError(null);
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
      showSuccessToast(
        'Survey submitted for review. Redirecting to approval page...',
        'faPaperPlaneLight'
      );
      router.push(`/brand-lift/approval/${studyId}`);
    } catch (err: any) {
      logger.error('Error submitting survey for review', { studyId, error: err.message });
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Preview &amp; Submit Survey</h1>
          <Button onClick={handleSubmitForReview} disabled={isSubmitting} size="lg">
            {isSubmitting ? (
              <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Icon iconId="faPaperPlaneLight" className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Share for Initial Review'}
          </Button>
        </div>

        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {!isSubmitting && !submitError && <SurveyPreview studyId={studyId} />}
      </div>
    </>
  );
};

export default SurveyPreviewSubmitPage;
