'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import SurveyQuestionBuilder, {
  SurveyQuestionBuilderRef,
} from '@/components/features/brand-lift/SurveyQuestionBuilder';
import logger from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon/icon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconButtonAction } from '@/components/ui/button-icon-action';
import { BrandLiftStudyData } from '@/types/brand-lift';
import { Skeleton } from '@/components/ui/skeleton';

const SurveyDesignPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const studyIdParam = params?.studyId;
  const studyId = typeof studyIdParam === 'string' ? studyIdParam : null;

  // State for study details
  const [studyDetails, setStudyDetails] = React.useState<Partial<BrandLiftStudyData> | null>(null);
  const [isLoadingStudyDetails, setIsLoadingStudyDetails] = React.useState(true);
  const [fetchErrorStudyDetails, setFetchErrorStudyDetails] = React.useState<string | null>(null);
  const [isAISuggesting, setIsAISuggesting] = React.useState(false); // Moved from SurveyQuestionBuilder for parent control
  const [actionsDisabled, setActionsDisabled] = React.useState(true); // Initialize as true

  // Ref for SurveyQuestionBuilder methods
  const surveyBuilderRef = React.useRef<SurveyQuestionBuilderRef>(null);

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
        } catch (err: any) {
          logger.error('Error fetching study details for SurveyDesignPage:', {
            studyId,
            error: err.message,
          });
          setFetchErrorStudyDetails(err.message);
        } finally {
          setIsLoadingStudyDetails(false);
          setActionsDisabled(false); // Enable actions once initial load attempt is complete
        }
      };
      fetchStudyDetails();
    }
  }, [studyId]);

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
      <div className="mb-6">
        <div className="flex justify-between items-center">
          {' '}
          {/* Container for title and buttons */}
          <h1 className="text-2xl font-bold">Survey Design</h1>
          <div className="flex gap-2 flex-wrap">
            {' '}
            {/* Buttons moved here */}
            <Button
              variant="outline"
              onClick={() => surveyBuilderRef.current?.handleSuggestQuestions()}
              disabled={actionsDisabled || isAISuggesting} // Use state from SurveyDesignPage
              title={
                actionsDisabled && !isAISuggesting
                  ? 'Loading data...'
                  : isAISuggesting
                    ? 'AI is suggesting...'
                    : 'Suggest questions using AI'
              } // Adjust title as needed
            >
              {isAISuggesting ? (
                <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Icon iconId="faSparklesLight" className="mr-2 h-4 w-4" />
              )}
              Draft
            </Button>
            <Button
              onClick={() => surveyBuilderRef.current?.handleAddQuestion()}
              disabled={actionsDisabled} // Use state from SurveyDesignPage
              title={actionsDisabled ? 'Loading data...' : 'Add new question'}
            >
              <Icon iconId="faPlusLight" className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        </div>

        {/* Campaign Link Section - make entire div clickable if desired, or keep <a> around icon+text */}
        {isLoadingStudyDetails && !studyDetails && <Skeleton className="h-5 w-1/2 mt-2 mb-2" />}
        {fetchErrorStudyDetails && (
          <p className="text-sm text-destructive mt-1 mb-2">Error loading campaign name.</p>
        )}
        {!isLoadingStudyDetails &&
          studyDetails?.campaign?.campaignName &&
          studyDetails?.campaignId && (
            <a // Make the whole area a link
              href={`/campaigns/${studyDetails.campaignId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 mb-2 text-sm text-muted-foreground flex items-center hover:underline w-fit" // w-fit to make it only as wide as content
              title="View Campaign Profile"
            >
              <span>Study for Campaign: {studyDetails.campaign.campaignName}</span>
              <IconButtonAction
                iconBaseName="faClipboard"
                ariaLabel="View Campaign Profile"
                hoverColorClass="text-accent-dark"
                className="p-1 h-auto inline-flex text-accent hover:text-accent-dark ml-2" // Added ml-2
              />
            </a>
          )}
      </div>
      <SurveyQuestionBuilder
        studyId={studyId}
        ref={surveyBuilderRef}
        onIsAISuggestingChange={setIsAISuggesting} // Pass setter to child
      />
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <Button onClick={() => router.push(`/brand-lift/survey-preview/${studyId}`)}>
          Proceed to Preview
        </Button>
      </div>
    </>
  );
};

export default SurveyDesignPage;
