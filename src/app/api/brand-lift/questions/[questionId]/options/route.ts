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
    order: z.number().int({ message: 'Order must be an integer.' }).min(0, { message: 'Order must be non-negative.' }),
});

// Helper to verify question access for adding an option
async function verifyQuestionAccessForAddOption(questionId: string, orgId: string) {
    const question = await db.surveyQuestion.findUnique({
        where: { id: questionId },
        include: { study: { select: { status: true, organizationId: true } } }
    });

    if (!question) {
        throw new NotFoundError('Parent question not found. Cannot add option.');
    }
    if (question.study.organizationId !== orgId) {
        throw new ForbiddenError('Access denied to this question\'s study. Cannot add option.');
    }

    const currentStudyStatus = question.study.status as BrandLiftStudyStatus;
    if (currentStudyStatus !== BrandLiftStudyStatus.DRAFT && currentStudyStatus !== BrandLiftStudyStatus.PENDING_APPROVAL) {
        throw new ForbiddenError(`Options cannot be added when study status is ${currentStudyStatus}.`);
    }
    // No need to return question, just verify access
}

export const POST = async (req: NextRequest, { params: paramsPromise }: { params: Promise<{ questionId: string }> }) => {
    try {
        const { userId, orgId } = await auth();
        if (!userId || !orgId) throw new UnauthenticatedError('Authentication and organization membership required.');

        const { questionId } = await paramsPromise;
        if (!questionId || !z.string().cuid().safeParse(questionId).success) { // Validate CUID format for questionId
            throw new BadRequestError('Valid Question ID is required in the path.');
        }

        await verifyQuestionAccessForAddOption(questionId, orgId);

        const body = await req.json();
        const validation = createOptionSchema.safeParse(body);
        if (!validation.success) {
            logger.warn('Invalid option creation data', { questionId, errors: validation.error.flatten().fieldErrors, orgId });
            throw validation.error;
        }

        const newOption = await db.surveyOption.create({
            data: {
                ...validation.data,
                questionId: questionId,
            },
        });
        logger.info('Survey option created successfully', { optionId: newOption.id, questionId, orgId });
        return NextResponse.json(newOption, { status: 201 });
    } catch (error: any) {
        return handleApiError(error, req);
    }
};

// No GET, PUT, DELETE here as those operate on specific optionId 