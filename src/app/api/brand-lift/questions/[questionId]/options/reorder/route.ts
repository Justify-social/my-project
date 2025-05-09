import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, BrandLiftStudyStatus, SurveyQuestion } from '@prisma/client'; // Import relevant types/enums

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';

// Zod schema for the reorder payload item for options
const reorderOptionItemSchema = z.object({
  id: z.string().cuid(), // Assuming CUIDs for option IDs
  order: z.number().int().min(0),
});

const reorderOptionsPayloadSchema = z
  .array(reorderOptionItemSchema)
  .min(1, 'At least one option required for reorder.');

// Helper to verify question access and modifiable status of its parent study
async function verifyQuestionAccessForOptionReorder(
  questionId: string,
  clerkUserId: string
): Promise<SurveyQuestion & { study: { status: BrandLiftStudyStatus } }> {
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
      study: { select: { status: true } }, // organizationId removed
    },
  });

  if (!question) throw new NotFoundError('Question not found or not accessible by this user.');

  const currentStudyStatus = question.study.status as BrandLiftStudyStatus;
  if (
    currentStudyStatus !== BrandLiftStudyStatus.DRAFT &&
    currentStudyStatus !== BrandLiftStudyStatus.PENDING_APPROVAL &&
    currentStudyStatus !== BrandLiftStudyStatus.CHANGES_REQUESTED
  ) {
    throw new ForbiddenError(
      `Options cannot be reordered when study status is ${currentStudyStatus}.`
    );
  }
  return question as SurveyQuestion & { study: { status: BrandLiftStudyStatus } };
}

export const PATCH = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ questionId: string }> }
) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { questionId } = await paramsPromise;
    if (!questionId) throw new BadRequestError('Question ID is required.');

    await verifyQuestionAccessForOptionReorder(questionId, clerkUserId);

    const body = await req.json();
    const validation = reorderOptionsPayloadSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid option reorder data', {
        questionId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId, // Changed from orgId
      });
      throw validation.error;
    }

    const updates = validation.data;
    const optionIdsToUpdate = updates.map(u => u.id);

    const optionsInQuestion = await db.surveyOption.findMany({
      where: {
        id: { in: optionIdsToUpdate },
        questionId: questionId,
        // Access is already verified by verifyQuestionAccessForOptionReorder through user ownership of the campaign
      },
      select: { id: true },
    });

    if (optionsInQuestion.length !== updates.length) {
      logger.error('Mismatch in option IDs provided for reorder or access denied', {
        // Updated message
        questionId,
        userId: clerkUserId, // Changed from orgId
        providedIds: optionIdsToUpdate,
        foundIds: optionsInQuestion.map((o: { id: string }) => o.id),
      });
      throw new BadRequestError(
        'Invalid option ID(s) for reorder. All options must belong to the specified question and be accessible.'
      );
    }

    await db.$transaction(
      updates.map(update =>
        db.surveyOption.update({
          where: { id: update.id, questionId: questionId },
          data: { order: update.order },
        })
      )
    );

    logger.info('Successfully reordered options for question', {
      questionId,
      userId: clerkUserId, // Changed from orgId
      count: updates.length,
    });
    return NextResponse.json({ message: 'Options reordered successfully' }, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, req);
  }
};
