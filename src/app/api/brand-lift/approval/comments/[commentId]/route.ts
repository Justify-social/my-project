import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, SurveyApprovalCommentStatus, BrandLiftStudyStatus } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError, DatabaseError, ZodValidationError } from '@/lib/errors';

// Zod schema for updating a SurveyApprovalComment's status
const updateCommentStatusSchema = z.object({
  status: z.nativeEnum(SurveyApprovalCommentStatus), // e.g., RESOLVED
});

// Helper to verify comment access and modifiability of parent study
async function verifyCommentAccess(commentId: string, orgId: string, userId: string) {
  const comment = await prisma.surveyApprovalComment.findUnique({
    where: { id: commentId },
    include: {
      approvalStatus: {
        include: {
          study: {
            select: { id: true, status: true, organizationId: true }
          }
        }
      }
    }
  });

  if (!comment) throw new NotFoundError('Comment not found.');
  if (comment.approvalStatus?.study?.organizationId !== orgId) {
    throw new ForbiddenError('Access denied to this comment\'s study.');
  }

  const currentStudyStatus = comment.approvalStatus?.study?.status as BrandLiftStudyStatus;
  if (!([BrandLiftStudyStatus.PENDING_APPROVAL, BrandLiftStudyStatus.APPROVED] as BrandLiftStudyStatus[]).includes(currentStudyStatus)) {
    throw new ForbiddenError(`Comment status cannot be updated when study status is ${currentStudyStatus}.`);
  }

  return comment;
}

// PUT handler to update a SurveyApprovalComment status
export async function PUT(req: NextRequest, context: any) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new UnauthenticatedError('Unauthorized');

    const commentId = context?.params?.commentId;
    if (!commentId) throw new BadRequestError('Comment ID is required.');

    await verifyCommentAccess(commentId, orgId, userId);

    const body = await req.json();
    const validation = updateCommentStatusSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid comment status update data', { commentId, errors: validation.error.flatten().fieldErrors, orgId });
      throw new ZodValidationError(validation.error.flatten().fieldErrors);
    }

    const { status } = validation.data;

    const updatedComment = await prisma.surveyApprovalComment.update({
      where: { id: commentId },
      data: { status: status },
    });

    logger.info('Survey approval comment status updated', { commentId, newStatus: status, orgId });
    return NextResponse.json(updatedComment);

  } catch (error: any) {
    return handleApiError(error, req);
  }
}
