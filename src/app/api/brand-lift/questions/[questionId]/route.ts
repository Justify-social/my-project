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

// Zod schema for updating a SurveyOption
const surveyOptionUpdateSchema = z.object({
  id: z.string().min(1), // ID of the option to update
  text: z.string().min(1).optional(),
  imageUrl: z.string().url().nullable().optional(),
  order: z.number().int().optional(),
});

// Zod schema for updating a SurveyQuestion
const updateQuestionSchema = z
  .object({
    text: z.string().min(1).optional(),
    questionType: z.nativeEnum(SurveyQuestionType).optional(),
    order: z.number().int().optional(),
    isRandomized: z.boolean().optional(),
    isMandatory: z.boolean().optional(),
    kpiAssociation: z.string().optional().nullable(),
    options: z.array(surveyOptionUpdateSchema).optional(), // Added options array
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

// Helper to verify question access and parent study status
async function verifyQuestionAndStudyOrgAuth(
  questionId: string,
  clerkUserId: string,
  orgId: string,
  allowedStatuses: BrandLiftStudyStatus[]
) {
  const question = await db.surveyQuestion.findUnique({
    where: {
      id: questionId,
    },
    include: {
      study: {
        select: { id: true, status: true, orgId: true },
      },
    },
  });

  if (!question) {
    throw new NotFoundError('Question not found.');
  }

  if (!question.study) {
    logger.error('Question found without a study during auth check', { questionId });
    throw new NotFoundError('Study associated with question not found.');
  }

  if (question.study.orgId === null) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to access question ${questionId} in legacy study (null orgId). Action denied.`
    );
    throw new ForbiddenError(
      'Operation not allowed for studies not associated with an organization.'
    );
  } else if (question.study.orgId !== orgId) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to access question ${questionId} in study belonging to org ${question.study.orgId}. Action denied.`
    );
    throw new ForbiddenError('You do not have permission to modify this question or its study.');
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
  const { userId: clerkUserId, orgId } = await auth();
  if (!clerkUserId) {
    throw new UnauthenticatedError('Authentication required.');
  }
  if (!orgId) {
    throw new BadRequestError('Active organization context is required.');
  }

  const { questionId } = await paramsPromise;
  if (!questionId) {
    throw new BadRequestError('Question ID is required.');
  }

  await verifyQuestionAndStudyOrgAuth(questionId, clerkUserId, orgId, [
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
    throw new BadRequestError(
      'Invalid request body: ' + JSON.stringify(validation.error.flatten().fieldErrors)
    );
  }

  // Separate question data from options data
  const { options: optionsData, ...questionData } = validation.data;

  try {
    const result = await db.$transaction(async tx => {
      const updatedQuestionData = questionData;

      // Only update question if there's actual question data
      if (Object.keys(updatedQuestionData).length > 0) {
        await tx.surveyQuestion.update({
          where: { id: questionId },
          data: updatedQuestionData,
        });
      }

      if (optionsData && optionsData.length > 0) {
        for (const opt of optionsData) {
          const { id: optionId, ...optionUpdateData } = opt;
          if (Object.keys(optionUpdateData).length > 0) {
            // Only update if there are fields to update
            await tx.surveyOption.update({
              where: { id: optionId, questionId: questionId }, // Ensure option belongs to question
              data: optionUpdateData,
            });
          }
        }
      }

      // Fetch the fully updated question with its options
      return tx.surveyQuestion.findUniqueOrThrow({
        where: { id: questionId },
        include: { options: { orderBy: { order: 'asc' } } },
      });
    });

    logger.info('Survey question and its options updated successfully', {
      questionId,
      userId: clerkUserId,
      orgId,
    });
    return NextResponse.json(result);
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
  const { userId: clerkUserId, orgId } = await auth();
  if (!clerkUserId) {
    throw new UnauthenticatedError('Authentication required.');
  }
  if (!orgId) {
    throw new BadRequestError('Active organization context is required.');
  }

  const { questionId } = await paramsPromise;
  if (!questionId) {
    throw new BadRequestError('Question ID is required.');
  }

  await verifyQuestionAndStudyOrgAuth(questionId, clerkUserId, orgId, [
    BrandLiftStudyStatus.DRAFT,
    BrandLiftStudyStatus.PENDING_APPROVAL,
    BrandLiftStudyStatus.CHANGES_REQUESTED,
  ]);

  try {
    await db.surveyQuestion.delete({
      where: {
        id: questionId,
      },
    });
    logger.info('Survey question deleted successfully', { questionId, userId: clerkUserId, orgId });
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
