import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db'; // Actual Prisma client
import { auth } from '@clerk/nextjs/server'; // Added auth, removed getAuth, clerkClient if unused
import logger from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError, NotFoundError } from '@/lib/errors';

// TODO: SSOT - Enums should be defined in and imported from src/types/brand-lift.ts
// Defining locally for now
enum BrandLiftStudyStatus_API {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  // ... other statuses
}

// Zod schema for a new survey option
const surveyOptionCreateSchema = z.object({
  text: z.string().min(1, 'Option text is required.'),
  imageUrl: z.string().url().optional().nullable(),
  order: z.number().int('Order must be an integer.'),
});

// Commenting out local tryCatch HOF
// async function tryCatch<TResponse, TParams = Promise<{ studyId: string, questionId: string }>>(
//   handler: (request: NextRequest, paramsContainer: { params: TParams }) => Promise<NextResponse<TResponse>>
// ): Promise<(request: NextRequest, paramsContainer: { params: TParams }) => Promise<NextResponse<TResponse | { error: string; details?: any }>>> {
//   return async (request: NextRequest, paramsContainer: { params: TParams }): Promise<NextResponse<TResponse> | NextResponse<{ error: string; details?: any }>> => {
//     try {
//       logger.info(`Request received for ${request.method} ${request.url}`, { params: await paramsContainer.params });
//       return await handler(request, paramsContainer);
//     } catch (error: any) {
//       return handleApiError(error, request) as NextResponse<{ error: string; details?: any }>;
//     }
//   };
// }

// Logic from postOptionHandler will be inlined below
// async function postOptionHandler(request: NextRequest, { params: paramsPromise }: { params: Promise<{ studyId: string, questionId: string }> }) { ... }

export const POST = async (
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string; questionId: string }> }
) => {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      throw new UnauthenticatedError('User not authenticated or not part of an organization.');
    }
    const { studyId, questionId } = await paramsPromise;
    logger.info('Authenticated user for POST .../questions/{questionId}/options', {
      userId,
      orgId,
      studyId,
      questionId,
    });

    // TODO: Authorization Logic - P1-02 (Refined)
    const question = await prisma.surveyQuestion.findUnique({
      where: { id: questionId, studyId: studyId },
    });

    if (!question) {
      throw new NotFoundError(`Question with ID ${questionId} not found in study ${studyId}.`);
    }
    // TODO: Add check here for question.study.status if BrandLiftStudyStatus_API is available

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
  } catch (error: any) {
    return handleApiError(error, request);
  }
};
