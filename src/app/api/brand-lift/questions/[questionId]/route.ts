import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, SurveyQuestionType, BrandLiftStudyStatus } from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { tryCatch } from '@/lib/middleware/api';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Zod schema for updating a SurveyQuestion
const updateQuestionSchema = z
  .object({
    text: z.string().min(1).optional(),
    questionType: z.nativeEnum(SurveyQuestionType).optional(),
    order: z.number().int().optional(),
    isRandomized: z.boolean().optional(),
    isMandatory: z.boolean().optional(),
    kpiAssociation: z.string().optional().nullable(),
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

// Helper to verify question access and parent study status
async function verifyQuestionAccess(
  questionId: string,
  clerkUserId: string,
  allowedStatuses: BrandLiftStudyStatus[]
) {
  const userRecord = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) {
    throw new NotFoundError('User not found for authorization.');
  }
  const internalUserId = userRecord.id;

  const question = await db.surveyQuestion.findUnique({
    where: {
      id: questionId,
      study: {
        campaign: {
          userId: internalUserId,
        },
      },
    },
    include: {
      study: {
        select: { id: true, status: true },
      },
    },
  });

  if (!question) {
    throw new NotFoundError('Question not found or not accessible by this user.');
  }

  const currentStatus = question.study.status as BrandLiftStudyStatus;
  if (!allowedStatuses.includes(currentStatus)) {
    throw new ForbiddenError(`Operation not allowed for study status: ${question.study.status}`);
  }

  return question;
}

// PUT handler to update a specific SurveyQuestion by ID
const putHandler = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ questionId: string }> }
) => {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new UnauthenticatedError('Authentication required.');
  }

  const { questionId } = await paramsPromise;
  if (!questionId) {
    throw new BadRequestError('Question ID is required.');
  }

  const userRecord = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) throw new NotFoundError('User for update operation not found');
  const internalUserId = userRecord.id;

  await verifyQuestionAccess(questionId, clerkUserId, [
    BrandLiftStudyStatus.DRAFT,
    BrandLiftStudyStatus.PENDING_APPROVAL,
    BrandLiftStudyStatus.CHANGES_REQUESTED,
  ]);

  const body = await req.json();
  const validation = updateQuestionSchema.safeParse(body);

  if (!validation.success) {
    logger.warn('Invalid question update data', {
      questionId,
      errors: validation.error.flatten().fieldErrors,
      userId: clerkUserId,
    });
    throw validation.error;
  }

  try {
    const updatedQuestion = await db.surveyQuestion.update({
      where: {
        id: questionId,
        study: { campaign: { userId: internalUserId } },
      },
      data: validation.data,
    });
    logger.info('Survey question updated successfully', { questionId, userId: clerkUserId });
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      logger.warn('Attempted to update non-existent question record', {
        questionId,
        userId: clerkUserId,
      });
      throw new NotFoundError('Question not found for update.');
    }
    throw error;
  }
};

// DELETE handler to delete a specific SurveyQuestion by ID
const deleteHandler = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ questionId: string }> }
) => {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new UnauthenticatedError('Authentication required.');
  }

  const { questionId } = await paramsPromise;
  if (!questionId) {
    throw new BadRequestError('Question ID is required.');
  }

  const userRecord = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) throw new NotFoundError('User for delete operation not found');
  const internalUserId = userRecord.id;

  await verifyQuestionAccess(questionId, clerkUserId, [
    BrandLiftStudyStatus.DRAFT,
    BrandLiftStudyStatus.PENDING_APPROVAL,
    BrandLiftStudyStatus.CHANGES_REQUESTED,
  ]);

  try {
    await db.surveyQuestion.delete({
      where: {
        id: questionId,
        study: { campaign: { userId: internalUserId } },
      },
    });
    logger.info('Survey question deleted successfully', { questionId, userId: clerkUserId });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      logger.warn('Attempted to delete non-existent question record', {
        questionId,
        userId: clerkUserId,
      });
      throw new NotFoundError('Question not found for deletion.');
    }
    throw error;
  }
};

export const PUT = tryCatch(putHandler);
export const DELETE = tryCatch(deleteHandler);
