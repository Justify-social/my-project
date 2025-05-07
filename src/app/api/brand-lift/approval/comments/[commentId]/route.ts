import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db'; // TODO: Verify path
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // TODO: Verify import
// import { ForbiddenError, UnauthenticatedError } from '@/lib/errors'; // Hypothetical custom errors
// import logger from '@/lib/logger'; // Hypothetical shared logger
// import { handleApiError } from '@/lib/apiErrorHandler'; // Hypothetical shared API error handler

// HYPOTHETICAL SHARED UTILITIES (copied for context)
const logger = {
  info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
  error: (message: string, error?: any, context?: any) =>
    console.error(`[ERROR] ${message}`, error, context || ''),
};

const handleApiError = (error: any, request?: NextRequest) => {
  let statusCode = 500;
  let errorMessage = 'An unexpected error occurred.';
  const { method, url } = request || {};
  logger.error(`API Error: ${error.message}`, error, { method, url });

  if (error.name === 'UnauthenticatedError') {
    statusCode = 401;
    errorMessage = error.message || 'User not authenticated.';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = error.message || 'User does not have permission for this action.';
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    errorMessage = error.errors.map(e => e.message).join(', ');
  } else if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      statusCode = 409;
      errorMessage = `Record already exists. Fields: ${error.meta?.target?.join(', ')}`;
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = (error.meta?.cause as string) || 'Record not found.';
    } else {
      errorMessage = `Database error occurred.`;
    }
  }
  return NextResponse.json({ error: errorMessage }, { status: statusCode });
};
// END HYPOTHETICAL SHARED UTILITIES

// Enum for Zod, ideally from src/types/brand-lift.ts
enum SurveyApprovalCommentStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

const surveyApprovalCommentUpdateSchema = z.object({
  status: z.nativeEnum(SurveyApprovalCommentStatus),
  // resolutionNote: z.string().optional().nullable(), // Future consideration
});

// Updated tryCatch HOF for routes with params
async function tryCatch<TResponse, TParams = { commentId: string }>(
  handler: (
    request: NextRequest,
    paramsContainer: { params: TParams }
  ) => Promise<NextResponse<TResponse>>
): Promise<
  (
    request: NextRequest,
    paramsContainer: { params: TParams }
  ) => Promise<NextResponse<TResponse | { error: string }>>
> {
  return async (request: NextRequest, paramsContainer: { params: TParams }) => {
    try {
      // logger.info(`Request received: ${request.method} ${request.url}`, { params: paramsContainer.params });
      return await handler(request, paramsContainer);
    } catch (error: any) {
      return handleApiError(error, request);
    }
  };
}

// PUT /api/brand-lift/approval/comments/[commentId]
async function putCommentHandler(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated to update comment.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 }); // Fallback
  }
  const { commentId } = params;
  logger.info('Authenticated user for PUT /approval/comments/{commentId}', {
    userId,
    orgId,
    commentId,
  });

  // TODO: Authorization Logic:
  // 1. Fetch the comment to check its authorId or associated studyId for permissions.
  // const commentToUpdate = await prisma.surveyApprovalComment.findUnique({ where: { id: commentId }, include: { study: { select: { createdBy: true, organizationId: true }} } });
  // if (!commentToUpdate) { return NextResponse.json({ error: "Comment not found." }, { status: 404 }); }
  // const isAuthor = commentToUpdate.authorId === userId;
  // const isAdminOrStudyOwner = /* logic to check if user is admin or owns commentToUpdate.study */ false;
  // if (!isAuthor && !isAdminOrStudyOwner) {
  //    // throw new ForbiddenError("User does not have permission to update this comment.");
  //    return NextResponse.json({ error: "Forbidden: You cannot update this comment." }, { status: 403 });
  // }

  const body = await request.json();
  const validatedData = surveyApprovalCommentUpdateSchema.parse(body);

  const updatedComment = await prisma.surveyApprovalComment.update({
    where: { id: commentId }, // Authorization should ensure this commentId is permissible to update
    data: {
      status: validatedData.status, // Prisma schema enum SurveyApprovalCommentStatus
      updatedAt: new Date(),
    },
  });
  logger.info('SurveyApprovalComment updated', { commentId: updatedComment.id, userId });
  return NextResponse.json(updatedComment, { status: 200 });
}

export const PUT = tryCatch(putCommentHandler);
