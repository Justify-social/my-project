import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import {
  Prisma,
  BrandLiftStudyStatus,
  SurveyApprovalCommentStatus,
  SurveyOverallApprovalStatus,
} from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { NotificationService } from '@/lib/notificationService';
import { BASE_URL } from '@/config/constants';

// Zod schema for creating a SurveyApprovalComment
const createCommentSchema = z.object({
  // studyId will come from query param for POST, not body
  questionId: z.string().cuid().optional().nullable(), // Optional: if comment is for a specific question
  text: z
    .string()
    .min(1, { message: 'Comment text cannot be empty.' })
    .max(2000, { message: 'Comment text too long.' }),
});

// Zod schema for GET query parameters
const getCommentsQuerySchema = z.object({
  studyId: z.string().cuid({ message: 'Valid Study ID is required.' }),
  questionId: z.string().cuid().optional().nullable(),
});

const notificationServiceInstance = new NotificationService();

// Helper to verify study access for commenting/viewing comments
async function verifyStudyAccessForComments(studyId: string, clerkUserId: string) {
  const userRecord = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) {
    throw new NotFoundError('User not found for authorization.');
  }
  const internalUserId = userRecord.id;

  const study = await db.brandLiftStudy.findFirst({
    where: {
      id: studyId,
      campaign: {
        // Check access via campaign and user
        userId: internalUserId,
      },
    },
    // Select campaignName for notifications, and campaign.userId for ownership checks
    select: {
      id: true,
      status: true,
      name: true,
      approvalStatus: { select: { id: true } },
      campaign: { select: { userId: true, campaignName: true } },
    },
  });
  if (!study) throw new NotFoundError('Study not found or not accessible by this user.');

  const currentStatus = study.status as BrandLiftStudyStatus;
  if (
    currentStatus === BrandLiftStudyStatus.ARCHIVED ||
    currentStatus === BrandLiftStudyStatus.DRAFT
  ) {
    throw new ForbiddenError(
      `Comments are not allowed when study status is ${currentStatus}. Study must be in a review phase.`
    );
  }
  return study;
}

// POST handler to add a new SurveyApprovalComment
export const POST = async (req: NextRequest) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studyId = searchParams.get('studyId');
    if (!studyId || !z.string().cuid().safeParse(studyId).success) {
      throw new BadRequestError('Valid Study ID is required as a query parameter.');
    }

    const study = await verifyStudyAccessForComments(studyId, clerkUserId);

    const approvalStatus = await db.surveyApprovalStatus.upsert({
      where: { studyId: study.id },
      update: {},
      create: {
        studyId: study.id,
        status: SurveyOverallApprovalStatus.PENDING_REVIEW,
      },
      // Select what's needed for notification, study.name is now directly available from 'study' variable
      // select: {
      //   id: true,
      //   study: { select: { name: true, campaign: { select: { userId: true } } } },
      // },
    });

    const body = await req.json();
    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid comment creation data', {
        studyId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw validation.error;
    }
    const { questionId, text } = validation.data;

    // If questionId is provided, fetch question text for notification context
    let questionTextForNotification: string | undefined = undefined;
    if (questionId) {
      const question = await db.surveyQuestion.findUnique({
        where: { id: questionId },
        select: { text: true },
      });
      if (question) questionTextForNotification = question.text;
    }

    const newComment = await db.surveyApprovalComment.create({
      data: {
        approvalStatusId: approvalStatus.id,
        questionId: questionId,
        authorId: clerkUserId,
        text: text,
        status: SurveyApprovalCommentStatus.OPEN,
      },
    });

    // --- Notification Trigger ---
    try {
      const commenterDetails = await db.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { email: true, name: true, id: true },
      });
      const studyOwnerInternalId = study.campaign?.userId; // Use campaign.userId from the 'study' object returned by verifyStudyAccessForComments
      let studyOwnerDetails: { id: string; email: string; name?: string | null } | null = null;
      if (studyOwnerInternalId) {
        studyOwnerDetails = await db.user.findUnique({
          where: { id: studyOwnerInternalId },
          select: { id: true, email: true, name: true },
        });
      }

      if (
        commenterDetails?.email &&
        studyOwnerDetails?.email &&
        studyOwnerDetails.id !== commenterDetails.id
      ) {
        const approvalPageUrl = `${BASE_URL}/brand-lift/approval/${study.id}`;
        await notificationServiceInstance.sendNewCommentEmail(
          [{ email: studyOwnerDetails.email, name: studyOwnerDetails.name ?? undefined }],
          { id: study.id, name: study.name, approvalPageUrl }, // Use study.name directly
          {
            commentText: newComment.text,
            commentAuthorName: commenterDetails.name ?? commenterDetails.email,
            questionText: questionTextForNotification,
          }
        );
        logger.info('New comment notification sent', { studyId, commentId: newComment.id });
      } else {
        logger.warn(
          'Could not send new comment notification due to missing details or self-commenting.',
          { studyId, commenterId: clerkUserId, ownerId: studyOwnerInternalId }
        );
      }
    } catch (emailError: any) {
      logger.error('Failed to send new comment notification', {
        studyId,
        commentId: newComment.id,
        error: emailError.message,
      });
    }
    // --- End Notification Trigger ---

    logger.info('Survey approval comment created', {
      commentId: newComment.id,
      studyId,
      userId: clerkUserId,
    });
    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, req);
  }
};

// GET handler to list SurveyApprovalComments for a study (and optionally a question)
export const GET = async (req: NextRequest) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = getCommentsQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      logger.warn('Invalid query params for fetching comments', {
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw validation.error;
    }

    const { studyId, questionId } = validation.data;

    // Verify study access first.
    const verifiedStudy = await verifyStudyAccessForComments(studyId, clerkUserId);

    // Construct where clause for comments
    const whereClause: Prisma.SurveyApprovalCommentWhereInput = {
      approvalStatus: { studyId: verifiedStudy.id }, // Use verifiedStudy.id
    };
    if (questionId) {
      whereClause.questionId = questionId;
    }

    const comments = await db.surveyApprovalComment.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'asc', // Show oldest comments first
      },
      // Include author details if User model is linked and you want to send them
      // include: { author: { select: { name: true, avatarUrl: true } } }
    });

    logger.info(`Fetched ${comments.length} comments`, {
      studyId,
      questionId,
      userId: clerkUserId,
    });
    return NextResponse.json(comments);
  } catch (error: any) {
    return handleApiError(error, req);
  }
};
