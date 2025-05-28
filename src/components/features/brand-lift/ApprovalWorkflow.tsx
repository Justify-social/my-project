'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  BrandLiftStudyStatus,
  SurveyOverallApprovalStatus,
  SurveyApprovalCommentStatus,
} from '@prisma/client';
import { useRouter } from 'next/navigation';

// Shadcn UI Imports
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon/icon';
import { Separator as _Separator } from '@/components/ui/separator';
import { Badge as _Badge } from '@/components/ui/badge'; // Used by StatusTag
import { ScrollArea as _ScrollArea } from '@/components/ui/scroll-area'; // For long lists of questions/comments
import { toast as _toast } from 'react-hot-toast';

import logger from '@/lib/logger';
import {
  BrandLiftStudyData,
  SurveyQuestionData,
  SurveyApprovalCommentData,
  SurveyApprovalStatusData,
  CreativeDataProps,
} from '@/types/brand-lift';
import CommentThread, { CommentData as DisplayCommentData } from './CommentThread'; // Use DisplayCommentData alias
import StatusTag from './StatusTag';
import { SurveyQuestionPreviewList } from '@/components/features/brand-lift/SurveyQuestionPreviewList';
import { showSuccessToast, showErrorToast } from '@/components/ui/toast';
import { PhoneShell } from '@/components/ui/phone-shell';
import { PlatformScreenWrapper } from '@/components/features/brand-lift/previews/PlatformScreenWrapper';
import { cn } from '@/lib/utils';

