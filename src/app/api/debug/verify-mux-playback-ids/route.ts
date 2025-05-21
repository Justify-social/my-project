import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import { logger } from '@/utils/logger';

/**
 * This endpoint verifies and reports on Mux playback IDs in the database
 * Only accessible to super admin users
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a super admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    // Get all video assets with missing or problematic Mux playback IDs
    const allVideoAssets = await prisma.creativeAsset.findMany({
      where: {
        type: 'video',
      },
      select: {
        id: true,
        name: true,
        type: true,
        muxAssetId: true,
        muxPlaybackId: true,
        muxProcessingStatus: true,
        createdAt: true,
        updatedAt: true,
        url: true,
        campaignWizardId: true,
        submissionId: true,
        campaignWizard: {
          select: {
            name: true,
            id: true,
            submissionId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Analyze assets
    const summary = {
      totalVideoAssets: allVideoAssets.length,
      readyWithPlaybackId: 0,
      missingPlaybackId: 0,
      processingAssets: 0,
      errorAssets: 0,
    };

    const problematicAssets = [];
    const readyAssets = [];

    for (const asset of allVideoAssets) {
      if (asset.muxProcessingStatus === 'READY' && asset.muxPlaybackId) {
        summary.readyWithPlaybackId++;
        readyAssets.push(asset);
      } else if (asset.muxProcessingStatus === 'READY' && !asset.muxPlaybackId) {
        summary.missingPlaybackId++;
        problematicAssets.push({
          ...asset,
          issue: 'Status READY but missing playback ID',
        });
      } else if (asset.muxPlaybackId && asset.muxProcessingStatus !== 'READY') {
        problematicAssets.push({
          ...asset,
          issue: `Has playback ID but status is ${asset.muxProcessingStatus}`,
        });
      } else if (asset.muxProcessingStatus?.includes('ERROR')) {
        summary.errorAssets++;
        problematicAssets.push({
          ...asset,
          issue: `Processing error: ${asset.muxProcessingStatus}`,
        });
      } else {
        summary.processingAssets++;
        problematicAssets.push({
          ...asset,
          issue: `Still processing: ${asset.muxProcessingStatus}`,
        });
      }
    }

    // Find campaign wizards with brand lift studies
    const wizardIds = allVideoAssets.filter(a => a.campaignWizardId).map(a => a.campaignWizardId);

    const brandLiftStudies = await prisma.brandLiftStudy.findMany({
      where: {
        submissionId: {
          in: wizardIds.map(id => parseInt(id as string)).filter(id => !isNaN(id)),
        },
      },
      select: {
        id: true,
        name: true,
        submissionId: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      summary,
      readyAssets: readyAssets.slice(0, 5), // Limit to first 5 for brevity
      problematicAssets: problematicAssets.slice(0, 20), // Limit to first 20 for brevity
      brandLiftStudies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in verify-mux-playback-ids endpoint:', error);
    return NextResponse.json({ error: 'Failed to analyze Mux playback IDs' }, { status: 500 });
  }
}

/**
 * This endpoint can fix specific issues with Mux IDs when needed
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is a super admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    // Get request body
    const { action, assetId, muxPlaybackId } = await req.json();

    if (!action || !assetId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, assetId' },
        { status: 400 }
      );
    }

    // Handle different repair actions
    if (action === 'updatePlaybackId' && muxPlaybackId) {
      // Update an asset's Mux playback ID manually
      await prisma.creativeAsset.update({
        where: { id: assetId },
        data: {
          muxPlaybackId,
          muxProcessingStatus: 'READY',
          url: `https://stream.mux.com/${muxPlaybackId}.m3u8`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Updated Mux playback ID for asset ${assetId} to ${muxPlaybackId}`,
      });
    } else if (action === 'resetProcessingStatus') {
      // Reset the processing status for an asset
      await prisma.creativeAsset.update({
        where: { id: assetId },
        data: {
          muxProcessingStatus: 'MUX_PROCESSING',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Reset processing status for asset ${assetId}`,
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    logger.error('Error in fix-mux-playback-ids endpoint:', error);
    return NextResponse.json({ error: 'Failed to fix Mux playback ID' }, { status: 500 });
  }
}
