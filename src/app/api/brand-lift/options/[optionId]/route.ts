import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
// import { Prisma, BrandLiftStudyStatus } from '@prisma/client'; // Commented out failing imports
import * as Prisma from '@prisma/client'; // Try importing the namespace

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ZodValidationError,
} from '@/lib/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Zod schema for updating a SurveyOption (text, imageUrl, order are optional for update)
const updateOptionSchema = z
  .object({
    text: z.string().min(1, { message: 'Option text cannot be empty if provided.' }).optional(),
    imageUrl: z.string().url({ message: 'Invalid image URL format.' }).optional().nullable(),
    order: z.number().int({ message: 'Order must be an integer.' }).min(0).optional(),
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

// Helper to verify option access and modifiability of parent study
async function verifyOptionAccess(optionId: string, clerkUserId: string) {
  const userRecord = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  });
  if (!userRecord) {
    throw new NotFoundError('User not found for authorization.');
  }
  const internalUserId = userRecord.id;

  const option = await prisma.surveyOption.findUnique({
    where: { id: optionId },
    include: {
      question: {
        include: {
          study: {
            select: {
              id: true,
              status: true,
              campaign: { select: { userId: true } }, // Select campaign's userId for auth check
            },
          },
        },
      },
    },
  });

  if (!option) throw new NotFoundError('Option not found.');
  // Verify ownership through campaign linkage
  if (option.question.study.campaign?.userId !== internalUserId) {
    throw new ForbiddenError("Access denied to this option's study.");
  }

  const currentStudyStatus = option.question.study.status;
  const allowedStatuses = [
    Prisma.BrandLiftStudyStatus.DRAFT,
    Prisma.BrandLiftStudyStatus.PENDING_APPROVAL,
  ];
  if (!(allowedStatuses as Prisma.BrandLiftStudyStatus[]).includes(currentStudyStatus)) {
    throw new ForbiddenError(
      `Options cannot be modified when study status is ${currentStudyStatus}.`
    );
  }
  return option;
}

// PUT handler - Restoring context parameter
export async function PUT(req: NextRequest, { optionId }: { optionId: string }) {
  try {
    const { userId: clerkUserId } = await auth(); // Changed
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.'); // Changed

    if (!optionId) throw new BadRequestError('Option ID is required from path.');

    await verifyOptionAccess(optionId, clerkUserId);

    const body = await req.json();
    const validation = updateOptionSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid option update data', {
        optionId: optionId, // Use actual optionId
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId, // Changed
      });
      throw new ZodValidationError(validation.error.flatten().fieldErrors);
    }

    const { text, imageUrl, order } = validation.data;
    const updateData: Prisma.Prisma.SurveyOptionUpdateInput = {};
    if (text !== undefined) updateData.text = text;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (order !== undefined) updateData.order = order;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    // Restore update logic
    const updatedOption = await prisma.surveyOption.update({
      where: {
        id: optionId,
        // Add nested where to ensure it belongs to an accessible study for this user
        question: { study: { campaign: { user: { clerkId: clerkUserId } } } },
      },
      data: updateData,
    });

    logger.info('Survey option updated', { optionId: updatedOption.id, userId: clerkUserId }); // Changed
    return NextResponse.json(updatedOption);
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('Option not found for update.');
    }
    return handleApiError(error, req);
  }
}

// DELETE handler - Restoring context parameter
export async function DELETE(req: NextRequest, { optionId }: { optionId: string }) {
  try {
    const { userId: clerkUserId } = await auth(); // Changed
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.'); // Changed

    if (!optionId) throw new BadRequestError('Option ID is required from path.');

    await verifyOptionAccess(optionId, clerkUserId);

    // Restore delete logic
    await prisma.surveyOption.delete({
      where: {
        id: optionId,
        // Add nested where to ensure it belongs to an accessible study for this user
        question: { study: { campaign: { user: { clerkId: clerkUserId } } } },
      },
    });

    logger.info('Survey option deleted', { optionId: optionId, userId: clerkUserId }); // Changed
    return NextResponse.json(
      { message: 'Option deleted successfully' }, // Restored original success message
      { status: 200 } // Changed from 204 to allow message body
    );
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('Option not found for deletion.');
    }
    return handleApiError(error, req);
  }
}
