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
import { addOrUpdateBrandLiftStudyInAlgolia, deleteBrandLiftStudyFromAlgolia } from '@/lib/algolia';
import { BrandLiftStudyData } from '@/types/brand-lift';

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
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');
    if (!orgId)
      throw new BadRequestError('Active organization context is required to view this study.');

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

    const studyData = await db.brandLiftStudy.findFirst({
      where: {
        id: studyId,
        orgId: orgId,
      },
      select: {
        id: true,
        name: true,
        submissionId: true,
        status: true,
        funnelStage: true,
        primaryKpi: true,
        secondaryKpis: true,
        createdAt: true,
        updatedAt: true,
        cintProjectId: true,
        cintTargetGroupId: true,
        campaign: {
          select: {
            campaignName: true,
            wizard: {
              select: {
                id: true,
              },
            },
          },
        },
        _count: { select: { questions: true } },
      },
    });

    if (!studyData) {
      throw new NotFoundError('Study not found or you do not have permission to view it.');
    }

    // Prepare campaign details for the response, ensuring UUID is available for linking
    const campaignDetails = studyData.campaign
      ? {
        campaignName: studyData.campaign.campaignName,
        uuid: studyData.campaign.wizard?.id, // This is the CampaignWizard.id (Campaign UUID)
        // We are not including the nested wizard object in the final campaign object
      }
      : undefined;

    const responseData: BrandLiftStudyData = {
      ...(studyData as any), // Cast to any to handle Prisma specific types before reshaping
      campaignId: studyData.submissionId.toString(), // Keep original campaignId (submissionId) for compatibility if needed
      campaign: campaignDetails,
    };
    // Remove the original nested campaign.wizard if it exists, as uuid is now at campaign.uuid
    // This step depends on the exact structure of studyData and if direct manipulation is safe.
    // A safer way is to explicitly pick fields for responseData if studyData is complex.
    // For now, let's assume the spread and override is okay, but be mindful.

    // Clean up potentially unneeded nested structure from the original studyData.campaign if it was spread.
    // This is a bit tricky with direct spread. A more explicit construction of responseData is safer.
    // Let's reconstruct responseData more carefully:

    const finalResponseData: BrandLiftStudyData = {
      id: studyData.id,
      name: studyData.name,
      // campaignId in BrandLiftStudyData is the stringified submissionId (CampaignWizardSubmission.id)
      campaignId: studyData.submissionId.toString(),
      status: studyData.status,
      funnelStage: studyData.funnelStage,
      primaryKpi: studyData.primaryKpi,
      secondaryKpis: studyData.secondaryKpis as string[],
      createdAt: studyData.createdAt,
      updatedAt: studyData.updatedAt,
      cintProjectId: studyData.cintProjectId,
      cintTargetGroupId: studyData.cintTargetGroupId,
      campaign: campaignDetails, // This now has { campaignName, uuid }
      // questions: undefined, // Questions are usually fetched separately for detailed views
      // _count: studyData._count, // If needed by client
    };

    logger.info('Fetched Brand Lift Study details', { studyId, userId: clerkUserId, orgId });
    return NextResponse.json(finalResponseData);
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
};

