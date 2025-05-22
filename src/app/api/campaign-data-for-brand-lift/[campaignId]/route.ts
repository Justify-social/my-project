import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// No Zod needed for path param validation here, Next.js handles path params.

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { tryCatch } from '@/lib/middleware/api/util-middleware';
import { UnauthenticatedError, NotFoundError, BadRequestError } from '@/lib/errors';
import { handleApiError } from '@/lib/apiErrorHandler';

// Define a more specific type for assets if their structure is known
interface WizardAsset {
  uploadedAt?: string | Date; // Example field, add others as known
  // Define other known properties of an asset object
  [key: string]: unknown; // Allows for other properties not strictly typed yet
}

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ campaignId: string }> }
) {
  return tryCatch(
    async () => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UnauthenticatedError('Authentication required.');

      const userRecord = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });
      if (!userRecord) {
        logger.error('User record not found for clerkId:', { clerkUserId });
        throw new NotFoundError('User not found.');
      }
      const internalUserId = userRecord.id;

      const { campaignId: campaignWizardId } = await paramsPromise;

      if (!campaignWizardId || typeof campaignWizardId !== 'string') {
        logger.error('Campaign ID (UUID) missing or invalid in path parameters.', {
          campaignWizardId,
        });
        throw new BadRequestError('Campaign ID (UUID) is required.');
      }

      logger.info('Fetching CampaignWizard by ID for Brand Lift setup', {
        userId: clerkUserId,
        campaignId: campaignWizardId,
      });

      const campaign = await prisma.campaignWizard.findFirst({
        where: {
          id: campaignWizardId,
          userId: internalUserId,
        },
        include: {
          Influencer: true,
        },
      });

      if (!campaign) {
        throw new NotFoundError('CampaignWizard not found or not accessible by this user.');
      }

      const campaignWithSerializableDates = {
        ...campaign,
        startDate:
          campaign.startDate instanceof Date
            ? campaign.startDate.toISOString()
            : campaign.startDate,
        endDate:
          campaign.endDate instanceof Date ? campaign.endDate.toISOString() : campaign.endDate,
        assets: campaign.assets
          ? (campaign.assets as WizardAsset[]).map((asset: WizardAsset) => ({
              ...asset,
              uploadedAt:
                asset.uploadedAt instanceof Date
                  ? asset.uploadedAt.toISOString()
                  : asset.uploadedAt,
            }))
          : [],
      };

      logger.info('Successfully fetched full CampaignWizard by ID for Brand Lift Review', {
        userId: clerkUserId,
        campaignId: campaignWizardId,
      });
      return NextResponse.json(campaignWithSerializableDates);
    },
    error => handleApiError(error, req)
  );
}
