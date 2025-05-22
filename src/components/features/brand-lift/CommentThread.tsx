import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StatusTag from './StatusTag'; // Corrected import path
import { SurveyApprovalCommentStatus } from '@prisma/client'; // Correct import for the enum
import { Icon } from '@/components/ui/icon/icon'; // Corrected path
import { formatDistanceToNow } from 'date-fns'; // For relative timestamps

// Interface matching expected data structure for a comment author
export interface CommentAuthor {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

// Interface matching expected data structure for a single comment
// Matches SurveyApprovalCommentData from types/brand-lift.ts structure closely
export interface CommentData {
  id: string;
  author: {
    id: string;
    name?: string | null; // Use combined name if available
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
  text: string;
  status: SurveyApprovalCommentStatus;
  createdAt: string | Date; // Allow Date object or string
  questionId?: string | null;
  questionLink?: string | null; // Added for linking
  resolutionNote?: string | null; // Added this field
}

interface CommentThreadProps {
  comments: CommentData[];
  onAddComment: (text: string, questionId?: string | null) => Promise<void>; // Make async
  isLoading?: boolean; // Loading state for adding comments
  // Optional: Add props for resolving/updating comment status if handled here
  // onUpdateCommentStatus?: (commentId: string, newStatus: SurveyApprovalCommentStatus) => Promise<void>;
  // userHasModeratorRole?: boolean; // To control who can resolve
}

// Restore local formatDate helper function
const formatDate = (dateInput: Date | string): string => {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (_e) {
    return 'Invalid date';
  }
};

const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onAddComment,
  isLoading = false,
  // onUpdateCommentStatus,
  // userHasModeratorRole = false,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async () => {
    if (!newCommentText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(newCommentText.trim());
      setNewCommentText(''); // Clear input on success
    } catch (error) {
      console.error('Error adding comment:', error);
      // Optionally show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-none border-none">
      <CardContent className="p-0 space-y-4">
        {/* Display existing comments */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
          {comments
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Sort by oldest first
            .map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {comment.author.firstName?.[0] ?? 'U'}
                    {comment.author.lastName?.[0] ?? 'N'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {comment.author.firstName || 'Anonymous'} {comment.author.lastName || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                  </div>
                  {comment.questionId && (
                    <p className="text-xs text-muted-foreground">
                      Linked to:{' '}
                      <a
                        href={`/question/${comment.questionId}`}
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Question {comment.questionId.split('-').pop()}
                      </a>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {comment.text}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <StatusTag status={comment.status} />
                    {/* Resolve Button Placeholder - implement based on permissions */}
                    {/* {comment.status === SurveyApprovalCommentStatus.OPEN && onUpdateCommentStatus && (comment.author.id === currentUserId || userHasModeratorRole) && (
                                        <Button size="xs" variant="outline" onClick={() => onUpdateCommentStatus(comment.id, SurveyApprovalCommentStatus.RESOLVED)}>
                      Resolve
                                        </Button>
                  )} */}
                    {comment.status === 'RESOLVED' && comment.resolutionNote && (
                      <p className="text-xs text-muted-foreground italic">
                        Note: {comment.resolutionNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <Separator />

        {/* Add new comment section */}
        <div className="flex items-start space-x-3 pt-2">
          {/* Placeholder Avatar for current user - Replace with actual user avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newCommentText}
              onChange={e => setNewCommentText(e.target.value)}
              rows={3}
              className="min-h-[60px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddSubmit}
                disabled={!newCommentText.trim() || isSubmitting || isLoading}
                size="sm"
              >
                {isSubmitting || isLoading ? (
                  <Icon iconId="faSpinnerLight" className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      {/* <CardFooter>
                Optional footer content
            </CardFooter> */}
    </Card>
  );
};

export default CommentThread;
