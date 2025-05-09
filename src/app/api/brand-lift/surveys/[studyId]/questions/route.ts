import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, BrandLiftStudyStatus, SurveyQuestionType } from '@prisma/client';

import { prisma as db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Zod schema for SurveyOption creation (nested within question creation)
const createOptionSchema = z.object({
  text: z.string().min(1, { message: 'Option text is required' }),
  imageUrl: z.string().url().optional().nullable(),
  order: z.number().int(),
});

// Zod schema for creating a SurveyQuestion (includes options)
const createQuestionSchema = z.object({
  text: z.string().min(1, { message: 'Question text is required' }),
  questionType: z.nativeEnum(SurveyQuestionType), // Use locally defined enum
  order: z.number().int(),
  isRandomized: z.boolean().optional().default(false),
  isMandatory: z.boolean().optional().default(true),
  kpiAssociation: z.string().optional().nullable(),
  options: z.array(createOptionSchema).min(1, { message: 'At least one option is required' }),
});

// Helper to verify study access and status
async function verifyStudyAccess(
  studyId: string,
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

  const study = await db.brandLiftStudy.findFirst({
    where: {
      id: studyId,
      campaign: {
        userId: internalUserId,
      },
    },
    select: { id: true, status: true },
  });

  if (!study) {
    throw new NotFoundError('Study not found or not accessible by this user.');
  }

  // Cast the status string from DB to the local enum for comparison
  const currentStatus = study.status as BrandLiftStudyStatus;
  if (!allowedStatuses.includes(currentStatus)) {
    throw new ForbiddenError(`Operation not allowed for study status: ${study.status}`);
  }

  return study;
}

// POST handler to create a new SurveyQuestion for a study
export const POST = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    const { studyId } = await paramsPromise;
    if (!studyId) {
      throw new BadRequestError('Study ID is required.');
    }

    // Verify user can edit this study
    await verifyStudyAccess(studyId, clerkUserId, [
      BrandLiftStudyStatus.DRAFT,
      BrandLiftStudyStatus.PENDING_APPROVAL,
    ]);

    const body = await req.json();
    const validation = createQuestionSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid question creation data', {
        studyId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw new BadRequestError('Invalid question data.');
    }

    const { options, ...questionData } = validation.data;

    // Use Prisma transaction to create question and options together
    const newQuestion = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdQuestion = await tx.surveyQuestion.create({
        data: {
          ...questionData,
          studyId: studyId,
        },
      });

      await tx.surveyOption.createMany({
        data: options.map((opt: z.infer<typeof createOptionSchema>) => ({
          ...opt,
          questionId: createdQuestion.id,
        })),
      });

      // Return the question with its options included
      return tx.surveyQuestion.findUnique({
        where: { id: createdQuestion.id },
        include: { options: { orderBy: { order: 'asc' } } }, // Also order options here
      });
    });

    logger.info('Survey question created successfully', {
      questionId: newQuestion?.id,
      studyId,
      userId: clerkUserId,
    });
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error: any) {
    // Use the shared error handler
    return handleApiError(error);
  }
};

// GET handler to list SurveyQuestions for a study
export const GET = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    const { studyId } = await paramsPromise;
    if (!studyId) {
      throw new BadRequestError('Study ID is required.');
    }

    // Verify user can access the study (just need existence and org match for GET)
    const allStatuses = Object.values(BrandLiftStudyStatus) as BrandLiftStudyStatus[];
    await verifyStudyAccess(studyId, clerkUserId, allStatuses);

    const questions = await db.surveyQuestion.findMany({
      where: {
        studyId: studyId,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        options: {
          orderBy: {
            order: 'asc', // Ensure options are ordered too
          },
        },
      },
    });

    logger.info(`Fetched ${questions.length} questions for study`, {
      studyId,
      userId: clerkUserId,
    });
    return NextResponse.json(questions);
  } catch (error: any) {
    return handleApiError(error);
  }
};
