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
  orgId: string
): Promise<SurveyQuestion & { study: { status: BrandLiftStudyStatus } }> {
  const question = await db.surveyQuestion.findUnique({
    where: { id: questionId },
    include: {
      study: { select: { status: true, organizationId: true } },
    },
  });

  if (!question) throw new NotFoundError('Question not found.');
  if (question.study.organizationId !== orgId)
    throw new ForbiddenError("Access denied to this question's study.");

  const currentStudyStatus = question.study.status as BrandLiftStudyStatus;
  if (
    currentStudyStatus !== BrandLiftStudyStatus.DRAFT &&
    currentStudyStatus !== BrandLiftStudyStatus.PENDING_APPROVAL
  ) {
    throw new ForbiddenError(
      `Options cannot be reordered when study status is ${currentStudyStatus}.`
    );
  }
  return question as SurveyQuestion & { study: { status: BrandLiftStudyStatus } }; // Cast for type safety
}

export const PATCH = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ questionId: string }> }
) => {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) throw new UnauthenticatedError('Unauthorized');

    const { questionId } = await paramsPromise; // Await the promise here
    if (!questionId) throw new BadRequestError('Question ID is required.');

    await verifyQuestionAccessForOptionReorder(questionId, orgId);

    const body = await req.json();
    const validation = reorderOptionsPayloadSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid option reorder data', {
        questionId,
        errors: validation.error.flatten().fieldErrors,
        orgId,
      });
      throw validation.error;
    }

    const updates = validation.data;
    const optionIdsToUpdate = updates.map(u => u.id);

    // Verify all options belong to the specified question
    const optionsInQuestion = await db.surveyOption.findMany({
      where: {
        id: { in: optionIdsToUpdate },
        questionId: questionId,
      },
      select: { id: true },
    });

    if (optionsInQuestion.length !== updates.length) {
      logger.error('Mismatch in option IDs provided for reorder', {
        questionId,
        orgId,
        providedIds: optionIdsToUpdate,
        foundIds: optionsInQuestion.map((o: { id: string }) => o.id),
      });
      throw new BadRequestError(
        'Invalid option ID(s) for reorder. All options must belong to the specified question.'
      );
    }

    await db.$transaction(
      updates.map(update =>
        db.surveyOption.update({
          where: { id: update.id, questionId: questionId }, // Ensure option belongs to the question
          data: { order: update.order },
        })
      )
    );

    logger.info('Successfully reordered options for question', {
      questionId,
      orgId,
      count: updates.length,
    });
    return NextResponse.json({ message: 'Options reordered successfully' }, { status: 200 });
  } catch (error: any) {
    return handleApiError(error, req);
  }
};
