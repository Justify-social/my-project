import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import logger from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { tryCatch } from '@/lib/middleware/api/util-middleware';
import {
  BrandLiftStudyStatus,
  SurveyQuestionType,
  SurveyQuestion as PrismaSurveyQuestion,
} from '@prisma/client';
import {
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  ZodValidationError,
} from '@/lib/errors';

// Schema for updating a SurveyQuestion. Options are handled separately or as part of a full replace if needed.
const updateQuestionSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  questionType: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']).optional(), // Adjust as per Prisma enum
  order: z.number().int().min(0).optional(),
  isRandomized: z.boolean().optional(),
  isMandatory: z.boolean().optional(),
  kpiAssociation: z.string().optional().nullable(),
  // Note: Updating options here might be complex (add/remove/update existing).
  // For simplicity, this schema focuses on question-level fields.
  // Options might be managed by dedicated option endpoints or by replacing all options if that's the pattern.
});

// Helper to verify study access, question existence, and modifiability status
async function getAndVerifyQuestion(studyId: string, questionId: string, clerkUserId: string) {
  // Fetch internal user ID from Clerk User ID
  const userRecord = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) {
    throw new NotFoundError('User not found for authorization.');
  }
  const internalUserId = userRecord.id;

  const question = await prisma.surveyQuestion.findFirst({
    where: {
      id: questionId,
      studyId: studyId,
      study: {
        // Ensures study belongs to the user via CampaignWizardSubmission
        campaign: {
          userId: internalUserId,
        },
      },
    },
    include: {
      study: { select: { status: true } }, // To check study status for modifiability
    },
  });

  if (!question) {
    throw new NotFoundError('Question not found or not accessible by this user.');
  }

  // Prevent changes if study is in a non-editable state
  if (!['DRAFT', 'PENDING_APPROVAL', 'CHANGES_REQUESTED'].includes(question.study.status)) {
    throw new ForbiddenError(
      `Questions cannot be modified when study status is ${question.study.status}.`
    );
  }
  return question;
}

export async function PUT(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string; questionId: string }> }
) {
  return tryCatch(
    async () => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

      const { studyId, questionId } = await paramsPromise;
      if (!studyId || !questionId)
        throw new ZodValidationError('Study ID and Question ID are required.');

      await getAndVerifyQuestion(studyId, questionId, clerkUserId);

      const body = await req.json();
      const parsedBody = updateQuestionSchema.safeParse(body);
      if (!parsedBody.success) throw new ZodValidationError(parsedBody.error);

      const updateData = parsedBody.data;
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
      }

      logger.info('Attempting to update SurveyQuestion', {
        userId: clerkUserId,
        studyId,
        questionId,
        updateData,
      });
      const updatedQuestion = await prisma.surveyQuestion.update({
        where: { id: questionId },
        data: updateData,
      });
      logger.info('SurveyQuestion updated successfully', { userId: clerkUserId, questionId });
      return NextResponse.json(updatedQuestion);
    },
    error => handleApiError(error, req)
  );
}

export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string; questionId: string }> }
) {
  return tryCatch(
    async () => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

      const { studyId, questionId } = await paramsPromise;
      if (!studyId || !questionId)
        throw new ZodValidationError('Study ID and Question ID are required.');

      await getAndVerifyQuestion(studyId, questionId, clerkUserId);

      logger.info('Attempting to delete SurveyQuestion', {
        userId: clerkUserId,
        studyId,
        questionId,
      });
      await prisma.surveyQuestion.delete({
        where: { id: questionId },
      });
      logger.info('SurveyQuestion deleted successfully', { userId: clerkUserId, questionId });
      return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });
    },
    error => handleApiError(error, req)
  );
}
