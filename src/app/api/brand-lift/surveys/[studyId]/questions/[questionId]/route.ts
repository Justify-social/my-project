import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuth, clerkClient } from '@clerk/nextjs/server';

// HYPOTHETICAL SHARED UTILITIES (copied from previous step for context)
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

// Re-define enums here or ensure they are properly imported from src/types/brand-lift.ts
enum SurveyQuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

// Zod schema for updating a question (options are not updated here directly, but via their own endpoints or as part of full question replacement)
const surveyQuestionUpdateSchema = z.object({
  text: z.string().min(1, 'Question text is required.').optional(),
  questionType: z.nativeEnum(SurveyQuestionType).optional(),
  order: z.number().int().optional(),
  isRandomized: z.boolean().optional(),
  isMandatory: z.boolean().optional(),
  kpiAssociation: z.string().optional().nullable(),
  // Options are managed separately or by re-posting the whole question if a full update is desired via the collection POST
});

// Updated tryCatch HOF for routes with params
async function tryCatch<TResponse, TParams = { studyId: string; questionId: string }>(
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

// PUT /api/brand-lift/surveys/[studyId]/questions/[questionId]
async function putQuestionHandler(
  request: NextRequest,
  { params }: { params: { studyId: string; questionId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated for updating question.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId, questionId } = params;
  logger.info('Authenticated user for PUT /surveys/{studyId}/questions/{questionId}', {
    userId,
    orgId,
    studyId,
    questionId,
  });

  // TODO: Authorization Logic:
  // 1. Verify studyId exists and user has write permissions.
  // 2. Verify questionId exists within that study and user has permission to modify it.
  // Example: const study = await prisma.brandLiftStudy.findFirst({ where: { id: studyId, OR: [{ createdBy: userId }, { organizationId: orgId }] } });
  // if (!study) { // throw new ForbiddenError("Access to study denied or study not found."); }
  // const question = await prisma.surveyQuestion.findFirst({where: {id: questionId, studyId: study.id }});
  // if (!question) { // throw new ForbiddenError("Question not found in this study or access denied."); }

  const body = await request.json();
  const validatedData = surveyQuestionUpdateSchema.parse(body); // .partial() is applied by default by Zod for .object().optional() etc.

  if (Object.keys(validatedData).length === 0) {
    return NextResponse.json({ error: 'No fields to update provided.' }, { status: 400 });
  }

  const updatedQuestion = await prisma.surveyQuestion.update({
    where: { id: questionId, studyId: studyId }, // Composite key check or ensure studyId matches if not part of unique constraint directly
    data: validatedData,
    include: { options: true },
  });
  logger.info('SurveyQuestion updated', { questionId: updatedQuestion.id, studyId, userId });
  return NextResponse.json(updatedQuestion, { status: 200 });
}

// DELETE /api/brand-lift/surveys/[studyId]/questions/[questionId]
async function deleteQuestionHandler(
  request: NextRequest,
  { params }: { params: { studyId: string; questionId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated for deleting question.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId, questionId } = params;
  logger.info('Authenticated user for DELETE /surveys/{studyId}/questions/{questionId}', {
    userId,
    orgId,
    studyId,
    questionId,
  });

  // TODO: Authorization Logic (similar to PUT):
  // Verify user has permission to delete this question from this study.

  // Ensure the question belongs to the study before deleting
  const question = await prisma.surveyQuestion.findFirst({
    where: { id: questionId, studyId: studyId },
  });

  if (!question) {
    // throw new ForbiddenError("Question not found in this study or permission denied.");
    return NextResponse.json(
      { error: 'Question not found in this study or permission denied.' },
      { status: 404 }
    ); // Or 403 if it exists but no permission
  }

  await prisma.surveyQuestion.delete({
    where: { id: questionId }, // studyId check was effectively done above
  });
  logger.info('SurveyQuestion deleted', { questionId, studyId, userId });
  return new NextResponse(null, { status: 204 });
}

export const PUT = tryCatch(putQuestionHandler);
export const DELETE = tryCatch(deleteQuestionHandler);
