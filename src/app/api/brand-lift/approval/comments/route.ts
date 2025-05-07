import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db'; // TODO: Verify path
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // TODO: Verify import
// import { SurveyApprovalCommentStatus as PrismaSurveyApprovalCommentStatus } from '@prisma/client'; // Enum for Prisma

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

const surveyApprovalCommentCreateSchema = z.object({
  // studyId is implicit from the path or main approval context if not nested under surveyId directly for comments
  questionId: z.string().cuid().optional().nullable(), // cuid if your IDs are CUIDs
  text: z.string().min(1, 'Comment text cannot be empty.'),
});

// Updated tryCatch HOF for routes that might not have dynamic route params but use query params
async function tryCatchForQueryRoutes<TResponse>(
  handler: (request: NextRequest) => Promise<NextResponse<TResponse>>
): Promise<(request: NextRequest) => Promise<NextResponse<TResponse | { error: string }>>> {
  return async (request: NextRequest) => {
    try {
      // logger.info(`Request received: ${request.method} ${request.url}`);
      return await handler(request);
    } catch (error: any) {
      return handleApiError(error, request);
    }
  };
}

// POST /api/brand-lift/approval/comments?studyId=xxx (or /api/brand-lift/surveys/{studyId}/approval/comments)
// For now, let's assume studyId is a query param for this collection endpoint
async function postCommentHandler(request: NextRequest) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated to post comment.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 }); // Fallback if custom errors not set up
  }
  logger.info('Authenticated user for POST /approval/comments', { userId, orgId });

  const { searchParams } = new URL(request.url);
  const studyId = searchParams.get('studyId');
  // const approvalStatusId = searchParams.get('approvalStatusId'); // Alternative if comments are tied to SurveyApprovalStatus entity

  if (!studyId /* && !approvalStatusId */) {
    return NextResponse.json(
      { error: 'Study ID (or ApprovalStatus ID) is required to add a comment.' },
      { status: 400 }
    );
  }

  // TODO: Authorization Logic:
  // 1. Verify studyId exists.
  // 2. Verify user (userId/orgId) has permission to comment on this study (e.g., study creator, part of org, specific reviewer role).
  // Example:
  // const study = await prisma.brandLiftStudy.findUnique({ where: { id: studyId } });
  // if (!study) { return NextResponse.json({ error: "Study not found." }, { status: 404 }); }
  // const canComment = study.createdBy === userId || (orgId && study.organizationId === orgId && /* check roles */ true);
  // if (!canComment) { // throw new ForbiddenError("User does not have permission to comment on this study."); }

  const body = await request.json();
  const validatedData = surveyApprovalCommentCreateSchema.parse(body);

  // To link to SurveyApprovalStatus, we might need to find or create it first if it doesn't exist for the study
  // For simplicity now, linking directly to studyId if no approvalStatusId is explicitly managed for comments.
  // The Prisma schema should define how SurveyApprovalComment relates, likely via approvalStatusId on SurveyApprovalStatus.
  // Let's assume we find/create the SurveyApprovalStatus record for the studyId.

  let approvalStatus = await prisma.surveyApprovalStatus.findUnique({
    where: { studyId: studyId! },
  });
  if (!approvalStatus) {
    // If no approval status record, create one (or handle as error if it should pre-exist)
    // This might happen if it's the first comment/action on an approval workflow
    approvalStatus = await prisma.surveyApprovalStatus.create({
      data: { studyId: studyId! },
    });
    logger.info('Created new SurveyApprovalStatus for study during comment posting', {
      studyId,
      approvalStatusId: approvalStatus.id,
    });
  }

  const newComment = await prisma.surveyApprovalComment.create({
    data: {
      approvalStatusId: approvalStatus.id,
      studyId: studyId!, // Redundant if linked via approvalStatusId which is linked to studyId, but good for direct query
      questionId: validatedData.questionId,
      authorId: userId,
      text: validatedData.text,
      status: SurveyApprovalCommentStatus.OPEN, // Prisma schema enum
    },
  });
  logger.info('New SurveyApprovalComment created', { commentId: newComment.id, studyId, userId });

  // TODO: P3-04 - Integrate NotificationService for email notifications
  // try {
  //     await NotificationService.sendNewCommentEmail({
  //         studyId: studyId!,
  //         studyName: approvalStatus.study?.name || 'N/A', // Requires study to be included in approvalStatus fetch or separate fetch
  //         commentText: newComment.text,
  //         commentAuthor: userId, // Or fetch user name
  //         questionId: newComment.questionId,
  //         // recipientEmails: [/* array of study owner/relevant participant emails */]
  //     });
  //     logger.info('New comment notification sent for study', { studyId });
  // } catch (emailError) {
  //     logger.error('Failed to send new comment notification', emailError, { studyId });
  // }

  return NextResponse.json(newComment, { status: 201 });
}

// GET /api/brand-lift/approval/comments?studyId=xxx&questionId=yyy
async function getCommentsHandler(request: NextRequest) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated to fetch comments.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  logger.info('Authenticated user for GET /approval/comments', { userId, orgId });

  const { searchParams } = new URL(request.url);
  const studyId = searchParams.get('studyId');
  const questionId = searchParams.get('questionId');

  if (!studyId) {
    return NextResponse.json({ error: 'Study ID is required to fetch comments.' }, { status: 400 });
  }

  // TODO: Authorization Logic:
  // Verify user (userId/orgId) has permission to view comments for this studyId.
  // Example (similar to POST):
  // const study = await prisma.brandLiftStudy.findUnique({ where: { id: studyId } });
  // if (!study) { return NextResponse.json({ error: "Study not found." }, { status: 404 }); }
  // const canView = study.createdBy === userId || (orgId && study.organizationId === orgId && /* check roles */ true);
  // if (!canView) { // throw new ForbiddenError("User does not have permission to view comments for this study."); }

  const comments = await prisma.surveyApprovalComment.findMany({
    where: {
      studyId: studyId,
      questionId: questionId || undefined, // Filter by questionId if provided
    },
    orderBy: {
      createdAt: 'asc',
    },
    // include: { author: { select: { name: true, avatarUrl: true }} } // If User model is linked
  });
  logger.info(`Found ${comments.length} comments for study`, {
    studyId,
    questionIdFilter: questionId,
  });
  return NextResponse.json(comments, { status: 200 });
}

export const POST = tryCatchForQueryRoutes(postCommentHandler);
export const GET = tryCatchForQueryRoutes(getCommentsHandler);
