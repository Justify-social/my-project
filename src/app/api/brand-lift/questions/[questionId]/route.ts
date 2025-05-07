import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, SurveyQuestionType, BrandLiftStudyStatus } from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { tryCatch } from '@/lib/middleware/api';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Zod schema for updating a SurveyQuestion
const updateQuestionSchema = z.object({
    text: z.string().min(1).optional(),
    questionType: z.nativeEnum(SurveyQuestionType).optional(),
    order: z.number().int().optional(),
    isRandomized: z.boolean().optional(),
    isMandatory: z.boolean().optional(),
    kpiAssociation: z.string().optional().nullable(),
}).partial().refine(data => Object.keys(data).length > 0, { message: 'At least one field must be provided for update.' });


// Helper to verify question access and parent study status
async function verifyQuestionAccess(questionId: string, orgId: string, allowedStatuses: BrandLiftStudyStatus[]) {
    const question = await db.surveyQuestion.findUnique({
        where: {
            id: questionId,
        },
        include: {
            study: {
                select: { id: true, status: true, organizationId: true }
            }
        }
    });

    if (!question) {
        throw new NotFoundError('Question not found');
    }

    if (question.study.organizationId !== orgId) {
        throw new ForbiddenError('Access denied to this question\'s study');
    }

    const currentStatus = question.study.status as BrandLiftStudyStatus;
    if (!allowedStatuses.includes(currentStatus)) {
        throw new ForbiddenError(`Operation not allowed for study status: ${question.study.status}`);
    }

    return question;
}

// PUT handler to update a specific SurveyQuestion by ID
const putHandler = async (req: NextRequest, { params: paramsPromise }: { params: Promise<{ questionId: string }> }) => {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new UnauthenticatedError('Unauthorized');
    }

    const { questionId } = await paramsPromise;
    if (!questionId) {
        throw new BadRequestError('Question ID is required.');
    }

    await verifyQuestionAccess(questionId, orgId, [
        BrandLiftStudyStatus.DRAFT,
        BrandLiftStudyStatus.PENDING_APPROVAL,
    ]);

    const body = await req.json();
    const validation = updateQuestionSchema.safeParse(body);

    if (!validation.success) {
        logger.warn('Invalid question update data', { questionId, errors: validation.error.flatten().fieldErrors, orgId });
        throw validation.error;
    }

    try {
        const updatedQuestion = await db.surveyQuestion.update({
            where: {
                id: questionId,
                study: { organizationId: orgId }
            },
            data: validation.data,
        });
        logger.info('Survey question updated successfully', { questionId, orgId });
        return NextResponse.json(updatedQuestion);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            logger.warn('Attempted to update non-existent question record', { questionId, orgId });
            throw new NotFoundError('Question not found for update.');
        }
        throw error;
    }
};

// DELETE handler to delete a specific SurveyQuestion by ID
const deleteHandler = async (req: NextRequest, { params: paramsPromise }: { params: Promise<{ questionId: string }> }) => {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
        throw new UnauthenticatedError('Unauthorized');
    }

    const { questionId } = await paramsPromise;
    if (!questionId) {
        throw new BadRequestError('Question ID is required.');
    }

    await verifyQuestionAccess(questionId, orgId, [
        BrandLiftStudyStatus.DRAFT,
        BrandLiftStudyStatus.PENDING_APPROVAL,
    ]);

    try {
        await db.surveyQuestion.delete({
            where: {
                id: questionId,
                study: { organizationId: orgId }
            },
        });
        logger.info('Survey question deleted successfully', { questionId, orgId });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            logger.warn('Attempted to delete non-existent question record', { questionId, orgId });
            throw new NotFoundError('Question not found for deletion.');
        }
        throw error;
    }
};

export const PUT = tryCatch(putHandler);
export const DELETE = tryCatch(deleteHandler);
