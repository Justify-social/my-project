import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
// import { ForbiddenError, UnauthenticatedError } from '@/lib/errors'; // Hypothetical custom errors
// import logger from '@/lib/logger'; // Hypothetical shared logger
// import { handleApiError } from '@/lib/apiErrorHandler'; // Hypothetical shared API error handler

// HYPOTHETICAL SHARED UTILITIES (copied for context)
const logger = {
  info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
  error: (message: string, error?: any, context?: any) =>
    console.error(`[ERROR] ${message}`, error, context || ''),
};

const handleApiError = (error: any, request?: NextRequest) => {
  let statusCode = 500;
  let errorMessage = 'An unexpected error occurred.';
  const { method, url } = request || {};
  logger.error(`API Error: ${error.message}`, error, { method, url });

  if (error.name === 'UnauthenticatedError') {
    statusCode = 401;
    errorMessage = error.message || 'User not authenticated.';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = error.message || 'User does not have permission for this action.';
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    errorMessage = error.errors.map(e => e.message).join(', ');
  } else if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      statusCode = 409;
      errorMessage = `Record already exists. Fields: ${error.meta?.target?.join(', ')}`;
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = (error.meta?.cause as string) || 'Record not found.';
    } else {
      errorMessage = `Database error occurred.`;
    }
  }
  return NextResponse.json({ error: errorMessage }, { status: statusCode });
};
// END HYPOTHETICAL SHARED UTILITIES

// Enum for Zod, ideally from src/types/brand-lift.ts
enum SurveyOverallApprovalStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  SIGNED_OFF = 'SIGNED_OFF',
}

