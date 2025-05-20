import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { handleApiError } from '@/lib/apiErrorHandler';
import { auth } from '@clerk/nextjs/server';
import { BrandLiftStudyStatus, SurveyOverallApprovalStatus } from '@prisma/client';
import { NotificationService, UserDetails, StudyDetails } from '@/lib/notificationService';
import logger from '@/lib/logger';

const paramsSchema = z.object({
  studyId: z.string(), // BrandLiftStudy.id is a CUID (string)
});

// No request body expected for this specific action, but could be added if needed
// const bodySchema = z.object({});

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await paramsPromise; // Await the params
    const paramValidation = paramsSchema.safeParse(params);
    if (!paramValidation.success) {
      return NextResponse.json(
        { error: 'Invalid studyId format', details: paramValidation.error.format() },
        { status: 400 }
      );
    }
    const { studyId } = paramValidation.data;

    // Fetch submitter details first for notifications
    const submitterUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, email: true, name: true },
    });

    if (!submitterUser) {
      // This should ideally not happen if user is authenticated via Clerk & has a DB record
      return NextResponse.json({ error: 'Submitter user record not found' }, { status: 404 });
    }

    const study = await prisma.brandLiftStudy.findUnique({
      where: { id: studyId },
      include: {
        campaign: { select: { userId: true, campaignName: true } }, // campaignName for notification context
      },
    });

    if (!study) {
      return NextResponse.json({ error: 'Brand Lift Study not found' }, { status: 404 });
    }

    // Authorization: Check if the user is associated with the campaign of this study
    if (study.campaign?.userId !== clerkUserId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this study' },
        { status: 403 }
      );
    }

    // Check current status - can only request review if in DRAFT or CHANGES_REQUESTED (example logic)
    if (
      study.status !== BrandLiftStudyStatus.DRAFT &&
      study.status !== BrandLiftStudyStatus.CHANGES_REQUESTED
    ) {
      return NextResponse.json(
        { error: `Study cannot be sent for review from its current status: ${study.status}` },
        { status: 409 } // Conflict
      );
    }

    // Perform the updates in a transaction
    const updatedStudy = await prisma.$transaction(async tx => {
      const updated = await tx.brandLiftStudy.update({
        where: { id: studyId },
        data: {
          status: BrandLiftStudyStatus.PENDING_APPROVAL,
        },
      });

      // Upsert SurveyApprovalStatus: Create if not exists, update if it does.
      await tx.surveyApprovalStatus.upsert({
        where: { studyId: studyId },
        update: {
          status: SurveyOverallApprovalStatus.PENDING_REVIEW,
          // Reset other fields if needed when re-requesting review
          requestedSignOff: false,
          signedOffBy: null,
          signedOffAt: null,
        },
        create: {
          studyId: studyId,
          status: SurveyOverallApprovalStatus.PENDING_REVIEW,
        },
      });
      return updated;
    });

    try {
      const notificationService = new NotificationService();
      const submitterDetails: UserDetails = {
        email: submitterUser.email,
        name: submitterUser.name || 'A User',
        id: submitterUser.id, // Pass internal DB User ID if NotificationService expects it
      };
      const studyForNotification: StudyDetails = {
        id: updatedStudy.id,
        name: study.name || 'Unnamed Study', // Use study.name from pre-transaction fetch, or updatedStudy.name
        approvalPageUrl: `${APP_BASE_URL}/brand-lift/approval/${updatedStudy.id}`,
      };

      // TODO: Determine actual recipients (e.g., based on roles, org, or specific assignments)
      const placeholderReviewers: UserDetails[] = [
        { email: 'reviewer1@example.com', name: 'Reviewer One' },
        // { email: submitterUser.email, name: submitterUser.name || 'Submitter' } // Optionally notify submitter too
      ];

      if (placeholderReviewers.length > 0) {
        await notificationService.sendSurveySubmittedForReviewEmail(
          placeholderReviewers,
          studyForNotification,
          submitterDetails
        );
        logger.info(`Study review notification process initiated for study ${studyId}`);
      } else {
        logger.warn(`No reviewers configured to notify for study ${studyId}`);
      }
    } catch (notificationError) {
      logger.error('Failed to send review submission notification:', {
        studyId,
        notificationError,
      });
      // Do not fail the main API response for notification failure, just log it.
    }

    return NextResponse.json(
      { message: 'Study submitted for review successfully', study: updatedStudy },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError({
      error,
      message: 'Failed to submit study for review',
      request,
    });
  }
}
