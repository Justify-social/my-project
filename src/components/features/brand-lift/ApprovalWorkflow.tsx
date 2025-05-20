'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  BrandLiftStudyStatus,
  SurveyOverallApprovalStatus,
  SurveyApprovalCommentStatus,
} from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';

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
import { Textarea } from '@/components/ui/textarea'; // For general comment input
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // For comment authors
import { Badge } from '@/components/ui/badge'; // Used by StatusTag
import { ScrollArea } from '@/components/ui/scroll-area'; // For long lists of questions/comments
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';

import logger from '@/lib/logger';
import {
  BrandLiftStudyData,
  SurveyQuestionData,
  SurveyApprovalCommentData,
  SurveyApprovalStatusData,
} from '@/types/brand-lift';
import CommentThread, { CommentData as DisplayCommentData } from './CommentThread'; // Use DisplayCommentData alias
import StatusTag from './StatusTag';
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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // For button loading states

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [studyRes, questionsRes, commentsRes, approvalStatusRes] = await Promise.all([
        fetch(`/api/brand-lift/surveys/${studyId}`),
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
      setStudyData(await studyRes.json());

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
        body: JSON.stringify({ status: BrandLiftStudyStatus.COLLECTING }), // Main study status
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update study status to COLLECTING.');
      }
      const updatedStudy = await response.json();
      setStudyData(updatedStudy); // Update local study data with new status
      // Optionally, update approvalStatus if backend reflects this change, or refetch
      // For now, main study status update is key.
      logger.info(`Study ${studyId} status updated to COLLECTING.`);
      // TODO: Show success toast: "Study submitted for data collection!"
      // No navigation needed from here as per current MVP flow, page might show new status.
    } catch (error: unknown) {
      logger.error('Error submitting study for data collection:', {
        studyId,
        error: (error as Error)?.message,
      });
      setError((error as Error)?.message || 'Failed to submit for data collection.');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Survey Review: {studyData?.name || 'Loading...'}</CardTitle>
            <CardDescription>
              Current Main Study Status:{' '}
              <StatusTag
                status={(studyData?.status as BrandLiftStudyStatus) || 'DEFAULT'}
                type="study"
              />
            </CardDescription>
            <CardDescription>
              Approval Status: <StatusTag status={currentOverallStatus} type="approval" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="text-md font-semibold mb-2">Questions & Options (Read-Only)</h4>
            <div className="space-y-3 max-h-[600px] overflow-y-auto p-1 border rounded bg-slate-50">
              {questions.length === 0 && (
                <p className="text-muted-foreground p-4 text-center">
                  No questions in this survey.
                </p>
              )}
              {questions.map((q, index) => (
                <Card key={q.id} className="p-3 bg-white">
                  <p className="font-medium text-sm text-gray-800">
                    {index + 1}. {q.text}
                  </p>
                  <ul className="list-disc pl-5 mt-1 text-xs text-gray-600 space-y-1">
                    {q.options
                      .sort((a, b) => a.order - b.order)
                      .map(opt => (
                        <li key={opt.id}>
                          {opt.text} {opt.imageUrl ? '(image)' : ''}
                        </li>
                      ))}
                  </ul>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6 sticky top-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentThread
              comments={displayComments.filter(c => !c.questionId)} // Use transformed comments
              onAddComment={text => handleAddComment(text, null)}
              currentUserId={userId || ''} // Pass current user ID
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
                <Icon iconId="faTriangleExclamationLight" className="h-4 w-4" />{' '}
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
                  )}{' '}
                  Approve Study
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
                  )}{' '}
                  Request Changes
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
                )}{' '}
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
                )}{' '}
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
                )}{' '}
                Submit for Data Collection
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
