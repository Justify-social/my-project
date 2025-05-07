'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation'; // If needed

// Assuming components are imported from their actual paths
import { CommentThread } from './CommentThread'; // Assuming CommentThread is in the same directory or adjust path
import { StatusTag, StatusTagVariant } from './StatusTag'; // Assuming StatusTag is in the same directory or adjust path

// TODO: Import actual types from src/types/brand-lift.ts
// Using _Approval suffix for local component state/prop types
enum SurveyQuestionType_Approval {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}
interface SurveyOptionData_Approval {
  id: string;
  text: string;
  imageUrl?: string | null;
  order: number;
}
interface SurveyQuestionData_Approval {
  id: string;
  studyId: string;
  text: string;
  questionType: SurveyQuestionType_Approval;
  order: number;
  options: SurveyOptionData_Approval[];
  // For local state, we might add comments directly here if fetching per question
  // comments?: ApprovalCommentData_Approval[];
}
interface ApprovalCommentData_Approval {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatarUrl?: string;
  text: string;
  createdAt: Date | string;
  status?: 'OPEN' | 'RESOLVED';
  questionId?: string;
}
interface OverallApprovalStatusData_Approval {
  status: StatusTagVariant | string; // e.g., PENDING_REVIEW, APPROVED
  requestedSignOff: boolean;
  // signedOffBy?: string;
  // signedOffAt?: Date | string;
}

// TODO: Import actual Shadcn UI components
const Button = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'xs' | 'icon' | 'default';
    className?: string;
    isLoading?: boolean;
  }
) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors 
            ${
              props.variant === 'outline'
                ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                : props.variant === 'ghost'
                  ? 'hover:bg-gray-100 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            } 
            ${props.size === 'sm' ? 'px-3 py-1.5 text-sm' : props.size === 'xs' ? 'px-2 py-1 text-xs' : props.size === 'icon' ? 'p-2' : 'px-4 py-2 text-sm'}
            ${props.disabled || props.isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${props.className || ''}`}
  >
    {props.isLoading ? 'Processing...' : props.children}
  </button>
);
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-xl font-semibold text-gray-800 ${className}`}>{children}</h2>
);
const CardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <p className={`text-sm text-gray-500 mt-1 ${className}`}>{children}</p>;
const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;
const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center space-x-3 ${className}`}
  >
    {children}
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className || 'h-6 w-full mb-2'}`}></div>
);
const Alert = ({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}) => (
  <div
    className={`p-4 rounded-md border ${variant === 'destructive' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-blue-50 border-blue-300 text-blue-700'} ${className || ''}`}
  >
    {children}
  </div>
);
const AlertTitle = ({ children }: any) => <h3 className="font-medium mb-1">{children}</h3>;
const AlertDescription = ({ children }: any) => <p className="text-sm">{children}</p>;

