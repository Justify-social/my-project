import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// No Zod needed for path param validation here, Next.js handles path params.

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { tryCatch } from '@/lib/middleware/api/util-middleware';
import {
  UnauthenticatedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  DatabaseError,
} from '@/lib/errors';
import { handleApiError } from '@/lib/apiErrorHandler';
import { SubmissionStatus } from '@prisma/client';

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
        select: {
          id: true,
          name: true,
          primaryKPI: true,
          businessGoal: true,
          targetPlatforms: true,
        },
      });

      if (!campaign) {
        throw new NotFoundError('CampaignWizard not found or not accessible by this user.');
      }

      const responseData = {
        id: campaign.id,
        campaignName: campaign.name,
        primaryKPI: campaign.primaryKPI,
        platform: campaign.targetPlatforms?.[0]?.toString() || null,
        audience: { description: campaign.businessGoal },
      };

      logger.info('Successfully fetched CampaignWizard by ID', {
        userId: clerkUserId,
        campaignId: campaignWizardId,
      });
      return NextResponse.json(responseData);
    },
    error => handleApiError(error, req)
  );
}
