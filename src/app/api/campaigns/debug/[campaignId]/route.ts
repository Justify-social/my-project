import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, NotFoundError, BadRequestError } from '@/lib/errors';
import { tryCatch } from '@/lib/middleware/api/util-middleware'; // Restore tryCatch
import { z } from 'zod';

// Remove or comment out RouteContext if not used with `any`
// interface RouteContext {
//   params: { campaignId: string };
// }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  // Revert to any for params
  return tryCatch(
    async () => {
      // Restore tryCatch wrapper
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        throw new UnauthenticatedError('User not authenticated');
      }

      const { campaignId } = await params; // Access campaignId from awaited params

      if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
        throw new BadRequestError('Valid Campaign Wizard ID (UUID) is required.');
      }

      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundError('Authenticated user not found in database.');
      }

      const campaignWizard = await prisma.campaignWizard.findUnique({
        where: {
          id: campaignId,
          userId: user.id,
        },
        include: {
          Influencer: true,
          WizardHistory: {
            orderBy: { timestamp: 'asc' },
          },
          submission: {
            include: {
              audience: true,
              creativeAssets: true,
              brandLiftStudies: true,
            },
          },
        },
      });

      if (!campaignWizard) {
        throw new NotFoundError(
          `Campaign Wizard with ID ${campaignId} not found or not accessible by user.`
        );
      }

      logger.info('Successfully fetched Campaign Wizard for debug', {
        campaignId,
        userId: clerkUserId,
      });
      return NextResponse.json(campaignWizard);
    },
    error => handleApiError(error, req)
  ); // Restore tryCatch error handler
}

export {};
