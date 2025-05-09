import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma, BrandLiftStudyStatus, SurveyOverallApprovalStatus, User } from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import {
  NotificationService,
  UserDetails,
  StudyDetails as EmailStudyDetails,
} from '@/lib/notificationService';
import { BASE_URL } from '@/config/constants';

const updateApprovalStatusSchema = z.object({
  status: z.nativeEnum(SurveyOverallApprovalStatus),
  requestedSignOff: z.boolean().optional(),
});

const getApprovalStatusQuerySchema = z.object({
  studyId: z.string().cuid({ message: 'Valid Study ID is required.' }),
});

// Type for the enriched study state used in this handler
type EnrichedStudyState = Prisma.BrandLiftStudyGetPayload<{
  select: {
    id: true;
    name: true;
    status: true;
    campaign: { select: { userId: true } };
    approvalStatus: { select: { id: true; status: true; requestedSignOff: true } };
  };
}>;

async function verifyStudyForApprovalInteraction(
  studyId: string,
  clerkUserId: string
): Promise<EnrichedStudyState> {
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
        userId: internalUserId,
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
      campaign: { select: { userId: true } },
      approvalStatus: { select: { id: true, status: true, requestedSignOff: true } },
    },
  });

  if (!study) throw new NotFoundError('Study not found or not accessible by this user.');

  const allowedInteractionStatuses: BrandLiftStudyStatus[] = [
    BrandLiftStudyStatus.PENDING_APPROVAL,
    BrandLiftStudyStatus.APPROVED,
  ];

  const currentMainStudyStatus = study.status as BrandLiftStudyStatus;
  if (!allowedInteractionStatuses.includes(currentMainStudyStatus)) {
    throw new ForbiddenError(
      `Approval operations are not allowed when main study status is ${currentMainStudyStatus}.`
    );
  }
  return study as EnrichedStudyState;
}

