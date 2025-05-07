import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuth, clerkClient } from '@clerk/nextjs/server';

// HYPOTHETICAL SHARED UTILITIES (Illustrative - these would be in separate files)
const logger = {
  info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
  error: (message: string, error?: any, context?: any) =>
    console.error(`[ERROR] ${message}`, error, context || ''),
};

const handleApiError = (error: any, request?: NextRequest) => {
  let statusCode = 500;
  let errorMessage = 'An unexpected error occurred.';
  const { method, url } = request || {};
  logger.error(`API Error: ${error.message}`, error, { method, url });

  if (error.name === 'UnauthenticatedError') {
    statusCode = 401;
    errorMessage = error.message || 'User not authenticated.';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = error.message || 'User does not have permission for this action.';
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    errorMessage = error.errors.map(e => e.message).join(', ');
  } else if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      statusCode = 409;
      errorMessage = `Record already exists. Fields: ${error.meta?.target?.join(', ')}`;
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = (error.meta?.cause as string) || 'Record not found.';
    } else {
      errorMessage = `Database error occurred.`;
    }
  }
  return NextResponse.json({ error: errorMessage }, { status: statusCode });
};
// END HYPOTHETICAL SHARED UTILITIES

// TODO: Import SurveyQuestionType from '@/types/brand-lift.ts' to adhere to SSOT
enum SurveyQuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

const surveyOptionBaseSchema = z.object({
  text: z.string().min(1, 'Option text is required.'),
  imageUrl: z.string().url().optional().nullable(),
  order: z.number().int(),
});

const surveyQuestionBaseSchema = z.object({
  text: z.string().min(1, 'Question text is required.'),
  questionType: z.nativeEnum(SurveyQuestionType),
  order: z.number().int(),
  isRandomized: z.boolean().optional(),
  isMandatory: z.boolean().optional(),
  kpiAssociation: z.string().optional().nullable(),
  options: z.array(surveyOptionBaseSchema).optional(),
});

// Updated tryCatch to use shared error/logging utilities, matching [studyId]/route.ts structure
async function tryCatch<TResponse, TParams = { studyId: string }>(
  handler: (
    request: NextRequest,
    paramsContainer: { params: TParams }
  ) => Promise<NextResponse<TResponse>>
): Promise<
  (
    request: NextRequest,
    paramsContainer: { params: TParams }
  ) => Promise<NextResponse<TResponse | { error: string }>>
> {
  return async (request: NextRequest, paramsContainer: { params: TParams }) => {
    try {
      // logger.info(`Request received: ${request.method} ${request.url}`, { params: paramsContainer.params });
      return await handler(request, paramsContainer);
    } catch (error: any) {
      return handleApiError(error, request);
    }
  };
}

// POST /api/brand-lift/surveys/[studyId]/questions
async function postQuestionHandler(
  request: NextRequest,
  { params }: { params: { studyId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated for creating questions.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId } = params;
  logger.info('Authenticated user for POST /surveys/{studyId}/questions', {
    userId,
    orgId,
    studyId,
  });

  // TODO: Authorization Logic:
  // 1. Verify studyId exists and belongs to the user/org or user has write permissions.
  // const study = await prisma.brandLiftStudy.findUnique({ where: { id: studyId } });
  // if (!study) { return NextResponse.json({ error: "Study not found" }, { status: 404 }); }
  // if (study.createdBy !== userId /* && relevant org/role checks */) {
  //    // throw new ForbiddenError("User does not have permission to add questions to this study.");
  //    return NextResponse.json({ error: "User does not have permission." }, { status: 403 });
  // }

  const body = await request.json();
  const validatedData = surveyQuestionBaseSchema.parse(body);

  const newQuestion = await prisma.$transaction(async tx => {
    const question = await tx.surveyQuestion.create({
      data: {
        studyId: studyId,
        text: validatedData.text,
        questionType: validatedData.questionType,
        order: validatedData.order,
        isRandomized: validatedData.isRandomized,
        isMandatory: validatedData.isMandatory,
        kpiAssociation: validatedData.kpiAssociation,
      },
    });

    if (validatedData.options && validatedData.options.length > 0) {
      await tx.surveyOption.createMany({
        data: validatedData.options.map(opt => ({
          ...opt,
          questionId: question.id,
        })),
      });
    }
    return tx.surveyQuestion.findUniqueOrThrow({
      where: { id: question.id },
      include: { options: true },
    });
  });
  logger.info('New SurveyQuestion created for study', {
    questionId: newQuestion.id,
    studyId,
    userId,
  });
  return NextResponse.json(newQuestion, { status: 201 });
}

// GET /api/brand-lift/surveys/[studyId]/questions
async function getQuestionsHandler(
  request: NextRequest,
  { params }: { params: { studyId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated for fetching questions.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId } = params;
  logger.info('Authenticated user for GET /surveys/{studyId}/questions', {
    userId,
    orgId,
    studyId,
  });

  // TODO: Authorization Logic:
  // 1. Verify studyId exists and user has read permissions.
  // const study = await prisma.brandLiftStudy.findUnique({ where: { id: studyId } });
  // if (!study) { return NextResponse.json({ error: "Study not found" }, { status: 404 }); }
  // if (study.createdBy !== userId /* && relevant org/role checks */) {
  //    // throw new ForbiddenError("User does not have permission to view questions for this study.");
  //    return NextResponse.json({ error: "User does not have permission." }, { status: 403 });
  // }

  const study = await prisma.brandLiftStudy.findUnique({
    where: { id: studyId },
  });
  if (!study) {
    // This specific check can be part of the authorization logic or handled by Prisma throwing P2025
    return NextResponse.json({ error: 'Study not found' }, { status: 404 });
  }

  const questions = await prisma.surveyQuestion.findMany({
    where: { studyId: studyId },
    include: {
      options: {
        orderBy: {
          order: 'asc',
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  return NextResponse.json(questions, { status: 200 });
}