export const PUT = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');
    if (!orgId)
      throw new BadRequestError(
        'Active organization context is required to update a brand lift study.'
      );

    const { studyId } = await paramsPromise;
    if (!studyId) throw new BadRequestError('Study ID is required.');

    const body = await req.json();
    const validation = updateStudySchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid study update data', {
        studyId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
        orgId,
      });
      throw validation.error;
    }

    const updateData = validation.data;

    const existingStudy = await db.brandLiftStudy.findUnique({
      where: {
        id: studyId,
      },
      select: {
        id: true,
        status: true,
        name: true,
        orgId: true,
        campaign: {
          select: { userId: true, campaignName: true, wizard: { select: { orgId: true } } },
        },
      },
    });
    if (!existingStudy) throw new NotFoundError('Study not found.');

    if (existingStudy.orgId === null) {
      logger.warn(
        `User ${clerkUserId} in org ${orgId} attempted to update legacy brand lift study ${studyId} (null orgId). Action denied.`
      );
      throw new ForbiddenError(
        'This study is not associated with an organization and cannot be updated.'
      );
    } else if (existingStudy.orgId !== orgId) {
      logger.warn(
        `User ${clerkUserId} in org ${orgId} attempted to update brand lift study ${studyId} belonging to org ${existingStudy.orgId}. Action denied.`
      );
      throw new ForbiddenError('You do not have permission to update this study.');
    }

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
      logger.info(`Study ${studyId} status changing to COLLECTING. Cint launch logic deferred for MVP.`, {
        userId: clerkUserId,
        orgId,
      });
      // try {
      //   const fullStudyForCint = await db.brandLiftStudy.findUnique({
      //     where: { id: studyId },
      //     include: { campaign: true },
      //   });
      //   if (!fullStudyForCint)
      //     throw new NotFoundError('Full study details not found for Cint launch.');

      //   const CINT_PROJECT_MANAGER_ID = process.env.CINT_PROJECT_MANAGER_ID || 'pm_default_mock';
      //   const CINT_BUSINESS_UNIT_ID = process.env.CINT_BUSINESS_UNIT_ID || 'bu_default_mock';

      //   const cintProject = await cintService.createCintProject(
      //     fullStudyForCint.name,
      //     CINT_PROJECT_MANAGER_ID
      //   );
      //   logger.info('Cint Project created', { studyId, cintProjectId: cintProject.id, orgId });

      //   const surveyLiveUrl = `${BASE_URL}/survey/${studyId}?rid=[%RID%]`;

      //   const cintTargetGroup = await cintService.createCintTargetGroup(
      //     cintProject.id,
      //     fullStudyForCint as unknown as BrandLiftStudyData,
      //     surveyLiveUrl,
      //     CINT_PROJECT_MANAGER_ID,
      //     CINT_BUSINESS_UNIT_ID
      //   );
      //   logger.info('Cint Target Group created', {
      //     studyId,
      //     cintTargetGroupId: cintTargetGroup.id,
      //     orgId,
      //   });

      //   const endFieldingAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      //   await cintService.launchCintTargetGroup(cintProject.id, cintTargetGroup.id, endFieldingAt);
      //   logger.info('Cint Target Group launched', {
      //     studyId,
      //     cintTargetGroupId: cintTargetGroup.id,
      //     orgId,
      //   });

      //   const dataToUpdateForCintLaunch: Prisma.BrandLiftStudyUpdateInput = {
      //     status: BrandLiftStudyStatus.COLLECTING,
      //     cintProjectId: cintProject.id,
      //     cintTargetGroupId: cintTargetGroup.id,
      //   };
      //   if (updateData.name) dataToUpdateForCintLaunch.name = updateData.name;
      //   if (updateData.funnelStage) dataToUpdateForCintLaunch.funnelStage = updateData.funnelStage;
      //   if (updateData.primaryKpi) dataToUpdateForCintLaunch.primaryKpi = updateData.primaryKpi;
      //   if (updateData.secondaryKpis)
      //     dataToUpdateForCintLaunch.secondaryKpis = updateData.secondaryKpis;

      //   finalUpdatedStudy = await db.brandLiftStudy.update({
      //     where: { id: studyId },
      //     data: dataToUpdateForCintLaunch,
      //     include: {
      //       campaign: { select: { campaignName: true, wizard: { select: { orgId: true } } } },
      //     },
      //   });
      // } catch (cintLaunchError: unknown) {
      //   logger.error('Cint launch failed', {
      //     studyId,
      //     error: (cintLaunchError as Error).message,
      //     orgId,
      //   });
      //   throw new Error(
      //     `Cint launch failed: ${(cintLaunchError as Error).message}. Study status not changed to COLLECTING.`
      //   );
      // }

      // For MVP with manual report: Just update status to COLLECTING
      finalUpdatedStudy = await db.brandLiftStudy.update({
        where: { id: studyId },
        data: { status: BrandLiftStudyStatus.COLLECTING }, // Only update status
        include: {
          campaign: { select: { campaignName: true, wizard: { select: { orgId: true } } } },
        },
      });
      logger.info('BrandLiftStudy status updated to COLLECTING (Cint launch deferred for MVP)', { studyId });

    } else {
      finalUpdatedStudy = await db.brandLiftStudy.update({
        where: { id: studyId },
        data: updateData,
        include: {
          campaign: { select: { campaignName: true, wizard: { select: { orgId: true } } } },
        },
      });
    }

    // Index the updated study in Algolia
    try {
      logger.info(`[Algolia] Indexing updated BrandLiftStudy ${studyId}`);
      await addOrUpdateBrandLiftStudyInAlgolia(finalUpdatedStudy);
      logger.info(`[Algolia] Successfully indexed updated BrandLiftStudy ${studyId}.`);
    } catch (algoliaError: unknown) {
      logger.error(
        `[Algolia] Failed to index updated BrandLiftStudy ${studyId}. DB update was successful.`,
        {
          studyId: studyId,
          errorName: (algoliaError as Error).name,
          errorMessage: (algoliaError as Error).message,
        }
      );
      // Non-critical error for the main PUT operation
    }

    if (
      updateData.status === BrandLiftStudyStatus.PENDING_APPROVAL &&
      existingStudy.status !== BrandLiftStudyStatus.PENDING_APPROVAL
    ) {
      try {
        const submitterDetails = await db.user.findUnique({
          where: { clerkId: clerkUserId },
          select: { email: true, name: true },
        });

        const designatedReviewerEmails = ['team-review@example.com'];

        if (submitterDetails?.email && designatedReviewerEmails.length > 0) {
          const approvalPageUrl = `${BASE_URL}/approval/${finalUpdatedStudy.id}`;
          await notificationServiceInstance.sendSurveySubmittedForReviewEmail(
            designatedReviewerEmails.map(email => ({ email })),
            { id: finalUpdatedStudy.id, name: finalUpdatedStudy.name, approvalPageUrl },
            { email: submitterDetails.email, name: submitterDetails.name ?? undefined }
          );
          logger.info('"Study Submitted for Review" notification sent', { studyId, orgId });
        } else {
          logger.warn(
            'Could not send "Study Submitted for Review" notification due to missing submitter/reviewer details',
            {
              studyId,
              submitterDetailsProvided: !!submitterDetails,
              designatedReviewerEmails,
              orgId,
            }
          );
        }
      } catch (emailError: unknown) {
        logger.error('Failed to send "Study Submitted for Review" email', {
          studyId,
          error: (emailError as Error).message,
          orgId,
        });
      }
    }

    logger.info('Brand Lift Study updated successfully in DB', {
      studyId,
      userId: clerkUserId,
      orgId,
      newStatus: finalUpdatedStudy.status,
    });
    return NextResponse.json(finalUpdatedStudy);
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('Study not found for update.');
    }
    return handleApiError(error, req);
  }
};

