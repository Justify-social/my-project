import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db'; // Use default import for Prisma client
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

export const dynamic = 'force-dynamic';

const duplicateSchema = z.object({
  newName: z.string().min(1, { message: 'New campaign name cannot be empty.' }),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string }> }
) {
  const resolvedParams = await context.params;
  const { campaignId } = resolvedParams;

  const authResult = await auth();
  logger.info('[API Duplicate] Clerk auth() result (awaited):', authResult);

  const { userId: clerkUserId } = authResult;
  if (!clerkUserId) {
    logger.warn('[API Duplicate] Unauthorized: No userId found in authResult.');
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Find the internal user ID based on Clerk ID
  let internalUser;
  try {
    internalUser = await db.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
  } catch (dbError) {
    logger.error('[API Duplicate] Error fetching internal user ID:', dbError);
    return NextResponse.json(
      { success: false, error: 'Server error verifying user.' },
      { status: 500 }
    );
  }

  if (!internalUser || !internalUser.id) {
    logger.warn(`[API Duplicate] No internal user found for clerkId: ${clerkUserId}`);
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }
  const internalUserId = internalUser.id;
  logger.info(
    `[API Duplicate] Found internalUserId: ${internalUserId} for clerkUserId: ${clerkUserId}`
  );

  if (!campaignId) {
    return NextResponse.json(
      { success: false, error: 'Campaign ID is required.' },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    logger.error('[API] Duplicate Campaign - Invalid JSON body:', e);
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const validationResult = duplicateSchema.safeParse(body);
  if (!validationResult.success) {
    logger.warn('[API] Duplicate Campaign - Invalid data:', validationResult.error.flatten());
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid new campaign name.',
        details: validationResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { newName } = validationResult.data;
  logger.info(
    `[API] Attempting to duplicate campaign ${campaignId} for user ${internalUserId} with new name "${newName}"`
  );

  try {
    // Step 1: Check if new name already exists (optional but recommended)
    const existingCount = await db.campaignWizard.count({
      where: {
        name: {
          equals: newName,
          mode: 'insensitive',
        },
        userId: internalUserId, // Check only for the current user
      },
    });

    if (existingCount > 0) {
      logger.warn(
        `[API] Duplicate Campaign - Name "${newName}" already exists for user ${internalUserId}.`
      );
      return NextResponse.json(
        { success: false, error: 'A campaign with this name already exists.' },
        { status: 409 } // Conflict
      );
    }

    // Step 2: Fetch the original campaign data
    const originalCampaign = await db.campaignWizard.findUnique({
      where: { id: campaignId, userId: internalUserId },
    });

    if (!originalCampaign) {
      logger.warn(
        `[API] Duplicate Campaign - Original campaign ${campaignId} not found for user ${internalUserId}.`
      );
      return NextResponse.json(
        { success: false, error: 'Original campaign not found.' },
        { status: 404 }
      );
    }

    // Step 3: Prepare data based on ACTUAL schema
    const {
      id: _oldId,
      createdAt: _oldCreatedAt,
      updatedAt: _oldUpdatedAt,
      userId: _oldUserId,
      orgId: _originalOrgId,
      status: _oldStatus,
      currentStep: _oldCurrentStep,
      step1Complete: _oldStep1Complete,
      step2Complete: _oldStep2Complete,
      step3Complete: _oldStep3Complete,
      step4Complete: _oldStep4Complete,
      isComplete: _oldIsComplete,
      submissionId: _oldSubmissionId,
      ...restOfOriginalCampaignWizard
    } = originalCampaign;

    // Ensure new campaign is in DRAFT state and not linked to old submission
    const newCampaignData: Omit<
      Prisma.CampaignWizardCreateInput,
      'id' | 'user' | 'createdAt' | 'updatedAt'
    > = {
      name: newName,
      businessGoal: restOfOriginalCampaignWizard.businessGoal,
      brand: restOfOriginalCampaignWizard.brand,
      website: restOfOriginalCampaignWizard.website,
      startDate: restOfOriginalCampaignWizard.startDate,
      endDate: restOfOriginalCampaignWizard.endDate,
      timeZone: restOfOriginalCampaignWizard.timeZone,
      primaryContact: restOfOriginalCampaignWizard.primaryContact ?? Prisma.JsonNull,
      secondaryContact: restOfOriginalCampaignWizard.secondaryContact ?? Prisma.JsonNull,
      additionalContacts: restOfOriginalCampaignWizard.additionalContacts ?? Prisma.JsonNull,
      budget: restOfOriginalCampaignWizard.budget ?? Prisma.JsonNull,
      primaryKPI: restOfOriginalCampaignWizard.primaryKPI,
      secondaryKPIs: restOfOriginalCampaignWizard.secondaryKPIs ?? [],
      messaging: restOfOriginalCampaignWizard.messaging ?? Prisma.JsonNull,
      expectedOutcomes: restOfOriginalCampaignWizard.expectedOutcomes ?? Prisma.JsonNull,
      features: restOfOriginalCampaignWizard.features ?? [],
      demographics: restOfOriginalCampaignWizard.demographics ?? Prisma.JsonNull,
      locations:
        (restOfOriginalCampaignWizard.locations as Prisma.InputJsonValue[]) ??
        ([] as Prisma.InputJsonValue[]),
      targeting: restOfOriginalCampaignWizard.targeting ?? Prisma.JsonNull,
      competitors: restOfOriginalCampaignWizard.competitors ?? [],
      assets:
        (restOfOriginalCampaignWizard.assets as Prisma.InputJsonValue[]) ??
        ([] as Prisma.InputJsonValue[]),
      targetPlatforms: restOfOriginalCampaignWizard.targetPlatforms ?? [],
      status: 'DRAFT',
      currentStep: 1,
      step1Complete: true,
      step2Complete: false,
      step3Complete: false,
      step4Complete: false,
      isComplete: false,
    };

    // Step 4: Create the new campaign, connecting the user
    const newCampaignId = uuidv4();

    const duplicatedCampaign = await db.campaignWizard.create({
      data: {
        id: newCampaignId,
        ...newCampaignData,
        user: { connect: { id: internalUserId } },
        updatedAt: new Date(), // Explicitly set updatedAt on creation
      },
    });

    logger.info(
      `[API] Successfully duplicated campaign ${campaignId} to new campaign ${duplicatedCampaign.id} for user ${internalUserId}.`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign duplicated successfully',
        data: { newCampaignId: duplicatedCampaign.id },
      },
      { status: 201 } // Created
    );
  } catch (error) {
    logger.error(`[API] Error duplicating campaign ${campaignId}:`, error);
    // Check for specific Prisma errors if needed
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors (e.g., unique constraints)
    }
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate campaign due to a server error.' },
      { status: 500 }
    );
  }
}
