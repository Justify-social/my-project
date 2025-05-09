import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, BrandLiftStudyStatus } from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';

// Zod schema for the reorder payload item
const reorderItemSchema = z.object({
  id: z.string().cuid(), // Assuming CUIDs for question IDs
  order: z.number().int().min(0),
});

const reorderPayloadSchema = z
  .array(reorderItemSchema)
  .min(1, 'At least one item required for reorder.');

// Helper to verify study access and modifiable status
async function verifyStudyAccessForReorder(studyId: string, clerkUserId: string) {
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
        // Check access via campaign and user
        userId: internalUserId,
      },
    },
    select: { id: true, status: true },
  });
  if (!study)
    throw new NotFoundError('Study not found or not accessible for reordering questions.');

  const currentStatus = study.status as BrandLiftStudyStatus;
  if (
    currentStatus !== BrandLiftStudyStatus.DRAFT &&
    currentStatus !== BrandLiftStudyStatus.PENDING_APPROVAL
  ) {
    throw new ForbiddenError(`Questions cannot be reordered when study status is ${study.status}.`);
  }
  return study;
}

export const PATCH = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

    await verifyStudyAccessForReorder(studyId, clerkUserId);

    const body = await req.json();
    const validation = reorderPayloadSchema.safeParse(body);

    if (!validation.success) {
      logger.warn('Invalid question reorder data', {
        studyId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw validation.error; // Let handleApiError format Zod errors
    }

    const updates = validation.data;

    // Ensure all provided question IDs belong to the specified studyId and user
    const userRecord = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
    if (!userRecord) throw new NotFoundError('User not found for reorder operation validation.');
    const internalUserId = userRecord.id;

    const questionIdsToUpdate = updates.map(u => u.id);
    const questionsInStudy = await db.surveyQuestion.findMany({
      where: {
        id: { in: questionIdsToUpdate },
        studyId: studyId,
        study: { campaign: { userId: internalUserId } },
      },
      select: { id: true },
    });

    if (questionsInStudy.length !== updates.length) {
      logger.error('Mismatch in question IDs provided for reorder or access denied', {
        studyId,
        userId: clerkUserId,
        providedIds: questionIdsToUpdate,
        foundIds: questionsInStudy.map((q: { id: string }) => q.id),
      });
      throw new BadRequestError('Invalid question ID(s) for reorder or access denied.');
    }

    await db.$transaction(
      updates.map(update =>
        db.surveyQuestion.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );
    logger.info('Successfully reordered questions', {
      studyId,
      userId: clerkUserId,
      count: updates.length,
    });
    return NextResponse.json({ message: 'Questions reordered successfully' }, { status: 200 });
  } catch (error: any) {
    // logger.error('Error in PATCH reorder questions:', { studyId, error: error.message, stack: error.stack }); // Redundant if handleApiError logs
    return handleApiError(error, req);
  }
};