interface ApprovalWorkflowProps {
  studyId: string;
  currentUserId: string; // Passed from page, resolved via Clerk
  // studyName?: string; // Optional, for display
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ studyId, currentUserId }) => {
  const [studyName, setStudyName] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestionData_Approval[]>([]);
  const [comments, setComments] = useState<ApprovalCommentData_Approval[]>([]);
  const [overallStatus, setOverallStatus] = useState<OverallApprovalStatusData_Approval | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch study details (for name, overall status)
      const studyRes = await fetch(`/api/brand-lift/surveys/${studyId}`);
      if (!studyRes.ok) throw new Error('Failed to fetch study details');
      const studyData = await studyRes.json();
      setStudyName(studyData.name || 'Brand Lift Study');
      // Fetch overall approval status for the study
      // This might be part of studyData or a separate call depending on your API design
      // For now, assuming it might be fetched or initialized
      const approvalStatusRes = await fetch(`/api/brand-lift/approval/status?studyId=${studyId}`);
      if (approvalStatusRes.ok) {
        const statusData = await approvalStatusRes.json();
        setOverallStatus(statusData);
        if (studyData.name) setStudyName(studyData.name); // Set study name from main study data
      } else {
        if (studyData.name) setStudyName(studyData.name);
        if (studyData.status === 'PENDING_APPROVAL') {
          setOverallStatus({ status: 'PENDING_REVIEW', requestedSignOff: false });
        }
      }

      // Fetch questions for the study
      const questionsRes = await fetch(`/api/brand-lift/surveys/${studyId}/questions`);
      if (!questionsRes.ok) throw new Error('Failed to fetch survey questions');
      const questionsData = await questionsRes.json();
      setQuestions(questionsData || []);

      // Fetch all comments for the study
      const commentsRes = await fetch(`/api/brand-lift/approval/comments?studyId=${studyId}`);
      if (!commentsRes.ok) throw new Error('Failed to fetch comments');
      const commentsData = await commentsRes.json();
      setComments(commentsData || []);
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [studyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async (text: string, questionId?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/brand-lift/approval/comments?studyId=${studyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, questionId }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const newComment = await response.json();
      setComments(prev => [...prev, newComment]);
    } catch (err: any) {
      setError(err.message); /* TODO: Better error display */
    }
    setActionLoading(false);
  };

  const handleUpdateOverallStatus = async (
    newStatus: StatusTagVariant,
    requestedSignOff?: boolean
  ) => {
    setActionLoading(true);
    setError(null);
    try {
      const payload: any = { status: newStatus };
      if (requestedSignOff !== undefined) payload.requestedSignOff = requestedSignOff;

      const response = await fetch(`/api/brand-lift/approval/status?studyId=${studyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update approval status');
      const updatedStatus = await response.json();
      setOverallStatus(updatedStatus);
      // Optionally, refetch all data or update main study status if changed
      if (newStatus === 'APPROVED' || newStatus === 'SIGNED_OFF') {
        // Potentially trigger navigation or enable "Submit for Data Collection"
      }
    } catch (err: any) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  const handleResolveComment = async (commentId: string, newStatus: 'OPEN' | 'RESOLVED') => {
    setActionLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/brand-lift/approval/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update comment ${commentId} status`);
      }
      const updatedComment = await response.json();
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId ? { ...comment, status: updatedComment.status } : comment
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
    setActionLoading(false);
  };

  if (isLoading)
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  if (error) return <p className="text-red-500 p-4">Error: {error}</p>;

  const isApprovedOrSignedOff =
    overallStatus?.status === 'APPROVED' || overallStatus?.status === 'SIGNED_OFF';
  const isStudyLockedForComments =
    overallStatus?.status === 'APPROVED' || overallStatus?.status === 'SIGNED_OFF';

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle className="text-slate-800">
              Approval Workflow: {studyName || `Study ${studyId}`}
            </CardTitle>
            {overallStatus && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-600">Overall Status:</span>
                <StatusTag status={overallStatus.status as StatusTagVariant} />
                {overallStatus.requestedSignOff && overallStatus.status !== 'SIGNED_OFF' && (
                  <span className="text-xs text-orange-500 font-medium">(Sign-off Requested)</span>
                )}
              </div>
            )}
          </div>
          {/* Action buttons moved to CardFooter for better grouping */}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-6">
            Review the survey questions below. Add comments or suggestions as needed. The survey
            will be locked for edits once approved or sign-off is requested.
          </p>
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          {/* TODO: Add permission checks for who can perform these actions */}
          <Button
            onClick={() => handleUpdateOverallStatus('CHANGES_REQUESTED' as StatusTagVariant)}
            variant="outline"
            size="sm"
            disabled={actionLoading || isApprovedOrSignedOff}
          >
            Request Changes
          </Button>
          {!isApprovedOrSignedOff && (
            <Button
              onClick={() =>
                handleUpdateOverallStatus(
                  'APPROVED' as StatusTagVariant,
                  overallStatus?.status === 'PENDING_REVIEW' ? true : undefined
                )
              }
              size="sm"
              disabled={actionLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              Approve
            </Button>
          )}
          {overallStatus?.status === 'APPROVED' && !overallStatus.requestedSignOff && (
            <Button
              onClick={() => handleUpdateOverallStatus('APPROVED' as StatusTagVariant, true)}
              size="sm"
              disabled={actionLoading}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              Request Sign-Off
            </Button>
          )}
          {overallStatus?.status === 'APPROVED' && overallStatus.requestedSignOff && (
            <Button
              onClick={() => handleUpdateOverallStatus('SIGNED_OFF' as StatusTagVariant)}
              size="sm"
              disabled={actionLoading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Final Sign-Off
            </Button>
          )}
        </CardFooter>
      </Card>

      {questions.map((q, index) => (
        <Card key={q.id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-md text-slate-700">
              Question {index + 1}: {q.text}
            </CardTitle>
            <div className="text-xs mt-1 text-gray-500">
              Type: {q.questionType.replace(/_/g, ' ')}
            </div>
            <div className="text-sm mt-3 space-y-1 text-gray-700 bg-slate-50 p-3 rounded-md border border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-1">Options:</p>
              {q.options.map(opt => (
                <div key={opt.id} className="p-1.5 border-l-2 border-slate-300 pl-2 text-xs">
                  <span>
                    {opt.order}. {opt.text}
                  </span>
                  {opt.imageUrl && (
                    <div className="mt-1">
                      <img
                        src={opt.imageUrl}
                        alt={`Option: ${opt.text}`}
                        className="max-w-[80px] h-auto rounded border border-slate-300 inline-block"
                      />
                    </div>
                  )}
                </div>
              ))}
              {q.options.length === 0 && (
                <p className="italic text-slate-400">No options for this question.</p>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">
              Comments for this question:
            </h4>
            <CommentThread
              comments={comments.filter(c => c.questionId === q.id)}
              currentUserId={currentUserId}
              onAddComment={handleAddComment}
              associatedQuestionId={q.id}
              isLoading={actionLoading || isStudyLockedForComments}
              // TODO: Pass user avatar/name map for display in CommentThread
            />
            {/* Resolve buttons are now part of CommentThread or handled differently for SSOT compliance */}
          </CardContent>
        </Card>
      ))}

      {questions.length === 0 && !isLoading && (
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center py-8">No questions in this survey to review.</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-slate-800">Overall Survey Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentThread
            comments={comments.filter(c => !c.questionId)} // Comments not tied to a specific question
            currentUserId={currentUserId}
            onAddComment={handleAddComment}
            isLoading={actionLoading || isStudyLockedForComments}
          />
        </CardContent>
      </Card>

      <CardFooter className="mt-10">
        <p className="text-xs text-slate-500 mr-auto">
          Status: {overallStatus?.status ? overallStatus.status.replace(/_/g, ' ') : 'Loading...'}
          {overallStatus?.requestedSignOff &&
            overallStatus.status !== 'SIGNED_OFF' &&
            ' (Sign-off Requested)'}
        </p>
        <Button
          onClick={() =>
            alert(
              'TODO: API Call to set main study status to COLLECTING (Ticket BL-MVP-P3-03 / EPIC4)'
            )
          }
          disabled={!isApprovedOrSignedOff || actionLoading}
          className="bg-green-600 hover:bg-green-700 focus:ring-green-500 min-w-[200px] py-2.5"
          isLoading={actionLoading}
        >
          Submit for Data Collection
        </Button>
      </CardFooter>
    </div>
  );
};

export default ApprovalWorkflow;