export const GET = async (req: NextRequest) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studyIdQueryParam = searchParams.get('studyId');
    const parsedQuery = getApprovalStatusQuerySchema.safeParse({ studyId: studyIdQueryParam });

    if (!parsedQuery.success) {
      logger.warn('Invalid query params for fetching approval status', {
        errors: parsedQuery.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw parsedQuery.error;
    }
    const { studyId } = parsedQuery.data;

    await verifyStudyForApprovalInteraction(studyId, clerkUserId);

    const approvalStatus = await db.surveyApprovalStatus.findUnique({
      where: { studyId: studyId },
    });

    if (!approvalStatus) {
      // If no explicit record, it implies PENDING_REVIEW if study is in that phase, or can be created on first comment/action.
      // For GET, returning 404 if not explicitly created is reasonable.
      throw new NotFoundError('Approval status record not found for this study.');
    }
    logger.info('SurveyApprovalStatus fetched successfully', { studyId, userId: clerkUserId });
    return NextResponse.json(approvalStatus);
  } catch (error: any) {
    return handleApiError(error, req);
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId)
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studyId = searchParams.get('studyId');
    if (!studyId || !z.string().cuid().safeParse(studyId).success) {
      throw new BadRequestError('Valid Study ID is required as a query parameter.');
    }

    // verifyStudyForApprovalInteraction is called, which now uses the corrected allowed statuses
    const currentStudyState: EnrichedStudyState = await verifyStudyForApprovalInteraction(
      studyId,
      clerkUserId
    );

    const body = await req.json();
    const validation = updateApprovalStatusSchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid approval status update data', {
        studyId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw validation.error;
    }

    const { status: newApprovalStatusEnumValue, requestedSignOff } = validation.data;
    const oldOverallApprovalStatus = currentStudyState.approvalStatus?.status as
      | SurveyOverallApprovalStatus
      | undefined;
    const oldRequestedSignOff = currentStudyState.approvalStatus?.requestedSignOff;

    let newBrandLiftStudyMainStatus: BrandLiftStudyStatus =
      currentStudyState.status as BrandLiftStudyStatus;

    if (newApprovalStatusEnumValue === SurveyOverallApprovalStatus.APPROVED) {
      newBrandLiftStudyMainStatus = BrandLiftStudyStatus.APPROVED;
    } else if (newApprovalStatusEnumValue === SurveyOverallApprovalStatus.CHANGES_REQUESTED) {
      // When SurveyOverallApprovalStatus is CHANGES_REQUESTED, the main BrandLiftStudy.status goes to PENDING_APPROVAL.
      newBrandLiftStudyMainStatus = BrandLiftStudyStatus.PENDING_APPROVAL;
    } else if (newApprovalStatusEnumValue === SurveyOverallApprovalStatus.SIGNED_OFF) {
      if (
        currentStudyState.approvalStatus?.status !== SurveyOverallApprovalStatus.APPROVED &&
        !currentStudyState.approvalStatus?.requestedSignOff
      ) {
        throw new BadRequestError(
          'Study must be in APPROVED status and sign-off must have been requested before it can be SIGNED_OFF.'
        );
      }
      newBrandLiftStudyMainStatus = BrandLiftStudyStatus.APPROVED;
    } else if (newApprovalStatusEnumValue === SurveyOverallApprovalStatus.PENDING_REVIEW) {
      // This case implies a re-submission or initial submission setting things to PENDING_APPROVAL for the main study.
      newBrandLiftStudyMainStatus = BrandLiftStudyStatus.PENDING_APPROVAL;
    }

    const approvalStatusDataToUpdate: Prisma.SurveyApprovalStatusUpdateInput = {
      status: newApprovalStatusEnumValue,
    };
    if (typeof requestedSignOff === 'boolean')
      approvalStatusDataToUpdate.requestedSignOff = requestedSignOff;
    if (newApprovalStatusEnumValue === SurveyOverallApprovalStatus.SIGNED_OFF) {
      approvalStatusDataToUpdate.signedOffBy = clerkUserId;
      approvalStatusDataToUpdate.signedOffAt = new Date();
    }

    const notificationService = new NotificationService();

    const [updatedApprovalStatus, finalStudyDbState] = await db.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const upsertedApproval = await tx.surveyApprovalStatus.upsert({
          where: { studyId: studyId },
          create: {
            studyId: studyId,
            status: newApprovalStatusEnumValue,
            requestedSignOff: requestedSignOff ?? false,
            ...(newApprovalStatusEnumValue === SurveyOverallApprovalStatus.SIGNED_OFF && {
              signedOffBy: clerkUserId,
              signedOffAt: new Date(),
            }),
          },
          update: approvalStatusDataToUpdate,
        });

        let updatedStudyDirectly = { status: currentStudyState.status as BrandLiftStudyStatus };
        if (currentStudyState.status !== newBrandLiftStudyMainStatus) {
          const updated = await tx.brandLiftStudy.update({
            where: { id: studyId },
            data: { status: newBrandLiftStudyMainStatus },
            select: { status: true },
          });
          updatedStudyDirectly = { status: updated.status as BrandLiftStudyStatus };
        }
        return [upsertedApproval, updatedStudyDirectly];
      }
    );

    const studyOwnerId = currentStudyState.campaign?.userId;
    let studyOwnerDetails: UserDetails | null = null;
    if (studyOwnerId) {
      const owner = await db.user.findUnique({
        where: { id: studyOwnerId },
        select: { id: true, email: true, name: true },
      });
      if (owner)
        studyOwnerDetails = { email: owner.email, name: owner.name ?? undefined, id: owner.id };
    }

    const requesterDetailsFull = await db.user.findUnique({
      where: { id: clerkUserId },
      select: { id: true, email: true, name: true },
    });
    const requesterDetails: UserDetails | null = requesterDetailsFull
      ? {
          id: requesterDetailsFull.id,
          email: requesterDetailsFull.email,
          name: requesterDetailsFull.name ?? undefined,
        }
      : null;

    const studyDetailsForEmail: EmailStudyDetails = {
      id: studyId,
      name: currentStudyState.name,
      approvalPageUrl: `${BASE_URL}/approval/${studyId}`,
    };

    // 1. Sign-off Requested
    if (
      requestedSignOff === true &&
      oldRequestedSignOff !== true &&
      newApprovalStatusEnumValue === SurveyOverallApprovalStatus.APPROVED
    ) {
      const approverEmails = ['manager@example.com']; // Placeholder
      if (approverEmails.length > 0 && requesterDetails?.email) {
        try {
          await notificationService.sendApprovalRequestedEmail(
            approverEmails.map(email => ({ email })),
            studyDetailsForEmail,
            requesterDetails
          );
          logger.info('"Approval Requested" notification sent', { studyId });
        } catch (emailError: any) {
          logger.error('Failed to send "Approval Requested" email', {
            studyId,
            error: emailError.message,
          });
        }
      }
    }

    // 2. Status Changed (Approved or Changes Requested)
    if (
      newApprovalStatusEnumValue !== oldOverallApprovalStatus &&
      (newApprovalStatusEnumValue === SurveyOverallApprovalStatus.APPROVED ||
        newApprovalStatusEnumValue === SurveyOverallApprovalStatus.CHANGES_REQUESTED)
    ) {
      if (studyOwnerDetails?.email && requesterDetails?.email) {
        try {
          await notificationService.sendStudyStatusChangeEmail(
            studyOwnerDetails,
            studyDetailsForEmail,
            newApprovalStatusEnumValue.replace(/_/g, ' ').toLowerCase(),
            requesterDetails
          );
          logger.info(`"Study Status Change (${newApprovalStatusEnumValue})" notification sent`, {
            studyId,
          });
        } catch (emailError: any) {
          logger.error('Failed to send "Study Status Change" email', {
            studyId,
            error: emailError.message,
          });
        }
      }
    }

    logger.info('Survey approval status and main study status updated', {
      studyId,
      newApprovalStatus: updatedApprovalStatus.status,
      newStudyStatus: finalStudyDbState.status,
      userId: clerkUserId,
    });
    return NextResponse.json({
      approvalStatus: updatedApprovalStatus,
      studyStatus: finalStudyDbState.status,
    });
  } catch (error: any) {
    return handleApiError(error, req);
  }
};
