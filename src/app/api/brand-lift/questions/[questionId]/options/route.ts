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
async function verifyQuestionAccessForAddOption(questionId: string, clerkUserId: string) {
  const userRecord = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) {
    throw new NotFoundError('User not found for authorization.');
  }
  const internalUserId = userRecord.id;

  const question = await db.surveyQuestion.findUnique({
    where: { id: questionId },
    // Include study and campaign for user-based authorization
    include: {
      study: {
        select: {
          status: true,
          campaign: { select: { userId: true } },
        },
      },
    },
  });

  if (!question) {
    throw new NotFoundError('Parent question not found. Cannot add option.');
  }
  // Check ownership via campaign
  if (question.study?.campaign?.userId !== internalUserId) {
    throw new ForbiddenError("Access denied to this question's study. Cannot add option.");
  }

  const currentStudyStatus = question.study.status as BrandLiftStudyStatus;
  if (
    currentStudyStatus !== BrandLiftStudyStatus.DRAFT &&
    currentStudyStatus !== BrandLiftStudyStatus.PENDING_APPROVAL
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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { questionId } = await paramsPromise;
    if (!questionId || !z.string().cuid().safeParse(questionId).success) {
      // Validate CUID format for questionId
      throw new BadRequestError('Valid Question ID is required in the path.');
    }

    await verifyQuestionAccessForAddOption(questionId, clerkUserId);

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