export async function DELETE(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) {
  try {
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }
    if (!orgId) {
      throw new BadRequestError(
        'Active organization context is required to delete a brand lift study.'
      );
    }

    const { studyId } = await paramsPromise;
    if (!studyId) {
      throw new BadRequestError('Study ID is required for deletion.');
    }

    logger.info('Attempting to delete BrandLiftStudy from DB', {
      studyId,
      userId: clerkUserId,
      orgId,
    });

    const studyToDelete = await db.brandLiftStudy.findUnique({
      where: { id: studyId },
      select: { orgId: true, name: true, status: true },
    });

    if (!studyToDelete) {
      logger.warn('BrandLiftStudy not found for deletion attempt', {
        studyId,
        userId: clerkUserId,
        orgId,
      });
      throw new NotFoundError('Study not found.');
    }

    if (studyToDelete.orgId !== orgId) {
      logger.warn(
        `User ${clerkUserId} in org ${orgId} attempted to delete brand lift study ${studyId} belonging to org ${studyToDelete.orgId}. Action denied.`
      );
      throw new ForbiddenError('You do not have permission to delete this study.');
    }

    if (
      studyToDelete.status === BrandLiftStudyStatus.COLLECTING ||
      studyToDelete.status === BrandLiftStudyStatus.COMPLETED
    ) {
      logger.warn('Attempt to delete an active/collecting/completed BrandLiftStudy denied', {
        studyId,
        studyStatus: studyToDelete.status,
        userId: clerkUserId,
        orgId,
      });
      throw new BadRequestError(
        `Cannot delete study "${studyToDelete.name}" because it is ${studyToDelete.status.toLowerCase()}. Consider archiving.`
      );
    }

    await db.brandLiftStudy.delete({
      where: { id: studyId },
    });

    logger.info('BrandLiftStudy deleted successfully from DB', {
      studyId,
      userId: clerkUserId,
      orgId,
    });

    try {
      logger.info(`[Algolia] Deleting BrandLiftStudy ${studyId} from Algolia.`);
      await deleteBrandLiftStudyFromAlgolia(studyId);
      logger.info(`[Algolia] Successfully deleted BrandLiftStudy ${studyId} from Algolia.`);
    } catch (algoliaError: unknown) {
      logger.error(
        `[Algolia] Failed to delete BrandLiftStudy ${studyId} from Algolia. DB deletion was successful.`,
        {
          studyId: studyId,
          errorName: (algoliaError as Error).name,
          errorMessage: (algoliaError as Error).message,
        }
      );
    }

    return NextResponse.json(
      { success: true, message: `Study "${studyToDelete.name}" deleted successfully.` },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
}

const duplicateStudyBodySchema = z.object({
  newName: z.string().min(1, { message: 'New study name is required' }),
});

export async function POST(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) {
  try {
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }
    if (!orgId) {
      throw new BadRequestError(
        'Active organization context is required to duplicate a brand lift study.'
      );
    }

    const { studyId: originalStudyId } = await paramsPromise;
    if (!originalStudyId) {
      throw new BadRequestError('Original Study ID is required for duplication.');
    }

    const body = await req.json();
    const validation = duplicateStudyBodySchema.safeParse(body);
    if (!validation.success) {
      logger.warn('Invalid duplicate study request body', {
        originalStudyId,
        errors: validation.error.flatten().fieldErrors,
        userId: clerkUserId,
        orgId,
      });
      throw validation.error;
    }

    const { newName } = validation.data;

    logger.info('Attempting to duplicate BrandLiftStudy via nested create', {
      originalStudyId,
      newName,
      userId: clerkUserId,
      orgId,
    });

    const originalStudy = await db.brandLiftStudy.findUnique({
      where: {
        id: originalStudyId,
        orgId: orgId,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!originalStudy) {
      logger.warn('Original BrandLiftStudy not found or access denied for duplication', {
        originalStudyId,
        userId: clerkUserId,
        orgId,
      });
      throw new NotFoundError(
        'Original study not found or you do not have permission to duplicate it.'
      );
    }

    const questionsData = originalStudy.questions.map(q => ({
      text: q.text,
      questionType: q.questionType,
      order: q.order,
      isRandomized: q.isRandomized ?? false,
      isMandatory: q.isMandatory ?? true,
      kpiAssociation: q.kpiAssociation,
      options: {
        create: q.options.map(opt => ({
          text: opt.text,
          imageUrl: opt.imageUrl ?? null,
          order: opt.order,
        })),
      },
    }));

    const newStudyData = await db.$transaction(async prismaTx => {
      const newStudy = await prismaTx.brandLiftStudy.create({
        data: {
          name: newName,
          submissionId: originalStudy.submissionId,
          funnelStage: originalStudy.funnelStage,
          primaryKpi: originalStudy.primaryKpi,
          secondaryKpis: originalStudy.secondaryKpis,
          status: BrandLiftStudyStatus.DRAFT,
          orgId: originalStudy.orgId,
          questions: {
            create: questionsData,
          },
        },
      });

      return {
        id: newStudy.id,
        name: newStudy.name,
        orgId: newStudy.orgId,
        status: newStudy.status,
      };
    });

    if (!newStudyData || !newStudyData.id) {
      throw new Error('Failed to create duplicated study within transaction.');
    }

    const duplicatedStudyWithDetails = await db.brandLiftStudy.findUnique({
      where: { id: newStudyData.id },
      include: {
        questions: { include: { options: true } },
        campaign: { select: { campaignName: true } },
      },
    });

    if (!duplicatedStudyWithDetails) {
      throw new Error('Failed to retrieve duplicated study details after transaction.');
    }

    logger.info('BrandLiftStudy duplicated successfully', {
      originalStudyId,
      newStudyId: duplicatedStudyWithDetails.id,
      newName,
      userId: clerkUserId,
      orgId,
    });
    return NextResponse.json({ success: true, data: duplicatedStudyWithDetails }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
}
