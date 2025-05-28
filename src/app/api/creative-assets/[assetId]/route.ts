import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import Mux from '@mux/mux-node';

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

// PATCH: Update user-editable fields (SSOT)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ FIX: Convert Clerk ID to internal User ID (UUID) to match upload process
    console.log(`[PATCH] Starting with clerkId: ${userId}`);

    const userRecord = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!userRecord) {
      logger.error(`[PATCH] User not found for clerkId: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const internalUserId = userRecord.id;
    console.log(`[PATCH] Converted clerkId ${userId} to internalUserId: ${internalUserId}`);

    const { assetId: assetIdParam } = await params;
    const assetId = parseInt(assetIdParam);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    console.log(`[PATCH] Looking for asset ID: ${assetId} owned by user: ${internalUserId}`);

    // First, let's see if the asset exists at all
    const anyAsset = await prisma.creativeAsset.findUnique({
      where: { id: assetId },
      select: { id: true, userId: true, name: true },
    });

    console.log(`[PATCH] Asset ${assetId} exists check:`, anyAsset);

    // ✅ FIX: Use internal user ID for ownership check
    const existingAsset = await prisma.creativeAsset.findFirst({
      where: {
        id: assetId,
        userId: internalUserId, // Use internal UUID, not Clerk ID
      },
    });

    console.log(`[PATCH] Ownership check result:`, existingAsset ? 'FOUND' : 'NOT FOUND');

    if (!existingAsset) {
      console.log(`[PATCH] Asset ${assetId} not found or not owned by ${internalUserId}`);
      return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const { name, rationale, budget, associatedInfluencerIds } = body;

    // Update user-editable fields
    const updatedAsset = await prisma.creativeAsset.update({
      where: { id: assetId },
      data: {
        ...(name !== undefined && { name }),
        ...(rationale !== undefined && { rationale }),
        ...(budget !== undefined && { budget }),
        ...(associatedInfluencerIds !== undefined && { associatedInfluencerIds }),
        updatedAt: new Date(),
      },
    });

    logger.info(`Asset ${assetId} updated successfully`, {
      updatedFields: { name, rationale, budget, associatedInfluencerIds },
      userId: internalUserId,
      clerkUserId: userId,
    });

    return NextResponse.json({
      success: true,
      asset: updatedAsset,
    });
  } catch (error) {
    logger.error('Error updating creative asset:', { error: error as Error });
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

// DELETE: Remove asset from SSOT and Mux
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  let userId: string | null = null;
  let internalUserId: string | null = null;
  let assetIdParam: string = '';
  let assetId: number = 0;

  try {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[DELETE] Starting with clerkId: ${userId}`);

    // ✅ FIX: Convert Clerk ID to internal User ID (UUID) to match upload process
    const userRecord = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!userRecord) {
      logger.error(`[DELETE] User not found for clerkId: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    internalUserId = userRecord.id;
    console.log(`[DELETE] Converted clerkId ${userId} to internalUserId: ${internalUserId}`);

    const resolvedParams = await params;
    assetIdParam = resolvedParams.assetId;
    assetId = parseInt(assetIdParam);
    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    console.log(`[DELETE] Looking for asset ID: ${assetId} owned by user: ${internalUserId}`);

    // First, let's see if the asset exists at all
    const anyAsset = await prisma.creativeAsset.findUnique({
      where: { id: assetId },
      select: { id: true, userId: true, name: true, muxAssetId: true, muxUploadId: true },
    });

    console.log(`[DELETE] Asset ${assetId} exists check:`, anyAsset);

    // ✅ FIX: Use internal user ID for ownership check
    const existingAsset = await prisma.creativeAsset.findFirst({
      where: {
        id: assetId,
        userId: internalUserId, // Use internal UUID, not Clerk ID
      },
    });

    console.log(`[DELETE] Ownership check result:`, existingAsset ? 'FOUND' : 'NOT FOUND');

    if (!existingAsset) {
      console.log(`[DELETE] Asset ${assetId} not found or not owned by ${internalUserId}`);
      logger.warn(`[DELETE] Asset ${assetId} not found or not owned by user`, {
        assetId,
        internalUserId,
        clerkUserId: userId,
      });
      return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 });
    }

    logger.info(`Starting asset deletion for ID: ${assetId}`, {
      userId: internalUserId,
      clerkUserId: userId,
      muxAssetId: existingAsset.muxAssetId,
      muxUploadId: existingAsset.muxUploadId,
    });

    // Delete from Mux first (if it exists)
    if (muxClient && existingAsset.muxAssetId) {
      try {
        await muxClient.video.assets.delete(existingAsset.muxAssetId);
        logger.info(`Successfully deleted Mux asset: ${existingAsset.muxAssetId}`);
      } catch (muxError) {
        logger.warn(`Failed to delete Mux asset ${existingAsset.muxAssetId}:`, { error: muxError });
        // Continue with database deletion even if Mux deletion fails
      }
    }

    // Delete from database (SSOT)
    await prisma.creativeAsset.delete({
      where: { id: assetId },
    });

    logger.info(`Asset ${assetId} deleted successfully from database`, {
      userId: internalUserId,
      clerkUserId: userId,
    });

    return NextResponse.json({
      success: true,
      message: `Asset ${assetId} deleted successfully`,
    });
  } catch (error) {
    // Provide detailed error logging and response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Error deleting creative asset:', {
      errorMessage,
      errorStack,
      errorType: error?.constructor?.name,
      assetId: assetIdParam,
      userId: internalUserId,
      clerkUserId: userId,
    });

    return NextResponse.json(
      {
        error: 'Failed to delete asset',
        details: errorMessage,
        assetId: assetIdParam,
      },
      { status: 500 }
    );
  }
}
