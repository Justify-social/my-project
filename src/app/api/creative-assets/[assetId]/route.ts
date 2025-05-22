import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import Mux from '@mux/mux-node';
import { UnauthenticatedError, NotFoundError, ForbiddenError } from '@/lib/errors';

// Initialize Mux client if not already done globally
// Ensure MUX_TOKEN_ID and MUX_TOKEN_SECRET are in your .env
let muxClient: Mux | null = null;
if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET) {
  muxClient = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });
} else {
  logger.warn(
    '[API CreativeAsset Delete] MUX_TOKEN_ID or MUX_TOKEN_SECRET is not set. Mux asset deletion will be skipped.'
  );
}

export async function DELETE(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ assetId: string }> }
) {
  const params = await paramsPromise;
  const assetIdStr = params.assetId;
  const assetId = parseInt(assetIdStr);

  if (isNaN(assetId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid asset ID format.' },
      { status: 400 }
    );
  }

  logger.info(`DELETE /api/creative-assets/${assetId} - Request received`);

  try {
    const { userId: clerkUserId, orgId } = await auth();

    if (!clerkUserId) {
      throw new UnauthenticatedError('Authentication required to delete an asset.');
    }

    const userRecord = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!userRecord) {
      throw new NotFoundError('User not found, cannot authorize asset deletion.');
    }
    const internalUserId = userRecord.id;

    // Find the creative asset to verify ownership/permissions
    const creativeAsset = await prisma.creativeAsset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        userId: true,
        muxAssetId: true,
        campaignWizard: {
          select: {
            orgId: true,
            userId: true, // User ID on the campaign wizard itself (for legacy checks)
          },
        },
      },
    });

    if (!creativeAsset) {
      throw new NotFoundError('Creative asset not found.');
    }

    // Authorization:
    // 1. User who uploaded it can delete it.
    // 2. If linked to a CampaignWizard, user must have access to that campaign (same org, or legacy owner).
    let authorized = false;
    if (creativeAsset.userId === internalUserId) {
      authorized = true;
    } else if (creativeAsset.campaignWizard) {
      if (creativeAsset.campaignWizard.orgId === orgId) {
        // Check current org context
        authorized = true;
      } else if (
        !creativeAsset.campaignWizard.orgId &&
        creativeAsset.campaignWizard.userId === internalUserId
      ) {
        // Legacy campaign check
        authorized = true;
      }
    }

    if (!authorized) {
      logger.warn(
        `User ${internalUserId} (org: ${orgId}) attempt to delete asset ${assetId} denied. Asset user: ${creativeAsset.userId}, Asset Campaign org: ${creativeAsset.campaignWizard?.orgId}`
      );
      throw new ForbiddenError('You do not have permission to delete this creative asset.');
    }

    // Delete from Mux first (if it's a Mux asset)
    if (creativeAsset.muxAssetId && muxClient) {
      try {
        logger.info(`Attempting to delete Mux asset: ${creativeAsset.muxAssetId}`);
        await muxClient.video.assets.delete(creativeAsset.muxAssetId);
        logger.info(`Successfully deleted Mux asset: ${creativeAsset.muxAssetId}`);
      } catch (muxError: unknown) {
        // Log Mux error but proceed to delete from DB.
        // If Mux asset not found (404), it might have been deleted already or never fully processed.
        if (
          typeof muxError === 'object' &&
          muxError !== null &&
          'type' in muxError &&
          (muxError as any).type === 'not_found'
        ) {
          logger.warn(
            `Mux asset ${creativeAsset.muxAssetId} not found on Mux. Proceeding with DB deletion.`
          );
        } else {
          const message = muxError instanceof Error ? muxError.message : String(muxError);
          logger.error(`Failed to delete Mux asset ${creativeAsset.muxAssetId}: ${message}`, {
            error: muxError,
          });
          // Depending on policy, you might choose to not delete from DB if Mux deletion fails critically.
          // For now, we'll proceed.
        }
      }
    } else if (creativeAsset.muxAssetId && !muxClient) {
      logger.warn(
        `Mux asset ${creativeAsset.muxAssetId} exists, but Mux client is not initialized. Skipping Mux deletion.`
      );
    }

    // Delete from database
    await prisma.creativeAsset.delete({
      where: { id: assetId },
    });

    logger.info(`Successfully deleted CreativeAsset ${assetId} from database.`);
    return NextResponse.json(
      { success: true, message: 'Creative asset deleted successfully.' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`DELETE /api/creative-assets/${assetId} - Error: ${message}`, { error });
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    } else if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 });
    } else if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
