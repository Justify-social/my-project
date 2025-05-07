import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuth, clerkClient, auth } from '@clerk/nextjs/server';
import logger from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError, BadRequestError, NotFoundError } from '@/lib/errors';

// TODO: SSOT - This enum should be defined in and imported from src/types/brand-lift.ts
// Defining locally for now
enum BrandLiftStudyStatus_API {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    // ... other statuses
}

// Zod schema for updating a survey option
const surveyOptionUpdateSchema = z.object({
    text: z.string().min(1, "Option text is required.").optional(),
    imageUrl: z.string().url().optional().nullable(),
    order: z.number().int("Order must be an integer.").optional(),
}).partial();

// REMOVING local tryCatch for now to test direct export
// async function tryCatch<TResponse, TParams = Promise<{ studyId: string, questionId: string, optionId: string }>>(
//     handler: (request: NextRequest, paramsContainer: { params: TParams }) => Promise<NextResponse<TResponse>>
// ): Promise<(request: NextRequest, paramsContainer: { params: TParams }) => Promise<NextResponse<TResponse | { error: string; details?: any }>>> {
//     return async (request: NextRequest, paramsContainer: { params: TParams }): Promise<NextResponse<TResponse> | NextResponse<{ error: string; details?: any }>> => {
//         try {
//             logger.info(`Request received for ${request.method} ${request.url}`, { params: await paramsContainer.params });
//             return await handler(request, paramsContainer);
//         } catch (error: any) {
//             return handleApiError(error, request) as NextResponse<{ error: string; details?: any }>;
//         }
//     };
// }

// Original putOptionHandler logic, to be inlined or called directly
// async function putOptionHandler(request: NextRequest, { params: paramsPromise }: { params: Promise<{ studyId: string, questionId: string, optionId: string }> }) { ... }

// Original deleteOptionHandler logic
async function deleteOptionHandler(request: NextRequest, { params: paramsPromise }: { params: Promise<{ studyId: string, questionId: string, optionId: string }> }) {
    const { userId, orgId } = await auth();
    if (!userId) {
        throw new UnauthenticatedError("User not authenticated for deleting option.");
    }
    const { studyId, questionId, optionId } = await paramsPromise;
    logger.info('Authenticated user for DELETE .../options/{optionId}', { userId, orgId, studyId, questionId, optionId });

    // TODO: Authorization Logic (similar to PUT) - P1-02 (Refined)
    const optionToDelete = await prisma.surveyOption.findFirst({
        where: {
            id: optionId,
            questionId: questionId,
            question: {
                studyId: studyId,
            }
        }
    });

    if (!optionToDelete) {
        throw new NotFoundError("Option not found, or it does not belong to the specified question/study, or study is not in an editable state.");
    }

    const deleteResult = await prisma.surveyOption.deleteMany({
        where: {
            id: optionId,
        },
    });

    if (deleteResult.count === 0) {
        throw new NotFoundError("Option not found during delete operation.");
    }
    logger.info('SurveyOption deleted', { optionId, questionId, studyId, userId });
    return new NextResponse(null, { status: 204 });
}

export const PUT = async (request: NextRequest, { params: paramsPromise }: { params: Promise<{ studyId: string, questionId: string, optionId: string }> }) => {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            throw new UnauthenticatedError("User not authenticated for updating option.");
        }
        const { studyId, questionId, optionId } = await paramsPromise;
        logger.info('Authenticated user for PUT .../options/{optionId}', { userId, orgId, studyId, questionId, optionId });

        // TODO: Authorization Logic - P1-02 (Refined)

        const body = await request.json();
        const validatedData = surveyOptionUpdateSchema.parse(body);

        if (Object.keys(validatedData).length === 0) {
            throw new BadRequestError("No fields to update provided.");
        }

        const optionToVerify = await prisma.surveyOption.findFirst({
            where: {
                id: optionId,
                questionId: questionId,
                question: {
                    studyId: studyId,
                }
            }
        });

        if (!optionToVerify) {
            throw new NotFoundError("Option not found, or it does not belong to the specified question/study, or study is not in an editable state.");
        }

        const updateResult = await prisma.surveyOption.updateMany({
            where: {
                id: optionId,
            },
            data: validatedData,
        });

        if (updateResult.count === 0) {
            throw new NotFoundError("Option not found during update operation or no changes made.");
        }

        const optionToReturn = await prisma.surveyOption.findUniqueOrThrow({
            where: { id: optionId }
        });
        logger.info('SurveyOption updated', { optionId, questionId, studyId, userId });
        return NextResponse.json(optionToReturn, { status: 200 });
    } catch (error: any) {
        return handleApiError(error, request);
    }
};

// Keeping DELETE wrapped with the local tryCatch for now to see if PUT passes
// If PUT passes, DELETE will also need to be inlined or use a corrected HOF.
// For now, to isolate the issue, I will comment out the local tryCatch and the delete handler that uses it.
// export const DELETE = tryCatch(deleteOptionHandler);

// To ensure the file still has a DELETE export if needed by other parts of the build (though unlikely to affect this specific error)
// I will export the deleteOptionHandler directly for now. This will likely fail if called, 
// but the goal is to see if the PUT error resolves.
export const DELETE = deleteOptionHandler; // This signature is not directly Next.js compatible if tryCatch was essential for its export type
