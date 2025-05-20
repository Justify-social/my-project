import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { BrandLiftStudyStatus } from '@prisma/client';

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
async function verifyStudyAccessAndModifiableStatus(
  studyId: string,
  clerkUserId: string,
  orgId: string
): Promise<{ id: string; status: BrandLiftStudyStatus; orgId: string | null }> {
  const study = await db.brandLiftStudy.findUnique({
    where: {
      id: studyId,
    },
    select: { id: true, status: true, orgId: true },
  });

  if (!study) {
    throw new NotFoundError('Study not found.');
  }

  // Authorization based on BrandLiftStudy's orgId
  if (study.orgId === null) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to reorder questions for legacy study ${studyId} (null orgId). Action denied.`
    );
    throw new ForbiddenError(
      'Questions cannot be reordered for studies not associated with an organization.'
    );
  } else if (study.orgId !== orgId) {
    logger.warn(
      `User ${clerkUserId} in org ${orgId} attempted to reorder questions for study ${studyId} belonging to org ${study.orgId}. Action denied.`
    );
    throw new ForbiddenError('You do not have permission to modify this study.');
  }

  const currentStatus = study.status as BrandLiftStudyStatus;
  if (
    currentStatus !== BrandLiftStudyStatus.DRAFT &&
    currentStatus !== BrandLiftStudyStatus.PENDING_APPROVAL &&
    currentStatus !== BrandLiftStudyStatus.CHANGES_REQUESTED
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
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');
    if (!orgId) throw new BadRequestError('Active organization context is required.');

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

    await verifyStudyAccessAndModifiableStatus(studyId, clerkUserId, orgId);

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

    // Ensure all provided question IDs belong to the specified studyId
    const questionIdsToUpdate = updates.map(u => u.id);
    const questionsInStudy = await db.surveyQuestion.findMany({
      where: {
        id: { in: questionIdsToUpdate },
        studyId: studyId,
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
  } catch (error: unknown) {
    logger.error('Error in reorderQuestions handler:', { error });
    return handleApiError(error, req);
  }
};
