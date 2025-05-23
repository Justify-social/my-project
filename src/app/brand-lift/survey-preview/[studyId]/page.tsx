'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrandLiftStudyData, CreativeDataProps, BrandLiftStudyStatus } from '@/types/brand-lift';
import { Button } from '@/components/ui/button';
import { SurveyQuestionPreviewList } from '@/components/features/brand-lift/SurveyQuestionPreviewList';
import { PhoneShell } from '@/components/ui/phone-shell';
import { PlatformScreenWrapper } from '@/components/features/brand-lift/previews/PlatformScreenWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import logger from '@/lib/logger';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import BrandLiftPageSubtitle from '@/components/features/brand-lift/BrandLiftPageSubtitle';

type PlatformView = 'TikTok' | 'Instagram';

const SurveyPreviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const studyId = params?.studyId as string;

  const [studyDetails, setStudyDetails] = useState<BrandLiftStudyData | null>(null);
  const [creativeDetails, setCreativeDetails] = useState<CreativeDataProps | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformView>('TikTok');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchData = useCallback(async () => {
    if (!studyId) return;
    setIsLoading(true);
    setError(null);

    try {
      const studyRes = await fetch(`/api/brand-lift/surveys/${studyId}/preview-details`);
      if (!studyRes.ok) {
        const errorData = await studyRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch study details: ${studyRes.statusText}`);
      }
      const fetchedStudyDetails: BrandLiftStudyData = await studyRes.json();
      setStudyDetails(fetchedStudyDetails);
      logger.info('[SurveyPreviewPage] Fetched study details:', { details: fetchedStudyDetails });

      // Debug log
      console.debug('[Survey Preview] Study details campaign ID:', fetchedStudyDetails.campaignId);

      if (fetchedStudyDetails.campaignId) {
        const creativeApiUrl = `/api/campaigns/${fetchedStudyDetails.campaignId}/creative-details`;
        logger.info('[SurveyPreviewPage] Fetching creative details from:', { url: creativeApiUrl });
        console.debug('[Survey Preview] Fetching creative details from:', creativeApiUrl);

        const creativeRes = await fetch(creativeApiUrl);
        logger.info('[SurveyPreviewPage] Creative details API response status:', {
          status: creativeRes.status,
        });

        if (!creativeRes.ok) {
          const creativeErrorData = await creativeRes
            .json()
            .catch(() => ({ error: 'Failed to parse creative error JSON' }));
          logger.warn('[SurveyPreviewPage] Failed to fetch creative details:', {
            campaignId: fetchedStudyDetails.campaignId,
            status: creativeRes.status,
            errorData: creativeErrorData,
          });
          console.error('[Survey Preview] Failed to fetch creative details:', {
            campaignId: fetchedStudyDetails.campaignId,
            status: creativeRes.status,
            errorData: creativeErrorData,
          });
          setCreativeDetails(null);
        } else {
          const fetchedCreativeDetails: CreativeDataProps = await creativeRes.json();
          logger.info('[SurveyPreviewPage] Successfully fetched creative details:', {
            details: fetchedCreativeDetails,
          });

          // Add detailed debugging for Mux data
          console.debug('[Survey Preview] Creative Media Details:', {
            mediaType: fetchedCreativeDetails.media.type,
            muxPlaybackId: fetchedCreativeDetails.media.muxPlaybackId,
            muxProcessingStatus: fetchedCreativeDetails.media.muxProcessingStatus,
            campaignAssetId: fetchedCreativeDetails.campaignAssetId,
          });

          setCreativeDetails(fetchedCreativeDetails);
        }
      } else {
        logger.warn(
          '[SurveyPreviewPage] No campaignId found in study details to fetch creative assets.'
        );
        console.warn(
          '[Survey Preview] No campaignId found in study details to fetch creative assets.'
        );
        setCreativeDetails(null);
      }
    } catch (err: unknown) {
      logger.error('Error fetching survey preview page data:', {
        studyId,
        error: (err as Error)?.message,
      });
      console.error('[Survey Preview] Error fetching data:', (err as Error)?.message);
      setError((err as Error)?.message);
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
    } catch (err: unknown) {
      logger.error('Error submitting study for review:', {
        studyId,
        error: (err as Error)?.message,
      });
      showErrorToast((err as Error)?.message || 'Failed to submit study for review.');
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

  let shareButtonText = 'Share Survey for Review';
  let isShareButtonDisabled = isSubmittingReview;
  if (
    studyDetails?.status === BrandLiftStudyStatus.PENDING_APPROVAL ||
    studyDetails?.status === BrandLiftStudyStatus.APPROVED
  ) {
    shareButtonText = 'Review Requested';
    isShareButtonDisabled = true;
  } else if (studyDetails?.status === BrandLiftStudyStatus.CHANGES_REQUESTED) {
    shareButtonText = 'Resubmit Survey for Review';
  } else if (studyDetails?.status !== BrandLiftStudyStatus.DRAFT) {
    shareButtonText = `Status: ${studyDetails.status}`;
    isShareButtonDisabled = true;
  }

  const platformTabs = [
    { platform: 'TikTok', icon: 'brandsTiktok' },
    { platform: 'Instagram', icon: 'brandsInstagram' },
  ] as const;

  return (
    <div className="container mx-auto p-4 md:p-6 flex flex-col h-screen">
      <div className="flex-shrink-0 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Preview & Submit Survey</h1>
            {!isLoading && studyDetails && (
              <BrandLiftPageSubtitle
                campaignId={studyDetails.campaignId}
                campaignName={studyDetails.campaign?.campaignName}
                studyName={studyDetails.name}
                funnelStage={studyDetails.funnelStage}
              />
            )}
            {isLoading && <Skeleton className="h-5 w-3/4" />}
          </div>
          <Button onClick={handleShareForReview} size="lg" disabled={isShareButtonDisabled}>
            {isSubmittingReview ? (
              <Icon iconId="faSpinnerLight" className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Icon iconId="faPaperPlaneLight" className="mr-2 h-4 w-4" />
            )}
            {isSubmittingReview ? 'Submitting...' : shareButtonText}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start flex-grow overflow-hidden">
        <div className="w-full lg:w-auto flex flex-col items-center lg:items-start lg:sticky lg:top-6">
          <div className="flex flex-row items-start gap-3">
            <div className="flex-shrink-0">
              {creativeDetails ? (
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
              )}
            </div>
            <div className="flex flex-col space-y-3">
              {platformTabs.map(tab => (
                <Button
                  key={tab.platform}
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedPlatform(tab.platform)}
                  className={cn(
                    'p-2 h-12 w-12 rounded-lg shadow-md flex items-center justify-center transition-all duration-150 ease-in-out',
                    selectedPlatform === tab.platform
                      ? 'bg-accent text-white border-accent-dark hover:bg-accent-dark'
                      : 'bg-background text-secondary border-divider hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  aria-label={`Select ${tab.platform} preview`}
                >
                  <Icon iconId={tab.icon} className="h-6 w-6" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-grow w-full mt-6 lg:mt-0 flex flex-col h-full overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 flex-shrink-0 py-2">Survey Questions</h2>
          <div className="flex-grow overflow-y-auto pr-2 pb-4">
            {studyDetails.questions && studyDetails.questions.length > 0 ? (
              <SurveyQuestionPreviewList questions={studyDetails.questions} />
            ) : (
              <p className="text-muted-foreground p-4">No questions defined for this survey.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreviewPage;
