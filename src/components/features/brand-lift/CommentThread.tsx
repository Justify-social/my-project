import React from 'react';

// Assuming these are your Shadcn UI primitive components
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input'; // Or Textarea
// import { Badge } from "@/components/ui/badge";

// TODO: Replace with actual types from src/types/brand-lift.ts
interface Comment {
  id: string;
  authorId: string;
  authorName?: string; // Denormalized for display, or fetched via authorId
  authorAvatarUrl?: string; // Denormalized or fetched
  text: string;
  createdAt: Date | string;
  status?: 'OPEN' | 'RESOLVED'; // Or from SurveyApprovalCommentStatus enum
  questionId?: string;
}

interface CommentThreadProps {
  comments: Comment[];
  currentUserId: string;
  onAddComment: (text: string, questionId?: string) => Promise<void>;
  // onResolveComment?: (commentId: string) => Promise<void>; // Future enhancement
  associatedQuestionId?: string; // If the thread is for a specific question
  isLoading?: boolean;
}

/**
 * CommentThread Molecule
 * Displays a list of comments and an input field for adding new comments.
 * Built conceptually using Shadcn UI primitives (Card, Avatar, Input, Button).
 */
export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  currentUserId,
  onAddComment,
  associatedQuestionId,
  isLoading,
}) => {
  const [newComment, setNewComment] = React.useState('');

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await onAddComment(newComment.trim(), associatedQuestionId);
      setNewComment('');
    }
  };

  // Placeholder for Shadcn component usage
  const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`border rounded-lg p-4 shadow ${className}`}>{children}</div>
  );
  const CardHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-2 font-semibold">{children}</div>
  );
  const CardTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg">{children}</h3>
  );
  const CardContent = ({ children }: { children: React.ReactNode }) => (
    <div className="text-sm">{children}</div>
  );
  const CardFooter = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-4 pt-2 border-t">{children}</div>
  );
  const Avatar = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
  const AvatarImage = ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} className="w-full h-full rounded-full object-cover" />
  );
  const AvatarFallback = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;
  const Input = (props: any) => <input {...props} className="border p-2 w-full rounded" />;
  const Button = (props: any) => (
    <button
      {...props}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
    />
  );
  const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${className}`}>
      {children}
    </span>
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          Comments {associatedQuestionId ? `for Q#${associatedQuestionId}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
          {comments.length === 0 && !isLoading && <p className="text-gray-500">No comments yet.</p>}
          {isLoading && comments.length === 0 && <p>Loading comments...</p>}
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Avatar className="mt-1">
                {comment.authorAvatarUrl ? (
                  <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName || 'User'} />
                ) : (
                  <AvatarFallback>
                    {comment.authorName ? comment.authorName.substring(0, 1).toUpperCase() : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">
                    {comment.authorName || 'Anonymous'}
                    {comment.authorId === currentUserId && (
                      <span className="text-xs text-blue-600 ml-1">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}{' '}
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.text}</p>
                {comment.status && (
                  <div className="mt-1.5">
                    <Badge
                      className={
                        comment.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {comment.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Input // Using a basic input, consider Textarea for multi-line
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
            disabled={isLoading}
          />
          <Button
            onClick={handleAddComment}
            disabled={isLoading || !newComment.trim()}
            className="mt-2 w-full"
          >
            {isLoading ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>
      </CardContent>
      {/* <CardFooter>
        <p className="text-xs text-gray-500">{comments.length} comment(s)</p>
      </CardFooter> */}
    </Card>
  );
};

export default CommentThread;
