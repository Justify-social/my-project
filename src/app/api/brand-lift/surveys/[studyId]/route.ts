import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { BrandLiftStudyStatus, Prisma } from '@prisma/client';
import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { NotificationService } from '@/lib/notificationService';
import { BASE_URL } from '@/config/constants';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CintApiService } from '@/lib/cint';

const updateStudySchema = z
  .object({
    name: z.string().min(1).optional(),
    funnelStage: z.string().min(1).optional(),
    primaryKpi: z.string().min(1).optional(),
    secondaryKpis: z.array(z.string()).optional(),
    status: z.nativeEnum(BrandLiftStudyStatus).optional(),
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field for update is required.',
  });

const notificationServiceInstance = new NotificationService();
const cintService = new CintApiService(
  process.env.CINT_CLIENT_ID || 'mock_client_id',
  process.env.CINT_CLIENT_SECRET || 'mock_client_secret',
  process.env.CINT_ACCOUNT_ID || 'mock_account_id',
  process.env.CINT_S2S_API_KEY || 'mock_s2s_key'
);

export const GET = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

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
      include: {
        campaign: { select: { campaignName: true } },
        _count: { select: { questions: true } },
      },
    });
    if (!study) throw new NotFoundError('Study not found or not accessible by this user.');
    logger.info('Fetched Brand Lift Study details', { studyId, userId: clerkUserId });
    return NextResponse.json(study);
  } catch (error: any) {
    return handleApiError(error, req);
  }
};

