'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrandLiftStudyData, CreativeDataProps, BrandLiftStudyStatus } from '@/types/brand-lift';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SurveyQuestionPreviewList } from '@/components/features/brand-lift/SurveyQuestionPreviewList';
import { PhoneShell } from '@/components/ui/phone-shell';
import { PlatformScreenWrapper } from '@/components/features/brand-lift/previews/PlatformScreenWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import logger from '@/lib/logger';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';

type PlatformView = 'Generic' | 'TikTok' | 'Instagram' | 'Desktop';

const SurveyPreviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const studyId = params?.studyId as string;

  const [studyDetails, setStudyDetails] = useState<BrandLiftStudyData | null>(null);
  const [creativeDetails, setCreativeDetails] = useState<CreativeDataProps | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformView>('Generic');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchData = useCallback(async () => {
    if (!studyId) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch Study Details (includes campaignId and questions)
      const studyRes = await fetch(`/api/brand-lift/surveys/${studyId}/preview-details`);
      if (!studyRes.ok) {
        const errorData = await studyRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch study details: ${studyRes.statusText}`);
      }
      const fetchedStudyDetails: BrandLiftStudyData = await studyRes.json();
      setStudyDetails(fetchedStudyDetails);

      // If campaignId is available, fetch Creative Details
      if (fetchedStudyDetails.campaignId) {
        const creativeRes = await fetch(
          `/api/campaigns/${fetchedStudyDetails.campaignId}/creative-details`
        );
        if (!creativeRes.ok) {
          // Non-critical if creative details fail, log and continue with study details
          const creativeErrorData = await creativeRes.json().catch(() => ({}));
          logger.warn('Failed to fetch creative details:', {
            campaignId: fetchedStudyDetails.campaignId,
            error: creativeErrorData.error || creativeRes.statusText,
          });
          setCreativeDetails(null); // Ensure it's null if fetch fails
        } else {
          const fetchedCreativeDetails: CreativeDataProps = await creativeRes.json();
          setCreativeDetails(fetchedCreativeDetails);
        }
      } else {
        logger.warn('No campaignId found in study details to fetch creative assets.');
        setCreativeDetails(null);
      }
    } catch (err: any) {
      logger.error('Error fetching survey preview page data:', { studyId, error: err.message });
      setError(err.message);
      setStudyDetails(null);
      setCreativeDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, [studyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShareForReview = async () => {
    if (!studyId || !studyDetails) return;
    if (
      studyDetails.status !== BrandLiftStudyStatus.DRAFT &&
      studyDetails.status !== BrandLiftStudyStatus.CHANGES_REQUESTED
    ) {
      showErrorToast(
        `This study is currently in '${studyDetails.status}' status and cannot be sent for review now.`
      );
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await fetch(`/api/brand-lift/surveys/${studyId}/request-review`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to submit for review.' }));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      showSuccessToast(result.message || 'Study submitted for review successfully!');
      router.push(`/brand-lift/approval/${studyId}`);
    } catch (err: any) {
      logger.error('Error submitting study for review:', { studyId, error: err.message });
      showErrorToast(err.message || 'Failed to submit study for review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
          <AlertTitle>Error Loading Page</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!studyDetails) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert>
          <Icon iconId="faCircleInfoLight" className="h-4 w-4" />
          <AlertTitle>Study Not Found</AlertTitle>
          <AlertDescription>The requested brand lift study could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  let shareButtonText = 'Share Survey for Initial Review';
  let isShareButtonDisabled = isSubmittingReview;
  if (
    studyDetails?.status === BrandLiftStudyStatus.PENDING_APPROVAL ||
    studyDetails?.status === BrandLiftStudyStatus.APPROVED
  ) {
    shareButtonText = 'Review Requested';
    isShareButtonDisabled = true;
  } else if (
    studyDetails?.status !== BrandLiftStudyStatus.DRAFT &&
    studyDetails?.status !== BrandLiftStudyStatus.CHANGES_REQUESTED
  ) {
    shareButtonText = `Status: ${studyDetails.status}`;
    isShareButtonDisabled = true;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Preview & Submit Survey</h1>
          {studyDetails.name && (
            <p className="text-muted-foreground">
              {studyDetails.name} - Brand Lift Study - Preview
            </p>
          )}
        </div>
        <Button onClick={handleShareForReview} size="lg" disabled={isShareButtonDisabled}>
          {isSubmittingReview ? (
            <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
          ) : (
            <Icon iconId="faShareLight" className="mr-2 h-4 w-4" />
          )}
          {isSubmittingReview ? 'Submitting...' : shareButtonText}
        </Button>
      </div>

      <Tabs
        value={selectedPlatform}
        onValueChange={value => setSelectedPlatform(value as PlatformView)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="Generic">Generic</TabsTrigger>
          <TabsTrigger value="TikTok">TikTok</TabsTrigger>
          <TabsTrigger value="Instagram">Instagram</TabsTrigger>
          <TabsTrigger value="Desktop">Desktop</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 flex justify-center items-start pt-2">
            {selectedPlatform === 'TikTok' || selectedPlatform === 'Instagram' ? (
              creativeDetails ? (
                <PhoneShell>
                  <PlatformScreenWrapper
                    platform={selectedPlatform.toLowerCase() as 'tiktok' | 'instagram'}
                    creativeData={creativeDetails}
                  />
                </PhoneShell>
              ) : (
                <div className="w-[300px] h-[600px] bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center border-gray-300 border-[14px] p-4">
                  <Icon iconId="faImageLight" className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Creative preview is loading or unavailable.
                  </p>
                </div>
              )
            ) : (
              <div className="w-[300px] h-[600px] bg-gray-100/50 dark:bg-gray-800/50 rounded-[2.5rem] flex items-center justify-center opacity-50 p-4">
                <p className="text-muted-foreground text-sm text-center">
                  Platform-specific creative preview is shown here. View survey questions on the
                  right.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <TabsContent value="Generic" className="mt-0 pt-0">
              {studyDetails.questions && studyDetails.questions.length > 0 ? (
                <SurveyQuestionPreviewList questions={studyDetails.questions} />
              ) : (
                <p className="text-muted-foreground p-4">No questions defined for this survey.</p>
              )}
            </TabsContent>
            <TabsContent value="TikTok" className="mt-0 pt-0">
              {creativeDetails ? (
                <p className="text-sm text-muted-foreground p-4">
                  Showing TikTok creative preview on the left. The survey questions below are for
                  generic reference.
                </p>
              ) : (
                <p className="text-muted-foreground p-4">
                  TikTok creative preview unavailable. Generic survey questions below.
                </p>
              )}
              {studyDetails.questions && studyDetails.questions.length > 0 ? (
                <SurveyQuestionPreviewList questions={studyDetails.questions} />
              ) : (
                <p className="text-muted-foreground p-4">No questions defined for this survey.</p>
              )}
            </TabsContent>
            <TabsContent value="Instagram" className="mt-0 pt-0">
              {creativeDetails ? (
                <p className="text-sm text-muted-foreground p-4">
                  Showing Instagram creative preview on the left. The survey questions below are for
                  generic reference.
                </p>
              ) : (
                <p className="text-muted-foreground p-4">
                  Instagram creative preview unavailable. Generic survey questions below.
                </p>
              )}
              {studyDetails.questions && studyDetails.questions.length > 0 ? (
                <SurveyQuestionPreviewList questions={studyDetails.questions} />
              ) : (
                <p className="text-muted-foreground p-4">No questions defined for this survey.</p>
              )}
            </TabsContent>
            <TabsContent value="Desktop" className="mt-0 pt-0">
              <p className="text-muted-foreground mb-2 p-4 pb-0">
                Desktop preview of survey questions:
              </p>
              {studyDetails.questions && studyDetails.questions.length > 0 ? (
                <SurveyQuestionPreviewList questions={studyDetails.questions} />
              ) : (
                <p className="text-muted-foreground p-4">No questions defined for this survey.</p>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default SurveyPreviewPage;
