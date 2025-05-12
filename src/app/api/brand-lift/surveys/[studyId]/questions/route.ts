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
async function verifyStudyAccessAndOrg(
  studyId: string,
  clerkUserId: string,
  orgId: string,
  allowedStatuses: BrandLiftStudyStatus[]
) {
  const study = await db.brandLiftStudy.findUnique({
    where: {
      id: studyId,
    },
    select: { id: true, status: true, orgId: true },
  });

  if (!study) {
    throw new NotFoundError('Study not found.');
  }

  if (study.orgId === null) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to access questions for legacy study ${studyId} (null orgId). Action denied.`
    );
    throw new ForbiddenError(
      'Operation not allowed for studies not associated with an organization.'
    );
  } else if (study.orgId !== orgId) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to access questions for study ${studyId} belonging to org ${study.orgId}. Action denied.`
    );
    throw new ForbiddenError("You do not have permission to access this study's questions.");
  }

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
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }
    if (!orgId) {
      throw new BadRequestError('Active organization context is required.');
    }

    const { studyId } = await paramsPromise;
    if (!studyId) {
      throw new BadRequestError('Study ID is required.');
    }

    // Verify user can edit this study
    await verifyStudyAccessAndOrg(studyId, clerkUserId, orgId, [
      BrandLiftStudyStatus.DRAFT,
      BrandLiftStudyStatus.PENDING_APPROVAL,
      BrandLiftStudyStatus.CHANGES_REQUESTED,
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
      orgId,
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
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }
    if (!orgId) {
      throw new BadRequestError('Active organization context is required.');
    }

    const { studyId } = await paramsPromise;
    if (!studyId) {
      throw new BadRequestError('Study ID is required.');
    }

    // Verify user can access the study (checks orgId and any status for GET)
    const allStatuses = Object.values(BrandLiftStudyStatus) as BrandLiftStudyStatus[];
    await verifyStudyAccessAndOrg(studyId, clerkUserId, orgId, allStatuses);

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
      orgId,
    });
    return NextResponse.json(questions);
  } catch (error: any) {
    return handleApiError(error);
  }
};
