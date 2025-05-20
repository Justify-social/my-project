import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/apiErrorHandler';
import { getAuth } from '@clerk/nextjs/server';
import { BrandLiftStudyData } from '@/types/brand-lift'; // Ensure this type includes questions and campaignId
import logger from '@/lib/logger';

const paramsSchema = z.object({
  studyId: z.string(), // BrandLiftStudy.id is a CUID (string)
});

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ studyId: string }> }
) {
  // Log the incoming params object
  const params = await paramsPromise; // Await the params
  console.log('[API /preview-details] Received params:', params);
  logger.info('[API /preview-details] Received params:', { studyId: params.studyId });

  try {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch your internal User record using the clerkId
    const internalUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true }, // Select only the internal UUID
    });

    if (!internalUser) {
      logger.error(`[API /preview-details] No internal user found for clerkId: ${clerkUserId}`);
      return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
    }
    const internalUserId = internalUser.id; // This is your internal DB User ID (UUID)

    // Explicitly pass the expected structure to Zod
    const validation = paramsSchema.safeParse({ studyId: params.studyId });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid studyId format', details: validation.error.format() },
        { status: 400 }
      );
    }
    const { studyId } = validation.data;

    const studyDetailsFromDb = await prisma.brandLiftStudy.findUnique({
      where: { id: studyId },
      include: {
        questions: {
          include: {
            options: { orderBy: { order: 'asc' } },
          },
          orderBy: { order: 'asc' },
        },
        campaign: {
          // This is CampaignWizardSubmission
          select: {
            id: true, // This is CampaignWizardSubmission.id, which is our campaignId for CreativeDataProps API
            userId: true, // For authorization
            campaignName: true, // For BrandLiftStudyData.campaign.campaignName
            // Add other fields from CampaignWizardSubmission if BrandLiftStudyData.campaign needs them
          },
        },
        // approvalStatus: true, // Optionally include if needed directly on this page load
      },
    });

    if (!studyDetailsFromDb) {
      return NextResponse.json({ error: 'Brand Lift Study not found' }, { status: 404 });
    }

    // *** IMPORTANT: Compare internal user IDs ***
    if (studyDetailsFromDb.campaign?.userId !== internalUserId) {
      logger.warn(
        `[API /preview-details] Authorization failed. clerkUserId: ${clerkUserId}, internalUserId: ${internalUserId}, studyCampaignOwnerUserId: ${studyDetailsFromDb.campaign?.userId}`
      );
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this study' },
        { status: 403 }
      );
    }

    // Manual mapping to ensure type compliance and correct campaignId structure
    const responseData: BrandLiftStudyData = {
      id: studyDetailsFromDb.id,
      name: studyDetailsFromDb.name,
      // campaignId here is the foreign key on BrandLiftStudy, which is CampaignWizardSubmission.id
      campaignId: studyDetailsFromDb.submissionId.toString(),
      status: studyDetailsFromDb.status,
      funnelStage: studyDetailsFromDb.funnelStage,
      primaryKpi: studyDetailsFromDb.primaryKpi,
      secondaryKpis: studyDetailsFromDb.secondaryKpis || undefined,
      createdAt: studyDetailsFromDb.createdAt,
      updatedAt: studyDetailsFromDb.updatedAt,
      cintProjectId: studyDetailsFromDb.cintProjectId,
      cintTargetGroupId: studyDetailsFromDb.cintTargetGroupId,
      campaign: studyDetailsFromDb.campaign
        ? {
            campaignName: studyDetailsFromDb.campaign.campaignName,
            // primaryCreativeUrl and primaryCreativeType are not directly on CampaignWizardSubmission
            // They would come from the selected CreativeAsset. For this study details endpoint,
            // we might not need to populate them here if CreativeDataProps handles the specific creative preview.
            // If they *are* needed on BrandLiftStudyData for some other overview purpose, this needs a rethink.
            // For now, satisfying the type, they can be undefined or sourced differently.
          }
        : undefined,
      questions: studyDetailsFromDb.questions.map(q => ({
        // Ensure deep mapping if types differ subtly
        ...q,
        options: q.options.map(o => ({ ...o })),
      })),
      // approvalStatus: studyDetailsFromDb.approvalStatus ? { ...studyDetailsFromDb.approvalStatus, comments: undefined } : undefined,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return handleApiError({
      error,
      message: 'Failed to fetch Brand Lift Study preview details',
      request,
    });
  }
}
