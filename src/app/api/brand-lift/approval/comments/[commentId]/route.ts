import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { SurveyApprovalCommentStatus, BrandLiftStudyStatus } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ZodValidationError,
} from '@/lib/errors';

// Zod schema for updating a SurveyApprovalComment's status
const updateCommentStatusSchema = z.object({
  status: z.nativeEnum(SurveyApprovalCommentStatus), // e.g., RESOLVED
});

// Helper to verify comment access and modifiability of parent study
async function verifyCommentAccess(commentId: string, clerkUserId: string) {
  const userRecord = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) {
    throw new NotFoundError('User not found for authorization.');
  }
  const internalUserId = userRecord.id;

  const comment = await prisma.surveyApprovalComment.findUnique({
    where: { id: commentId },
    include: {
      approvalStatus: {
        include: {
          study: {
            select: {
              id: true,
              status: true,
              campaign: { select: { userId: true } },
            },
          },
        },
      },
    },
  });

  if (!comment) throw new NotFoundError('Comment not found.');
  if (comment.approvalStatus?.study?.campaign?.userId !== internalUserId) {
    throw new ForbiddenError("Access denied to this comment's study.");
  }

  const currentStudyStatus = comment.approvalStatus?.study?.status as BrandLiftStudyStatus;
  if (
    !(
      [
        BrandLiftStudyStatus.PENDING_APPROVAL,
        BrandLiftStudyStatus.APPROVED,
      ] as BrandLiftStudyStatus[]
    ).includes(currentStudyStatus)
  ) {
    throw new ForbiddenError(
      `Comment status cannot be updated when study status is ${currentStudyStatus}.`
    );
  }

  return comment;
}

// PUT handler to update a SurveyApprovalComment status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { commentId } = await params;
    if (!commentId) throw new BadRequestError('Comment ID is required.');

    await verifyCommentAccess(commentId, clerkUserId);

    const body = await req.json();
    const validation = updateCommentStatusSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid comment status update data', {
        commentId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw new ZodValidationError(validation.error.flatten().fieldErrors);
    }

    const { status } = validation.data;

    const updatedComment = await prisma.surveyApprovalComment.update({
      where: { id: commentId },
      data: { status: status },
    });

    logger.info('Survey approval comment status updated', {
      commentId,
      newStatus: status,
      userId: clerkUserId,
    });
    return NextResponse.json(updatedComment);
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
}
