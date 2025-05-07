import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/apiErrorHandler';
import { tryCatch } from '@/lib/middleware/api/util-middleware';
import { withValidation } from '@/lib/middleware/api/util-middleware';
import { SubmissionStatus } from '@prisma/client';

import { logger } from '@/lib/logger';
import {
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
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
async function getAndVerifyQuestion(studyId: string, questionId: string, orgId: string) {
  const question = await prisma.surveyQuestion.findFirst({
    where: {
      id: questionId,
      studyId: studyId,
      study: {
        // Ensures study belongs to the org
        organizationId: orgId,
      },
    },
    include: {
      study: { select: { status: true } }, // To check study status for modifiability
    },
  });

  if (!question) {
    throw new NotFoundError('Question not found or not accessible.');
  }

  // Prevent changes if study is in a non-editable state
  if (!['DRAFT', 'PENDING_APPROVAL'].includes(question.study.status)) {
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
  // Remove withValidation wrapping, handle validation inside
  return tryCatch(
    async () => {
      const { userId, orgId } = await auth();
      if (!userId || !orgId)
        throw new UnauthenticatedError('Authentication and organization membership required.');

      const { studyId, questionId } = await paramsPromise;
      if (!studyId || !questionId)
        throw new ZodValidationError('Study ID and Question ID are required.');

      await getAndVerifyQuestion(studyId, questionId, orgId); // Verifies access and modifiability

      const body = await req.json();
      const parsedBody = updateQuestionSchema.safeParse(body);
      if (!parsedBody.success) throw new ZodValidationError(parsedBody.error);

      const updateData = parsedBody.data;
      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
      }

      logger.info('Attempting to update SurveyQuestion', {
        userId,
        orgId,
        studyId,
        questionId,
        updateData,
      });
      const updatedQuestion = await prisma.surveyQuestion.update({
        where: { id: questionId },
        data: updateData,
      });
      logger.info('SurveyQuestion updated successfully', { userId, orgId, questionId });
      return NextResponse.json(updatedQuestion);
    },
    error => handleApiError(error, req)
  ); // Pass req to error handler
}

export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string; questionId: string }> }
) {
  return tryCatch(
    async () => {
      const { userId, orgId } = await auth();
      if (!userId || !orgId)
        throw new UnauthenticatedError('Authentication and organization membership required.');

      const { studyId, questionId } = await paramsPromise;
      if (!studyId || !questionId)
        throw new ZodValidationError('Study ID and Question ID are required.');

      await getAndVerifyQuestion(studyId, questionId, orgId); // Verifies access and modifiability

      logger.info('Attempting to delete SurveyQuestion', { userId, orgId, studyId, questionId });
      await prisma.surveyQuestion.delete({
        where: { id: questionId },
      });
      logger.info('SurveyQuestion deleted successfully', { userId, orgId, questionId });
      return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 }); // Or 204 No Content
    },
    error => handleApiError(error, req)
  ); // Pass req to error handler
}
