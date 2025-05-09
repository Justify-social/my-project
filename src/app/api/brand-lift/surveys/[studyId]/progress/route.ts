import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Prisma, BrandLiftStudyStatus } from '@prisma/client';

import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, NotFoundError, UnauthenticatedError, ForbiddenError } from '@/lib/errors';
import { CintApiService } from '@/lib/cint'; // For fetching live Cint progress

const cintService = new CintApiService(); // Relies on env vars

// Helper to verify study access
async function verifyStudyAccess(studyId: string, clerkUserId: string) {
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
    select: {
      id: true,
      status: true,
      cintProjectId: true, // Needed for Cint API calls
      cintTargetGroupId: true, // Needed for Cint API calls
    },
  });
  if (!study) throw new NotFoundError('Study not found or not accessible.');

  // Allow progress view for most active/completed statuses
  const allowedStatuses: BrandLiftStudyStatus[] = [
    BrandLiftStudyStatus.COLLECTING,
    BrandLiftStudyStatus.COMPLETED,
    BrandLiftStudyStatus.PENDING_APPROVAL, // Might want to see zero progress before launch
    BrandLiftStudyStatus.APPROVED, // Might want to see zero progress before launch
  ];
  if (!allowedStatuses.includes(study.status as BrandLiftStudyStatus)) {
    throw new ForbiddenError(`Progress tracking not available for study status: ${study.status}`);
  }
  return study;
}

export const GET = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

    const study = await verifyStudyAccess(studyId, clerkUserId);

    // 1. Get response count from our database
    const localResponseCount = await db.surveyResponse.count({
      where: { studyId: studyId },
    });

    let cintProgress = null;
    // 2. Optionally, get live progress from Cint if IDs are available
    if (study.cintProjectId && study.cintTargetGroupId) {
      try {
        // Note: In a real scenario, check if cintService is in mock mode or live mode.
        // If live, this makes an actual API call to Cint.
        cintProgress = await cintService.getTargetGroupOverview(
          study.cintProjectId,
          study.cintTargetGroupId
        );
        logger.info('Fetched live progress from Cint', {
          studyId,
          cintProjectId: study.cintProjectId,
          cintTargetGroupId: study.cintTargetGroupId,
        });
      } catch (cintError: any) {
        logger.warn('Failed to fetch live progress from Cint', {
          studyId,
          error: cintError.message,
        });
        // Don't fail the whole request if Cint call fails, can still return local count
      }
    }

    // 3. TODO: Calculate basic interim lift metrics (Placeholder for MVP)
    // This would involve fetching actual responses and comparing control vs exposed groups if identifiable.
    // For now, we can return placeholders or just the counts.
    const interimMetrics = {
      exposedCount: cintProgress?.statistics.current_completes || localResponseCount, // Example: use Cint completes if available
      controlCount: 0, // Placeholder: Need logic for control group identification
      // Example lift metric (very simplified - actual lift needs proper calculation)
      // awarenessLift: cintProgress ? (cintProgress.statistics.incidence_rate_median * 0.1) * 100 : null
    };

    const responsePayload = {
      studyId: study.id,
      studyStatus: study.status,
      localDatabaseResponseCount: localResponseCount,
      cintLiveProgress: cintProgress
        ? {
            status: cintProgress.status,
            targetCompletes: cintProgress.statistics.filling_goal,
            currentCompletes: cintProgress.statistics.current_completes,
            currentPrescreens: cintProgress.statistics.current_prescreens,
            medianIR: cintProgress.statistics.incidence_rate_median,
            medianLOISeconds: cintProgress.statistics.length_of_interview_median_seconds,
          }
        : null,
      interimLiftMetrics: interimMetrics, // Placeholder for now
    };

    logger.info('Fetched study progress', { studyId, userId: clerkUserId });
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    return handleApiError(error, req);
  }
};
