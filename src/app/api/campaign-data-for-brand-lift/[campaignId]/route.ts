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
      const { userId, orgId } = await auth();
      if (!userId) throw new UnauthenticatedError('User must be authenticated.');
      if (!orgId) throw new ForbiddenError('Organization membership required to access campaigns.');

      const { campaignId } = await paramsPromise;
      const campaignIdNum = parseInt(campaignId);

      if (isNaN(campaignIdNum)) {
        logger.error('Campaign ID missing or invalid in path parameters.', { campaignId });
        throw new BadRequestError('Campaign ID is required and must be a number.');
      }

      logger.info('Fetching campaign by ID for Brand Lift setup', {
        userId,
        orgId,
        campaignId: campaignIdNum,
      });

      const campaign = await prisma.campaignWizardSubmission.findFirst({
        where: {
          id: campaignIdNum,
          userId: userId,
          submissionStatus: SubmissionStatus.submitted,
        },
        select: {
          id: true,
          campaignName: true,
          primaryKPI: true,
          secondaryKPIs: true,
          platform: true,
        },
      });

      if (!campaign) {
        throw new NotFoundError('Completed campaign not found or not accessible.');
      }

      logger.info('Successfully fetched campaign by ID', {
        userId,
        orgId,
        campaignId: campaignIdNum,
      });
      return NextResponse.json(campaign);
    },
    error => handleApiError(error, req)
  );
}
