import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuth, clerkClient } from '@clerk/nextjs/server';

// HYPOTHETICAL SHARED UTILITIES (Illustrative - these would be in separate files)
const logger = {
  info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
  error: (message: string, error?: any, context?: any) =>
    console.error(`[ERROR] ${message}`, error, context || ''),
};

const handleApiError = (error: any, request?: NextRequest) => {
  // Changed Request to NextRequest
  // Default error
  let statusCode = 500;
  let errorMessage = 'An unexpected error occurred.';

  // Log the error with context
  const { method, url } = request || {};
  logger.error(`API Error: ${error.message}`, error, { method, url });

  if (error.name === 'UnauthenticatedError') {
    // Hypothetical custom error
    statusCode = 401;
    errorMessage = error.message || 'User not authenticated.';
  } else if (error.name === 'ForbiddenError') {
    // Hypothetical custom error
    statusCode = 403;
    errorMessage = error.message || 'User does not have permission for this action.';
  } else if (error instanceof z.ZodError) {
    statusCode = 400;
    errorMessage = error.errors.map(e => e.message).join(', ');
  } else if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      statusCode = 409; // Conflict
      errorMessage = `Record already exists. Fields: ${error.meta?.target?.join(', ')}`;
    } else if (error.code === 'P2025') {
      statusCode = 404;
      errorMessage = (error.meta?.cause as string) || 'Record not found.';
    } else {
      errorMessage = `Database error occurred.`; // Avoid leaking sensitive error.message
    }
  }
  // ... add more specific error type handling as needed

  return NextResponse.json({ error: errorMessage }, { status: statusCode });
};
// END HYPOTHETICAL SHARED UTILITIES

// Helper enum (should ideally be imported from src/types/brand-lift.ts)
// Duplicating here for self-containment in this snippet, but SSOT should be in types file.
enum BrandLiftStudyStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  COLLECTING = 'COLLECTING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

const brandLiftStudyUpdateSchema = z
  .object({
    name: z.string().min(1, { message: 'Study name is required.' }).optional(),
    // campaignId is typically not updatable once a study is linked. If it is, ensure business logic allows.
    // campaignId: z.string().min(1, { message: "Campaign ID is required." }).optional(),
    funnelStage: z.string().min(1, { message: 'Funnel stage is required.' }).optional(),
    primaryKpi: z.string().min(1, { message: 'Primary KPI is required.' }).optional(),
    secondaryKpis: z.array(z.string()).optional(),
    status: z.nativeEnum(BrandLiftStudyStatus).optional(),
  })
  .partial(); // Use .partial() to make all fields optional for PUT/PATCH

// Updated tryCatch to use shared error/logging utilities
async function tryCatch<TResponse, TParams = { studyId: string }>(
  // paramsContainer is now non-optional for the handler, as this route file implies params will exist
  handler: (
    request: NextRequest,
    paramsContainer: { params: TParams }
  ) => Promise<NextResponse<TResponse>>
): Promise<
  (
    request: NextRequest,
    paramsContainer: { params: TParams }
  ) => Promise<NextResponse<TResponse | { error: string }>>
> {
  // The function returned by tryCatch will also expect paramsContainer for dynamic routes
  return async (request: NextRequest, paramsContainer: { params: TParams }) => {
    try {
      // logger.info(`Request received: ${request.method} ${request.url}`, { params: paramsContainer?.params });
      return await handler(request, paramsContainer);
    } catch (error: any) {
      return handleApiError(error, request);
    }
  };
}

