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
    } else {
      errorMessage = `Database error occurred.`;
    }
  }
  return NextResponse.json({ error: errorMessage }, { status: statusCode });
};
// END HYPOTHETICAL SHARED UTILITIES

// Zod schema for updating a survey option
const surveyOptionUpdateSchema = z
  .object({
    text: z.string().min(1, 'Option text is required.').optional(),
    imageUrl: z.string().url().optional().nullable(),
    order: z.number().int('Order must be an integer.').optional(),
  })
  .partial(); // Use .partial() to allow updating only specified fields

// Updated tryCatch HOF for routes with params
async function tryCatch<
  TResponse,
  TParams = { studyId: string; questionId: string; optionId: string },
>(
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

async function putOptionHandler(
  request: NextRequest,
  { params }: { params: { studyId: string; questionId: string; optionId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated for updating option.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId, questionId, optionId } = params;
  logger.info('Authenticated user for PUT .../options/{optionId}', {
    userId,
    orgId,
    studyId,
    questionId,
    optionId,
  });

  // TODO: Authorization Logic:
  // Verify user has permission to modify this option, implicitly by checking study and question ownership/permissions.
  // Example:
  // const question = await prisma.surveyQuestion.findFirst({ where: { id: questionId, studyId: studyId, study: { OR: [{ createdBy: userId }, { organizationId: orgId }] }} });
  // if (!question) { // throw new ForbiddenError("Access to question denied or question/study not found."); }

  const body = await request.json();
  const validatedData = surveyOptionUpdateSchema.parse(body);

  if (Object.keys(validatedData).length === 0) {
    return NextResponse.json({ error: 'No fields to update provided.' }, { status: 400 });
  }

  const updateResult = await prisma.surveyOption.updateMany({
    where: {
      id: optionId,
      questionId: questionId,
      question: {
        studyId: studyId,
        // study: { OR: [{ createdBy: userId }, { organizationId: orgId }] } // More restrictive auth
      },
    },
    data: validatedData,
  });

  if (updateResult.count === 0) {
    // throw new ForbiddenError("Option not found or permission denied.");
    return NextResponse.json(
      { error: 'Option not found or does not belong to the specified question/study.' },
      { status: 404 }
    );
  }

  const optionToReturn = await prisma.surveyOption.findUniqueOrThrow({
    where: { id: optionId },
  });
  logger.info('SurveyOption updated', { optionId, questionId, studyId, userId });
  return NextResponse.json(optionToReturn, { status: 200 });
}

async function deleteOptionHandler(
  request: NextRequest,
  { params }: { params: { studyId: string; questionId: string; optionId: string } }
) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated for deleting option.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId, questionId, optionId } = params;
  logger.info('Authenticated user for DELETE .../options/{optionId}', {
    userId,
    orgId,
    studyId,
    questionId,
    optionId,
  });

  // TODO: Authorization Logic (similar to PUT):
  // Verify user has permission to delete this option from this question/study.

  const deleteResult = await prisma.surveyOption.deleteMany({
    where: {
      id: optionId,
      questionId: questionId,
      question: {
        studyId: studyId,
        // study: { OR: [{ createdBy: userId }, { organizationId: orgId }] } // More restrictive auth
      },
    },
  });

  if (deleteResult.count === 0) {
    // throw new ForbiddenError("Option not found or permission denied.");
    return NextResponse.json(
      { error: 'Option not found or does not belong to the specified question/study.' },
      { status: 404 }
    );
  }
  logger.info('SurveyOption deleted', { optionId, questionId, studyId, userId });
  return new NextResponse(null, { status: 204 });
}

export const PUT = tryCatch(putOptionHandler);
export const DELETE = tryCatch(deleteOptionHandler);
