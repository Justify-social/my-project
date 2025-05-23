import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/apiErrorHandler';
import { UnauthenticatedError, ForbiddenError } from '@/lib/errors';

export const GET = async (req: NextRequest) => {
  try {
    const { userId: clerkUserId, sessionClaims } = await auth();
    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required.');
    }

    if (sessionClaims?.['metadata.role'] !== 'super_admin') {
      logger.warn(`User lacking Super Admin role attempted to access Mux assets list.`, {
        clerkUserId,
        metadataRole: sessionClaims?.['metadata.role'],
      });
      throw new ForbiddenError('Access restricted to Super Admins.');
    }

    const muxAssets = await db.creativeAsset.findMany({
      where: {
        OR: [{ muxAssetId: { not: null } }, { muxPlaybackId: { not: null } }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        muxAssetId: true,
        muxPlaybackId: true,
        muxProcessingStatus: true,
        createdAt: true,
        updatedAt: true,
        campaignWizard: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const assetsToReturn = muxAssets.map(asset => ({
      ...asset,
      campaignId: asset.campaignWizard?.id,
      campaignName: asset.campaignWizard?.name,
    }));

    logger.info(`Fetched ${assetsToReturn.length} Mux-related creative assets for debug view.`, {
      userId: clerkUserId,
    });
    return NextResponse.json(assetsToReturn);
  } catch (error: unknown) {
    return handleApiError(error, req);
  }
};
