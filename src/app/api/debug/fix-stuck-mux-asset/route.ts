import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { muxService } from '@/lib/muxService';
import { logger } from '@/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json({ error: 'Missing assetId' }, { status: 400 });
    }

    logger.info(`[Fix Stuck Asset] Starting manual fix for asset ${assetId}`);

    // Get the asset from our database
    const dbAsset = await prisma.creativeAsset.findUnique({
      where: { id: parseInt(assetId) },
      select: {
        id: true,
        name: true,
        muxAssetId: true,
        muxUploadId: true,
        muxProcessingStatus: true,
        muxPlaybackId: true,
      },
    });

    if (!dbAsset) {
      return NextResponse.json({ error: 'Asset not found in database' }, { status: 404 });
    }

    if (!dbAsset.muxAssetId) {
      return NextResponse.json({ error: 'Asset has no Mux Asset ID' }, { status: 400 });
    }

    logger.info(`[Fix Stuck Asset] Found DB asset:`, {
      id: dbAsset.id,
      name: dbAsset.name,
      muxAssetId: dbAsset.muxAssetId,
      currentStatus: dbAsset.muxProcessingStatus,
      hasPlaybackId: !!dbAsset.muxPlaybackId,
    });

    // Check the actual status with Mux API
    try {
      const muxAssetInfo = await muxService.getAssetPlaybackInfo(dbAsset.muxAssetId);

      logger.info(`[Fix Stuck Asset] Mux API response:`, {
        muxAssetId: dbAsset.muxAssetId,
        status: muxAssetInfo.status,
        playbackIds: muxAssetInfo.playbackIds?.length || 0,
      });

      // If Mux says it's ready but our DB doesn't know
      if (muxAssetInfo.status === 'ready' && dbAsset.muxProcessingStatus !== 'READY') {
        const publicPlaybackId = muxAssetInfo.playbackIds?.find(
          (pid: { id: string; policy: string }) => pid.policy === 'public'
        )?.id;

        if (publicPlaybackId) {
          // Update our database
          const updatedAsset = await prisma.creativeAsset.update({
            where: { id: dbAsset.id },
            data: {
              muxProcessingStatus: 'READY',
              muxPlaybackId: publicPlaybackId,
              url: `https://stream.mux.com/${publicPlaybackId}.m3u8`,
              duration: muxAssetInfo.duration ? Math.round(muxAssetInfo.duration) : null,
            },
          });

          logger.info(`[Fix Stuck Asset] ✅ FIXED! Updated asset ${assetId} to READY status`);

          return NextResponse.json({
            success: true,
            message: 'Asset status fixed! Video is now ready.',
            asset: {
              id: updatedAsset.id,
              name: updatedAsset.name,
              status: updatedAsset.muxProcessingStatus,
              playbackId: updatedAsset.muxPlaybackId,
              url: updatedAsset.url,
            },
          });
        } else {
          return NextResponse.json(
            {
              error: 'Mux asset is ready but has no public playback ID',
              muxStatus: muxAssetInfo.status,
              playbackIds: muxAssetInfo.playbackIds,
            },
            { status: 400 }
          );
        }
      } else if (muxAssetInfo.status === 'ready' && dbAsset.muxProcessingStatus === 'READY') {
        return NextResponse.json({
          success: true,
          message: 'Asset is already marked as ready in our database.',
          currentStatus: dbAsset.muxProcessingStatus,
          muxStatus: muxAssetInfo.status,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Asset is not ready yet on Mux. Current status: ${muxAssetInfo.status}`,
          currentDbStatus: dbAsset.muxProcessingStatus,
          muxStatus: muxAssetInfo.status,
        });
      }
    } catch (muxError) {
      logger.error(`[Fix Stuck Asset] Error checking Mux API:`, muxError);
      return NextResponse.json(
        {
          error: 'Failed to check Mux API',
          details: muxError instanceof Error ? muxError.message : 'Unknown error',
        },
        { status: 502 }
      );
    }
  } catch (error) {
    logger.error('[Fix Stuck Asset] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