export const PUT = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

    const body = await req.json();
    const validation = updateStudySchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid study update data', {
        studyId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
      });
      throw validation.error;
    }

    const updateData = validation.data;

    const userRecord = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
    if (!userRecord) {
      throw new NotFoundError('User not found for study update authorization.');
    }
    const internalUserId = userRecord.id;

    const existingStudy = await db.brandLiftStudy.findFirst({
      where: {
        id: studyId,
        campaign: {
          userId: internalUserId,
        },
      },
      select: {
        id: true,
        status: true,
        name: true,
        campaign: { select: { userId: true, campaignName: true } },
      },
    });
    if (!existingStudy) throw new NotFoundError('Study not found or not accessible by this user.');

    const currentStatus = existingStudy.status as BrandLiftStudyStatus;
    if (
      updateData.status &&
      (currentStatus === BrandLiftStudyStatus.COLLECTING ||
        currentStatus === BrandLiftStudyStatus.COMPLETED ||
        currentStatus === BrandLiftStudyStatus.ARCHIVED) &&
      currentStatus !== updateData.status &&
      updateData.status !== BrandLiftStudyStatus.ARCHIVED
    ) {
      throw new ForbiddenError(
        `Study status ${currentStatus} cannot be changed to ${updateData.status} via this endpoint unless archiving.`
      );
    }

    let finalUpdatedStudy;

    if (
      updateData.status === BrandLiftStudyStatus.COLLECTING &&
      existingStudy.status !== BrandLiftStudyStatus.COLLECTING
    ) {
      logger.info(`Attempting to launch study ${studyId} on Cint...`, { userId: clerkUserId });
      try {
        const fullStudyForCint = await db.brandLiftStudy.findUnique({
          where: { id: studyId },
          include: { campaign: true },
        });
        if (!fullStudyForCint)
          throw new NotFoundError('Full study details not found for Cint launch.');

        const CINT_PROJECT_MANAGER_ID = process.env.CINT_PROJECT_MANAGER_ID || 'pm_default_mock';
        const CINT_BUSINESS_UNIT_ID = process.env.CINT_BUSINESS_UNIT_ID || 'bu_default_mock';

        const cintProject = await cintService.createCintProject(
          fullStudyForCint.name,
          CINT_PROJECT_MANAGER_ID
        );
        logger.info('Cint Project created', { studyId, cintProjectId: cintProject.id });

        const surveyLiveUrl = `${BASE_URL}/survey/${studyId}?rid=[%RID%]`;

        const cintTargetGroup = await cintService.createCintTargetGroup(
          cintProject.id,
          fullStudyForCint as any,
          surveyLiveUrl,
          CINT_PROJECT_MANAGER_ID,
          CINT_BUSINESS_UNIT_ID
        );
        logger.info('Cint Target Group created', {
          studyId,
          cintTargetGroupId: cintTargetGroup.id,
        });

        const endFieldingAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        await cintService.launchCintTargetGroup(cintProject.id, cintTargetGroup.id, endFieldingAt);
        logger.info('Cint Target Group launched', {
          studyId,
          cintTargetGroupId: cintTargetGroup.id,
        });

        const dataToUpdate: Prisma.BrandLiftStudyUpdateInput = {
          status: BrandLiftStudyStatus.COLLECTING,
          cintProjectId: cintProject.id,
          cintTargetGroupId: cintTargetGroup.id,
        };
        if (updateData.name) dataToUpdate.name = updateData.name;
        if (updateData.funnelStage) dataToUpdate.funnelStage = updateData.funnelStage;
        if (updateData.primaryKpi) dataToUpdate.primaryKpi = updateData.primaryKpi;
        if (updateData.secondaryKpis) dataToUpdate.secondaryKpis = updateData.secondaryKpis;

        finalUpdatedStudy = await db.brandLiftStudy.update({
          where: { id: studyId },
          data: dataToUpdate,
          select: {
            id: true,
            name: true,
            status: true,
            campaign: { select: { userId: true, campaignName: true } },
          },
        });
      } catch (cintLaunchError: any) {
        logger.error('Cint launch failed', { studyId, error: cintLaunchError.message });
        throw new Error(
          `Cint launch failed: ${cintLaunchError.message}. Study status not changed to COLLECTING.`
        );
      }
    } else {
      finalUpdatedStudy = await db.brandLiftStudy.update({
        where: { id: studyId },
        data: updateData,
        select: {
          id: true,
          name: true,
          status: true,
          campaign: { select: { userId: true, campaignName: true } },
        },
      });
    }

    if (
      updateData.status === BrandLiftStudyStatus.PENDING_APPROVAL &&
      existingStudy.status !== BrandLiftStudyStatus.PENDING_APPROVAL
    ) {
      try {
        const studyCreatorCampaignUserId = finalUpdatedStudy.campaign?.userId;
        let submitterDetails: { email: string; name?: string | null } | null = null;
        if (studyCreatorCampaignUserId) {
          submitterDetails = await db.user.findUnique({
            where: { id: studyCreatorCampaignUserId },
            select: { email: true, name: true },
          });
        } else {
          submitterDetails = await db.user.findUnique({
            where: { id: clerkUserId },
            select: { email: true, name: true },
          });
        }

        const designatedReviewerEmails = ['team-review@example.com'];

        if (submitterDetails?.email && designatedReviewerEmails.length > 0) {
          const approvalPageUrl = `${BASE_URL}/approval/${finalUpdatedStudy.id}`;
          await notificationServiceInstance.sendSurveySubmittedForReviewEmail(
            designatedReviewerEmails.map(email => ({ email })),
            { id: finalUpdatedStudy.id, name: finalUpdatedStudy.name, approvalPageUrl },
            { email: submitterDetails.email, name: submitterDetails.name ?? undefined }
          );
          logger.info('"Study Submitted for Review" notification sent', { studyId });
        } else {
          logger.warn(
            'Could not send "Study Submitted for Review" notification due to missing submitter/reviewer details',
            { studyId, submitterDetailsProvided: !!submitterDetails, designatedReviewerEmails }
          );
        }
      } catch (emailError: any) {
        logger.error('Failed to send "Study Submitted for Review" email', {
          studyId,
          error: emailError.message,
        });
      }
    }

    logger.info('Brand Lift Study updated successfully', {
      studyId,
      userId: clerkUserId,
      newStatus: finalUpdatedStudy.status,
    });
    return NextResponse.json(finalUpdatedStudy);
  } catch (error: any) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('Study not found for update.');
    }
    return handleApiError(error, req);
  }
};

// DELETE handler can be added here if needed later, following similar structure.