interface ApprovalWorkflowProps {
  studyId: string;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ studyId }) => {
  const { userId } = useAuth();
  const [studyData, setStudyData] = useState<Partial<BrandLiftStudyData> | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestionData[]>([]);
  const [apiComments, setApiComments] = useState<SurveyApprovalCommentData[]>([]); // Raw comments from API
  const [approvalStatus, setApprovalStatus] = useState<SurveyApprovalStatusData | null>(null);
  const [creativeDetails, setCreativeDetails] = useState<CreativeDataProps | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'Instagram' | 'TikTok'>('Instagram');
  const [activeView, setActiveView] = useState<'preview' | 'questions'>('preview');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // For button loading states

  const router = useRouter();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [studyRes, questionsRes, commentsRes, approvalStatusRes] = await Promise.all([
        fetch(`/api/brand-lift/surveys/${studyId}/preview-details`),
        fetch(`/api/brand-lift/surveys/${studyId}/questions`),
        fetch(`/api/brand-lift/approval/comments?studyId=${studyId}`),
        fetch(`/api/brand-lift/approval/status?studyId=${studyId}`),
      ]);

      if (!studyRes.ok)
        throw new Error(
          await studyRes
            .json()
            .then(e => e.error)
            .catch(() => 'Failed to fetch study details')
        );
      const studyData = await studyRes.json();
      setStudyData(studyData);

      // Fetch creative details if campaignId is available
      if (studyData.campaignId) {
        try {
          const creativeApiUrl = `/api/campaigns/${studyData.campaignId}/creative-details`;
          logger.info('[ApprovalWorkflow] Fetching creative details from:', {
            url: creativeApiUrl,
          });
          console.debug('[Approval Workflow] Fetching creative details from:', creativeApiUrl);

          const creativeRes = await fetch(creativeApiUrl);
          logger.info('[ApprovalWorkflow] Creative details API response status:', {
            status: creativeRes.status,
          });

          if (!creativeRes.ok) {
            const creativeErrorData = await creativeRes
              .json()
              .catch(() => ({ error: 'Failed to parse creative error JSON' }));
            logger.warn('[ApprovalWorkflow] Failed to fetch creative details:', {
              campaignId: studyData.campaignId,
              status: creativeRes.status,
              errorData: creativeErrorData,
            });
            console.error('[Approval Workflow] Failed to fetch creative details:', {
              campaignId: studyData.campaignId,
              status: creativeRes.status,
              errorData: creativeErrorData,
            });
            setCreativeDetails(null);
          } else {
            const fetchedCreativeDetails = await creativeRes.json();
            logger.info('[ApprovalWorkflow] Successfully fetched creative details:', {
              details: fetchedCreativeDetails,
            });

            // Add detailed debugging for Mux data
            console.debug('[Approval Workflow] Creative Media Details:', {
              mediaType: fetchedCreativeDetails.media.type,
              muxPlaybackId: fetchedCreativeDetails.media.muxPlaybackId,
              muxProcessingStatus: fetchedCreativeDetails.media.muxProcessingStatus,
              campaignAssetId: fetchedCreativeDetails.campaignAssetId,
            });

            setCreativeDetails(fetchedCreativeDetails);
          }
        } catch (creativeError) {
          logger.warn('Failed to fetch creative data for phone mockup:', {
            campaignId: studyData.campaignId,
            error: (creativeError as Error).message,
          });
          // Don't throw here - creative preview is optional
        }
      } else {
        logger.warn(
          '[ApprovalWorkflow] No campaignId found in study details to fetch creative assets.'
        );
        console.warn(
          '[Approval Workflow] No campaignId found in study details to fetch creative assets.'
        );
        setCreativeDetails(null);
      }

      if (!questionsRes.ok)
        throw new Error(
          await questionsRes
            .json()
            .then(e => e.error)
            .catch(() => 'Failed to fetch questions')
        );
      setQuestions(
        ((await questionsRes.json()) as SurveyQuestionData[]).sort((a, b) => a.order - b.order)
      );

      if (!commentsRes.ok)
        throw new Error(
          await commentsRes
            .json()
            .then(e => e.error)
            .catch(() => 'Failed to fetch comments')
        );
      setApiComments(await commentsRes.json()); // Store raw API comments

      if (approvalStatusRes.ok) {
        setApprovalStatus(await approvalStatusRes.json());
      } else if (approvalStatusRes.status === 404) {
        setApprovalStatus(null); // No explicit record, means initial state like PENDING_REVIEW
      } else {
        throw new Error(
          await approvalStatusRes
            .json()
            .then(e => e.error)
            .catch(() => 'Failed to fetch approval status')
        );
      }
    } catch (error: unknown) {
      logger.error('Error fetching data for approval workflow:', {
        studyId,
        error: (error as Error)?.message,
      });
      setError((error as Error)?.message || 'Failed to load approval data.');
    } finally {
      setIsLoading(false);
    }
  }, [studyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Transform raw API comments to DisplayCommentData for CommentThread
  const displayComments: DisplayCommentData[] = apiComments.map(comment => ({
    id: comment.id,
    author: {
      id: comment.authorId,
      firstName: comment.authorName || 'User',
      lastName: comment.authorId.substring(0, 5),
      avatarUrl: comment.authorAvatarUrl || undefined,
    },
    text: comment.text,
    status: comment.status as SurveyApprovalCommentStatus, // Prisma enum
    createdAt: comment.createdAt,
    questionId: comment.questionId, // Ensure questionId is mapped
  }));

  const handleAddComment = async (text: string, questionId?: string | null) => {
    if (!studyId || !userId) return;
    const actionKey = questionId ? `addComment-${questionId}` : 'addOverallComment';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setError(null);
    try {
      const response = await fetch(`/api/brand-lift/approval/comments?studyId=${studyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, questionId }), // authorId is set by backend using Clerk session
      });
      if (!response.ok)
        throw new Error(
          await response
            .json()
            .then(e => e.error)
            .catch(() => 'Failed to add comment')
        );
      fetchData(); // Refetch all data to ensure consistency
      logger.info('[ApprovalWorkflow] Comment added successfully');
    } catch (error: unknown) {
      logger.error('[ApprovalWorkflow] Error adding comment:', {
        studyId,
        questionId,
        error: (error as Error)?.message,
      });
      setError((error as Error)?.message || 'Could not post comment.');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleUpdateOverallStatus = async (
    newStatus: SurveyOverallApprovalStatus,
    requestedSignOffUpdate?: boolean
  ) => {
    if (!studyId) return;
    const actionKey = `updateStatus-${newStatus}${requestedSignOffUpdate ? '-reqSignOff' : ''}`;
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setError(null);
    try {
      const payload: { status: SurveyOverallApprovalStatus; requestedSignOff?: boolean } = {
        status: newStatus,
      };
      if (typeof requestedSignOffUpdate === 'boolean')
        payload.requestedSignOff = requestedSignOffUpdate;

      const response = await fetch(`/api/brand-lift/approval/status?studyId=${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error(
          await response
            .json()
            .then(e => e.error)
            .catch(() => 'Failed to update status')
        );
      const data = await response.json();
      setApprovalStatus(data.approvalStatus);
      if (data.studyStatus && studyData) {
        setStudyData(prev => (prev ? { ...prev, status: data.studyStatus } : null));
      }
      fetchData(); // Refetch for full consistency
      logger.info('[ApprovalWorkflow] Study approval status updated successfully');
    } catch (error: unknown) {
      logger.error('[ApprovalWorkflow] Error updating approval status:', {
        studyId,
        newStatus,
        error: (error as Error)?.message,
      });
      setError((error as Error)?.message || 'Could not update status.');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleSubmitForDataCollection = async () => {
    if (!studyId || !isStudySignedOff) {
      setError('Study must be signed off before submitting for data collection.');
      return;
    }
    const actionKey = 'submitCollection';
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setError(null);
    try {
      logger.info(`Updating study ${studyId} status to COLLECTING`);
      const response = await fetch(`/api/brand-lift/surveys/${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: BrandLiftStudyStatus.COLLECTING }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update study status.');
      }
      logger.info(
        `Study ${studyId} successfully submitted for processing (status set to COLLECTING).`
      );
      showSuccessToast('Study submitted! Our team will process the report.');
      router.push(`/brand-lift/study-submitted/${studyId}`);
    } catch (error: unknown) {
      logger.error('Error submitting study for data collection:', {
        studyId,
        error: (error as Error)?.message,
      });
      showErrorToast((error as Error)?.message || 'Failed to submit study.');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // --- Derived States for UI Logic ---
  const currentOverallStatus = approvalStatus?.status || SurveyOverallApprovalStatus.PENDING_REVIEW;
  const isSignOffRequested = approvalStatus?.requestedSignOff === true;
  const isStudyApproved =
    currentOverallStatus === SurveyOverallApprovalStatus.APPROVED ||
    currentOverallStatus === SurveyOverallApprovalStatus.SIGNED_OFF;
  const isStudySignedOff = currentOverallStatus === SurveyOverallApprovalStatus.SIGNED_OFF;

  // TODO: Implement role-based permissions from Clerk/backend later
  const canRequestSignOff = isStudyApproved && !isStudySignedOff && !isSignOffRequested; // Example logic
  const canSignOff = isStudyApproved && isSignOffRequested && !isStudySignedOff; // Example logic
  const canSubmitForCollection = isStudySignedOff;
  const canApproveOrRequestChanges = !isStudyApproved && !isStudySignedOff;

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error && !studyData) {
    // Critical error if studyData itself couldn't load
    return (
      <Alert variant="destructive">
        <Icon iconId="faTriangleExclamationLight" />{' '}
        <AlertTitle>Error Loading Approval Data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Section with Two Columns Layout */}
      <div className="p-4 bg-slate-50/50 rounded-lg border border-border/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Status badges */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Study Status:</span>
              <StatusTag status={(studyData?.status as BrandLiftStudyStatus) || 'DEFAULT'} />
            </div>
            <div className="h-4 w-px bg-border/60 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Approval Status:</span>
              <StatusTag status={currentOverallStatus} />
            </div>
          </div>

          {/* Right side - View toggle buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeView === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('preview')}
              className="flex items-center gap-2"
            >
              <Icon iconId="faPresentationScreenLight" className="h-4 w-4" />
              Survey Preview
            </Button>
            <Button
              variant={activeView === 'questions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('questions')}
              className="flex items-center gap-2"
            >
              <Icon iconId="faListCheckLight" className="h-4 w-4" />
              Questions & Options
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {activeView === 'preview' ? (
            /* Phone Mockup Preview */
            <Card>
              <CardHeader>
                <CardTitle>Creative Preview</CardTitle>
                <CardDescription>
                  Preview how the creative will appear on social platforms during the survey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Phone Mockup */}
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
                        <Icon
                          iconId="faImageLight"
                          className="h-16 w-16 text-muted-foreground mb-4"
                        />
                        <p className="text-muted-foreground text-center text-sm">
                          Creative preview is loading or unavailable.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Platform Switcher - matching survey preview page exactly */}
                  <div className="flex flex-col space-y-3">
                    {[
                      { platform: 'TikTok', icon: 'brandsTiktok' },
                      { platform: 'Instagram', icon: 'brandsInstagram' },
                    ].map(tab => (
                      <Button
                        key={tab.platform}
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedPlatform(tab.platform as 'TikTok' | 'Instagram')}
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
              </CardContent>
            </Card>
          ) : (
            /* Questions & Options List */
            <Card>
              <CardHeader>
                <CardTitle>Questions & Options</CardTitle>
                <CardDescription>
                  Review all survey questions and answer options below (read-only view)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto p-1 border rounded bg-slate-50">
                  {questions.length > 0 ? (
                    <SurveyQuestionPreviewList questions={questions} />
                  ) : (
                    <p className="text-muted-foreground p-4 text-center">
                      No questions in this survey.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentThread
                comments={displayComments.filter(c => !c.questionId)}
                onAddComment={text => handleAddComment(text, null)}
                isLoading={actionLoading['addOverallComment']}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {error && !actionLoading['addComment'] && (
                <Alert variant="destructive">
                  <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />
                  <AlertTitle>Action Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {canApproveOrRequestChanges && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleUpdateOverallStatus(SurveyOverallApprovalStatus.APPROVED)}
                    disabled={actionLoading['updateStatus-APPROVED']}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading['updateStatus-APPROVED'] ? (
                      <Icon iconId="faSpinnerLight" className="animate-spin" />
                    ) : (
                      <Icon iconId="faCheckSolid" className="mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateOverallStatus(SurveyOverallApprovalStatus.CHANGES_REQUESTED)
                    }
                    disabled={actionLoading['updateStatus-CHANGES_REQUESTED']}
                    className="flex-1"
                  >
                    {actionLoading['updateStatus-CHANGES_REQUESTED'] ? (
                      <Icon iconId="faSpinnerLight" className="animate-spin" />
                    ) : (
                      <Icon iconId="faPenToSquareLight" className="mr-2" />
                    )}
                    Revise
                  </Button>
                </div>
              )}
              {canRequestSignOff && (
                <Button
                  onClick={() =>
                    handleUpdateOverallStatus(SurveyOverallApprovalStatus.APPROVED, true)
                  }
                  disabled={actionLoading['updateStatus-APPROVED-reqSignOff']}
                  className="w-full"
                >
                  {actionLoading['updateStatus-APPROVED-reqSignOff'] ? (
                    <Icon iconId="faSpinnerLight" className="animate-spin" />
                  ) : (
                    <Icon iconId="faPaperPlaneLight" className="mr-2" />
                  )}
                  Request Final Sign-Off
                </Button>
              )}
              {isSignOffRequested && !isStudySignedOff && !canSignOff && (
                <p className="text-sm text-muted-foreground text-center p-2 border rounded-md bg-blue-50 border-blue-200">
                  Final sign-off has been requested.
                </p>
              )}
              {canSignOff && (
                <Button
                  onClick={() => handleUpdateOverallStatus(SurveyOverallApprovalStatus.SIGNED_OFF)}
                  disabled={actionLoading['updateStatus-SIGNED_OFF']}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {actionLoading['updateStatus-SIGNED_OFF'] ? (
                    <Icon iconId="faSpinnerLight" className="animate-spin" />
                  ) : (
                    <Icon iconId="faLockLight" className="mr-2" />
                  )}
                  Final Sign-Off & Lock Survey
                </Button>
              )}
              {isStudySignedOff && (
                <div className="p-3 border rounded-md bg-green-50 border-green-300 text-center">
                  <Icon iconId="faCheckSolid" className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-700">Survey Signed Off!</p>
                </div>
              )}
            </CardContent>
            {canSubmitForCollection && (
              <CardFooter className="border-t pt-4">
                <Button
                  onClick={handleSubmitForDataCollection}
                  className="w-full"
                  disabled={actionLoading['submitCollection']}
                >
                  {actionLoading['submitCollection'] ? (
                    <Icon iconId="faSpinnerLight" className="animate-spin" />
                  ) : (
                    <Icon iconId="faRocketLight" className="mr-2" />
                  )}
                  Submit for Data Collection
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
