import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, BrandLiftStudyStatus } from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Zod schema for creating a SurveyOption (matches schema in options/[optionId]/route.ts for create)
const createOptionSchema = z.object({
  text: z.string().min(1, { message: 'Option text is required' }),
  imageUrl: z.string().url({ message: 'Invalid image URL if provided' }).optional().nullable(),
  order: z
    .number()
    .int({ message: 'Order must be an integer.' })
    .min(0, { message: 'Order must be non-negative.' }),
});

// Helper to verify question access for adding an option
async function verifyQuestionAccessAndStudyOrgForAddOption(
  questionId: string,
  clerkUserId: string,
  orgId: string
) {
  const question = await db.surveyQuestion.findUnique({
    where: { id: questionId },
    include: {
      study: {
        select: {
          status: true,
          orgId: true,
        },
      },
    },
  });

  if (!question) {
    throw new NotFoundError('Parent question not found. Cannot add option.');
  }

  if (!question.study) {
    logger.error('Question found without a study during option creation auth', { questionId });
    throw new NotFoundError('Study associated with question not found.');
  }

  if (question.study.orgId === null) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to add option to question ${questionId} in legacy study (null orgId). Action denied.`
    );
    throw new ForbiddenError(
      'Options cannot be added to studies not associated with an organization.'
    );
  } else if (question.study.orgId !== orgId) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to add option to question ${questionId} in study belonging to org ${question.study.orgId}. Action denied.`
    );
    throw new ForbiddenError('You do not have permission to modify this study.');
  }

  const currentStudyStatus = question.study.status as BrandLiftStudyStatus;
  if (
    currentStudyStatus !== BrandLiftStudyStatus.DRAFT &&
    currentStudyStatus !== BrandLiftStudyStatus.PENDING_APPROVAL &&
    currentStudyStatus !== BrandLiftStudyStatus.CHANGES_REQUESTED
  ) {
    throw new ForbiddenError(`Options cannot be added when study status is ${currentStudyStatus}.`);
  }
  // No need to return question, just verify access
}

export const POST = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ questionId: string }> }
) => {
  try {
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');
    if (!orgId) throw new BadRequestError('Active organization context is required.');

    const { questionId } = await paramsPromise;
    if (!questionId || !z.string().cuid().safeParse(questionId).success) {
      // Validate CUID format for questionId
      throw new BadRequestError('Valid Question ID is required in the path.');
    }

    await verifyQuestionAccessAndStudyOrgForAddOption(questionId, clerkUserId, orgId);

    const body = await req.json();
    const validation = createOptionSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid option creation data', {
        questionId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw validation.error;
    }

    const newOption = await db.surveyOption.create({
      data: {
        ...validation.data,
        questionId: questionId,
      },
    });
    logger.info('Survey option created successfully', {
      optionId: newOption.id,
      questionId,
      userId: clerkUserId,
    });
    return NextResponse.json(newOption, { status: 201 });
  } catch (error: any) {
    return handleApiError(error, req);
  }
};

// No GET, PUT, DELETE here as those operate on specific optionId