// Placeholder for actual BrandLiftStudy status enum, ensure it matches your Prisma schema
enum BrandLiftStudyStatus_API {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED', // This status might be what the main study gets set to
  COLLECTING = 'COLLECTING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

const surveyApprovalStatusUpdateSchema = z.object({
  status: z.nativeEnum(SurveyOverallApprovalStatus),
  requestedSignOff: z.boolean().optional(), // Can be set true when moving to PENDING_REVIEW or APPROVED
});

// Updated tryCatch HOF for routes that use query params
async function tryCatchForQueryRoutes<TResponse>(
  handler: (request: NextRequest) => Promise<NextResponse<TResponse>>
): Promise<(request: NextRequest) => Promise<NextResponse<TResponse | { error: string }>>> {
  return async (request: NextRequest) => {
    try {
      // logger.info(`Request received: ${request.method} ${request.url}`);
      return await handler(request);
    } catch (error: any) {
      return handleApiError(error, request);
    }
  };
}

// PUT /api/brand-lift/approval/status?studyId=xxx
async function putApprovalStatusHandler(request: NextRequest) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated to update approval status.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 }); // Fallback
  }

  const { searchParams } = new URL(request.url);
  const studyId = searchParams.get('studyId');
  logger.info('Authenticated user for PUT /approval/status', {
    userId,
    orgId,
    studyIdFromQuery: studyId,
  });

  if (!studyId) {
    return NextResponse.json(
      { error: 'Study ID is required to update approval status.' },
      { status: 400 }
    );
  }

  // TODO: Authorization Logic:
  // 1. Verify studyId exists.
  // 2. Verify user (userId/orgId) has permission to update approval status for this study
  //    (e.g., study owner, admin, or specific roles like 'approver', 'signer').
  // Example:
  // const study = await prisma.brandLiftStudy.findUnique({ where: { id: studyId } });
  // if (!study) { return NextResponse.json({ error: "Study not found." }, { status: 404 }); }
  // const userRoles = (await clerkClient.users.getUser(userId)).publicMetadata.roles as string[] || [];
  // const canUpdateStatus = study.createdBy === userId || userRoles.includes('admin') || (orgId && study.organizationId === orgId && userRoles.includes('approver'));
  // if (!canUpdateStatus) { // throw new ForbiddenError("User does not have permission to update approval status for this study."); }

  const body = await request.json();
  const validatedData = surveyApprovalStatusUpdateSchema.parse(body);

  const updatePayloadForApprovalStatus: any = {
    status: validatedData.status, // Prisma enum SurveyOverallApprovalStatus
    updatedAt: new Date(),
  };

  if (validatedData.requestedSignOff !== undefined) {
    updatePayloadForApprovalStatus.requestedSignOff = validatedData.requestedSignOff;
  }

  if (validatedData.status === SurveyOverallApprovalStatus.SIGNED_OFF) {
    updatePayloadForApprovalStatus.signedOffBy = userId;
    updatePayloadForApprovalStatus.signedOffAt = new Date();
  }

  const updatedApprovalStatus = await prisma.surveyApprovalStatus.upsert({
    where: { studyId: studyId },
    update: updatePayloadForApprovalStatus,
    create: {
      studyId: studyId,
      status: validatedData.status,
      requestedSignOff: validatedData.requestedSignOff || false,
      ...(validatedData.status === SurveyOverallApprovalStatus.SIGNED_OFF && {
        signedOffBy: userId,
        signedOffAt: new Date(),
      }),
    },
    include: {
      study: { select: { name: true, status: true } },
    },
  });
  logger.info('SurveyApprovalStatus upserted for study', {
    studyId,
    approvalStatusId: updatedApprovalStatus.id,
    newStatus: validatedData.status,
    userId,
  });

  // Update the main BrandLiftStudy status based on the approval outcome
  let mainStudyNewStatus: BrandLiftStudyStatus_API | undefined;
  if (
    validatedData.status === SurveyOverallApprovalStatus.APPROVED ||
    validatedData.status === SurveyOverallApprovalStatus.SIGNED_OFF
  ) {
    mainStudyNewStatus = BrandLiftStudyStatus_API.APPROVED;
  } else if (validatedData.status === SurveyOverallApprovalStatus.CHANGES_REQUESTED) {
    mainStudyNewStatus = BrandLiftStudyStatus_API.PENDING_APPROVAL; // Or back to DRAFT depending on workflow
  } // Add other mappings if needed

  if (mainStudyNewStatus) {
    try {
      await prisma.brandLiftStudy.update({
        where: { id: studyId },
        data: { status: mainStudyNewStatus }, // Assumes BrandLiftStudy model has a status field matching BrandLiftStudyStatus_API values
      });
      logger.info('Main BrandLiftStudy status updated based on approval', {
        studyId,
        newMainStatus: mainStudyNewStatus,
      });
    } catch (e) {
      logger.error('Failed to update main BrandLiftStudy status after approval update', e, {
        studyId,
      });
      // Decide if this should cause the overall request to fail or just be logged
    }
  }

  // TODO: P3-04 - Integrate NotificationService for email notifications based on status change
  // try {
  //     const studyName = updatedApprovalStatus.study?.name || 'N/A';
  //     const recipientEmails = [/* determine recipients based on study ownership/roles */];

  //     if (validatedData.status === SurveyOverallApprovalStatus.APPROVED) {
  //         await NotificationService.sendStudyStatusChangeEmail({
  //             studyId,
  //             studyName,
  //             newStatus: 'APPROVED',
  //             recipientEmails,
  //             // customMessage: "The survey has been approved and may require sign-off."
  //         });
  //     } else if (validatedData.status === SurveyOverallApprovalStatus.CHANGES_REQUESTED) {
  //         await NotificationService.sendStudyStatusChangeEmail({
  //             studyId,
  //             studyName,
  //             newStatus: 'CHANGES_REQUESTED',
  //             recipientEmails,
  //             // customMessage: "Changes have been requested for the survey."
  //         });
  //     } else if (validatedData.status === SurveyOverallApprovalStatus.SIGNED_OFF) {
  //         await NotificationService.sendStudyStatusChangeEmail({
  //             studyId,
  //             studyName,
  //             newStatus: 'SIGNED_OFF',
  //             recipientEmails,
  //             // customMessage: "The survey has been signed off and is ready for data collection."
  //         });
  //     }
  //     if (validatedData.requestedSignOff && validatedData.status === SurveyOverallApprovalStatus.APPROVED) {
  //          await NotificationService.sendApprovalRequestedEmail({
  //              studyId,
  //              studyName,
  //              // recipientEmails: [/* approver emails */],
  //              // requestedBy: userId
  //          });
  //     }
  //     logger.info('Approval status change notification sent', { studyId, newStatus: validatedData.status });
  // } catch (emailError) {
  //     logger.error('Failed to send approval status change notification', emailError, { studyId });
  // }

  return NextResponse.json(updatedApprovalStatus, { status: 200 });
}

export const PUT = tryCatchForQueryRoutes(putApprovalStatusHandler);
