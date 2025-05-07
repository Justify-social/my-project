import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db'; // Actual Prisma client
import { getAuth, clerkClient } from '@clerk/nextjs/server'; // Actual Clerk auth
// import { ForbiddenError, UnauthenticatedError } from '@/lib/errors'; // Hypothetical custom errors
// import logger from '@/lib/logger'; // Hypothetical shared logger
// import { handleApiError } from '@/lib/apiErrorHandler'; // Hypothetical shared API error handler

// HYPOTHETICAL SHARED UTILITIES (copied for context)
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
    } else if (error.code === 'P2003') {
      statusCode = 400;
      errorMessage = `Invalid reference: The specified question does not exist for this study. Field: ${error.meta?.field_name}`;
    } else {
      errorMessage = `Database error occurred.`;
    }
  }
  return NextResponse.json({ error: errorMessage }, { status: statusCode });
};
// END HYPOTHETICAL SHARED UTILITIES

// Zod schema for a new survey option
const surveyOptionCreateSchema = z.object({
  text: z.string().min(1, 'Option text is required.'),
  imageUrl: z.string().url().optional().nullable(),
  order: z.number().int('Order must be an integer.'),
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

async function postOptionHandler(
  request: NextRequest,
  { params }: { params: { studyId: string; questionId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated for creating option.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId, questionId } = params;
  logger.info('Authenticated user for POST .../questions/{questionId}/options', {
    userId,
    orgId,
    studyId,
    questionId,
  });

  // TODO: Authorization Logic:
  // 1. Verify studyId exists and user has write permissions to it.
  // 2. Verify questionId exists within that study and user has permission to modify it.
  // Example:
  // const study = await prisma.brandLiftStudy.findFirst({ where: { id: studyId, OR: [{ createdBy: userId }, { organizationId: orgId }] }});
  // if (!study) { // throw new ForbiddenError("Access to study denied or study not found."); }
  const question = await prisma.surveyQuestion.findUnique({
    where: { id: questionId, studyId: studyId }, // Ensure question belongs to the study
  });

  if (!question) {
    // throw new ForbiddenError(`Question with ID ${questionId} not found in study ${studyId}.`);
    return NextResponse.json(
      { error: `Question with ID ${questionId} not found in study ${studyId}.` },
      { status: 404 }
    );
  }

  const body = await request.json();
  const validatedOptionData = surveyOptionCreateSchema.parse(body);

  const newOption = await prisma.surveyOption.create({
    data: {
      ...validatedOptionData,
      questionId: questionId,
    },
  });
  logger.info('New SurveyOption created for question', {
    optionId: newOption.id,
    questionId,
    studyId,
    userId,
  });
  return NextResponse.json(newOption, { status: 201 });
}

export const POST = tryCatch(postOptionHandler);