async function getStudyHandler(request: NextRequest, { params }: { params: { studyId: string } }) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId } = params;
  logger.info('Authenticated user for GET /surveys/{studyId}', { userId, orgId, studyId });

  // TODO: Authorization Logic for fetching a specific study
  // Example: Check if the user is the creator or part of the organization associated with the study.
  // const studyForAuth = await prisma.brandLiftStudy.findUnique({ where: { id: studyId }, select: { createdBy: true, organizationId: true } });
  // if (!studyForAuth) { return NextResponse.json({ error: "Study not found" }, { status: 404 }); }
  // const canAccess = (studyForAuth.createdBy === userId) || (orgId && studyForAuth.organizationId === orgId && /* check user role in org */ true);
  // if (!canAccess) {
  //    // throw new ForbiddenError("User does not have permission to access this study.");
  //    return NextResponse.json({ error: "User does not have permission." }, { status: 403 });
  // }

  const study = await prisma.brandLiftStudy.findUnique({
    where: { id: studyId },
    // include: { questions: true } // Optionally include related data
  });

  if (!study) {
    return NextResponse.json({ error: 'Study not found' }, { status: 404 });
  }
  return NextResponse.json(study, { status: 200 });
}

async function putStudyHandler(request: NextRequest, { params }: { params: { studyId: string } }) {
  const { userId, orgId } = getAuth(request);
  if (!userId) {
    // throw new UnauthenticatedError("User not authenticated.");
    return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
  }
  const { studyId } = params;
  logger.info('Authenticated user for PUT /surveys/{studyId}', { userId, orgId, studyId });

  // TODO: Authorization Logic for updating a specific study
  // Example: Similar to GET, check ownership or specific update permissions.
  // const studyForAuth = await prisma.brandLiftStudy.findUnique({ where: { id: studyId }, select: { createdBy: true, organizationId: true } });
  // if (!studyForAuth) { return NextResponse.json({ error: "Study not found" }, { status: 404 }); }
  // const canUpdate = (studyForAuth.createdBy === userId) || (orgId && studyForAuth.organizationId === orgId && /* check user role for update rights */ true);
  // if (!canUpdate) {
  //    // throw new ForbiddenError("User does not have permission to update this study.");
  //    return NextResponse.json({ error: "User does not have permission." }, { status: 403 });
  // }
  // Also, consider if study status prevents updates (e.g., if 'COLLECTING' or 'COMPLETED').

  const body = await request.json();
  const validatedData = brandLiftStudyUpdateSchema.parse(body);

  if (Object.keys(validatedData).length === 0) {
    return NextResponse.json({ error: 'No fields to update provided.' }, { status: 400 });
  }

  // If campaignId is part of validatedData and needs to be Int, handle conversion
  // However, campaignId is usually not updatable for an existing study.
  // const updatePayload: any = { ...validatedData };
  // if (validatedData.campaignId) {
  //   updatePayload.campaignId = parseInt(validatedData.campaignId, 10);
  // }

  const updatedStudy = await prisma.brandLiftStudy.update({
    where: { id: studyId /*, createdBy: userId */ }, // Example: Ensure user can only update their own studies
    data: validatedData,
  });
  logger.info('BrandLiftStudy updated', {
    studyId: updatedStudy.id,
    userId,
    status: validatedData.status,
  });

  // TODO: P3-04 - Integrate NotificationService for email notifications
  // if (validatedData.status === BrandLiftStudyStatus.PENDING_APPROVAL) {
  //    try {
  //        await NotificationService.sendSurveySubmittedForReviewEmail({
  //            studyId: updatedStudy.id,
  //            studyName: updatedStudy.name,
  //            // recipientEmails: [/* array of reviewer emails */],
  //            // submittedBy: userId
  //        });
  //        logger.info('PENDING_APPROVAL notification sent for study', { studyId: updatedStudy.id });
  //    } catch (emailError) {
  //        logger.error('Failed to send PENDING_APPROVAL notification', emailError, { studyId: updatedStudy.id });
  //    }
  // }

  return NextResponse.json(updatedStudy, { status: 200 });
}

export const GET = tryCatch(getStudyHandler);
export const PUT = tryCatch(putStudyHandler);

// DELETE handler can be added here if needed later, following similar structure.
