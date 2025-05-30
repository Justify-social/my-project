import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { BrandLiftStudyStatus } from '@prisma/client';
import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthenticatedError } from '@/lib/errors';
import { NotificationService } from '@/lib/notificationService';
import { BASE_URL } from '@/config/constants';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

export const GET = async (
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) => {
  try {
    const { userId: clerkUserId, orgId } = await auth();
    if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');
    if (!orgId)
      throw new BadRequestError('Active organization context is required to view this study.');

    const params = await paramsPromise;
    const { studyId } = params;
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
        orgId: true,
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
      },
    });

    if (!studyData) {
      throw new NotFoundError('Study not found or you do not have permission to view it.');
    }

    const campaignDetailsForResponse = studyData.campaign
      ? {
          campaignName: studyData.campaign.campaignName,
          uuid: studyData.campaign.wizard?.id,
        }
      : undefined;

    const finalResponseData: BrandLiftStudyData = {
      id: studyData.id,
      name: studyData.name,
      campaignId: studyData.campaign?.wizard?.id || studyData.submissionId.toString(),
      status: studyData.status,
      funnelStage: studyData.funnelStage,
      primaryKpi: studyData.primaryKpi,
      secondaryKpis: studyData.secondaryKpis as string[],
      createdAt: studyData.createdAt,
      updatedAt: studyData.updatedAt,
      cintProjectId: studyData.cintProjectId,
      cintTargetGroupId: studyData.cintTargetGroupId,
      orgId: studyData.orgId,
      campaign: campaignDetailsForResponse,
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
      logger.info(
        `Study ${studyId} status changing to COLLECTING. Cint launch logic deferred for MVP.`,
        {
          userId: clerkUserId,
          orgId,
        }
      );
      finalUpdatedStudy = await db.brandLiftStudy.update({
        where: { id: studyId },
        data: { status: BrandLiftStudyStatus.COLLECTING },
        include: {
          campaign: { select: { campaignName: true, wizard: { select: { orgId: true } } } },
        },
      });
      logger.info('BrandLiftStudy status updated to COLLECTING (Cint launch deferred for MVP)', {
        studyId,
      });
    } else {
      finalUpdatedStudy = await db.brandLiftStudy.update({
        where: { id: studyId },
        data: updateData,
        include: {
          campaign: { select: { campaignName: true, wizard: { select: { orgId: true } } } },
        },
      });
    }

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
